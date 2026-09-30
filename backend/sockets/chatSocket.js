import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification } from './socketServer.js';

export const setupChatSocketEvents = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString();

    // Emit chat:online when user connects to the socket server
    socket.emit('chat:online', { userId, status: 'online' });

    // 1. Join Conversation Room
    socket.on('chat:join', async (data = {}) => {
      try {
        const { conversationId } = data;
        if (!conversationId || !userId) return;

        const isAuth = await verifyConversationParticipant(conversationId, userId);
        if (!isAuth) {
          socket.emit('error', { message: 'Unauthorized. Not a participant in this conversation.' });
          return;
        }

        const targetConv = await getConversationRef(conversationId);
        const targetId = targetConv ? targetConv._id.toString() : conversationId.toString();

        const roomName = `conversation:${targetId}`;
        socket.join(roomName);

        // Broadcast online status to room participants
        io.to(roomName).emit('chat:online', {
          userId,
          conversationId: targetId,
        });

        console.log(`[Socket.IO Chat] User ${userId} joined room ${roomName}`);
      } catch (err) {
        console.error('[Socket.IO Chat] Error on chat:join:', err);
      }
    });

    // 2. Leave Conversation Room
    socket.on('chat:leave', async (data = {}) => {
      try {
        const { conversationId } = data;
        if (!conversationId || !userId) return;

        const targetConv = await getConversationRef(conversationId);
        const targetId = targetConv ? targetConv._id.toString() : conversationId.toString();

        const roomName = `conversation:${targetId}`;
        socket.leave(roomName);

        io.to(roomName).emit('chat:offline', {
          userId,
          conversationId: targetId,
        });

        console.log(`[Socket.IO Chat] User ${userId} left room ${roomName}`);
      } catch (err) {
        console.error('[Socket.IO Chat] Error on chat:leave:', err);
      }
    });

    // 3. Send Message via Socket
    socket.on('chat:send', async (data = {}) => {
      try {
        const { conversationId } = data;
        const messageText = data.text !== undefined ? data.text : data.message;

        if (!conversationId || !messageText || typeof messageText !== 'string') return;

        const trimmed = messageText.trim();
        if (trimmed.length === 0 || trimmed.length > 2000) {
          socket.emit('error', { message: 'Invalid message length' });
          return;
        }

        const isAuth = await verifyConversationParticipant(conversationId, userId);
        if (!isAuth) {
          socket.emit('error', { message: 'Unauthorized. Not a participant in this conversation.' });
          return;
        }

        // Link detection
        const isLink = /^https?:\/\/[^\s]+$/i.test(trimmed);
        const messageType = isLink ? 'link' : 'text';

        let savedMessage = null;
        let recipientId = null;
        let campaignTitle = 'Campaign';
        let targetConvId = conversationId;

        if (getIsConnected()) {
          let conversation = await Conversation.findById(conversationId).populate('collaborationId');
          if (!conversation) {
            conversation = await Conversation.findOne({ collaborationId: conversationId }).populate('collaborationId');
          }

          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }

          if (conversation.collaborationId && ['completed', 'cancelled'].includes(conversation.collaborationId.status)) {
            socket.emit('error', { message: 'This collaboration is completed. Chat is read-only.' });
            return;
          }

          targetConvId = conversation._id.toString();
          recipientId = conversation.participants.find((p) => p.toString() !== userId)?.toString();

          const msgDoc = await Message.create({
            conversationId: conversation._id,
            senderId: userId,
            receiverId: recipientId || null,
            content: trimmed,
            text: trimmed,
            message: trimmed,
            messageType,
            isRead: false,
          });

          conversation.lastMessage = trimmed;
          conversation.lastMessageId = msgDoc._id;
          conversation.lastMessageAt = msgDoc.createdAt;
          await conversation.save();

          savedMessage = await Message.findById(msgDoc._id).populate('senderId', 'name email role profileImage');

          const campDoc = await Campaign.findById(conversation.campaignId);
          if (campDoc) campaignTitle = campDoc.title;
        } else {
          let conv = memoryStore.conversations.find(
            (c) => c._id.toString() === conversationId.toString() || c.collaborationId.toString() === conversationId.toString()
          );

          if (!conv) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }

          targetConvId = conv._id.toString();
          recipientId = conv.participants.find((p) => p.toString() !== userId)?.toString();

          const collab = memoryStore.collaborations.find((c) => c._id.toString() === conv.collaborationId.toString());
          if (collab && ['completed', 'cancelled'].includes(collab.status)) {
            socket.emit('error', { message: 'This collaboration is completed. Chat is read-only.' });
            return;
          }

          savedMessage = {
            _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            conversationId: conv._id,
            senderId: userId,
            receiverId: recipientId || null,
            content: trimmed,
            text: trimmed,
            message: trimmed,
            messageType,
            isRead: false,
            readAt: null,
            createdAt: new Date().toISOString(),
          };
          memoryStore.messages.push(savedMessage);

          conv.lastMessage = trimmed;
          conv.lastMessageId = savedMessage._id;
          conv.lastMessageAt = savedMessage.createdAt;

          const camp = memoryStore.campaigns.find((c) => c._id.toString() === (conv.campaignId || '').toString());
          if (camp) campaignTitle = camp.title;
        }

        const roomName = `conversation:${targetConvId}`;

        // Get sender details
        let senderName = socket.user.name || 'User';
        if (!socket.user.name && getIsConnected()) {
          const uDoc = await User.findById(userId).select('name');
          if (uDoc) senderName = uDoc.name;
        }

        // Broadcast saved message to conversation room
        io.to(roomName).emit('chat:message', {
          _id: savedMessage._id,
          messageId: savedMessage._id,
          conversationId: targetConvId,
          senderId: userId,
          receiverId: recipientId,
          senderName,
          content: trimmed,
          text: trimmed,
          message: trimmed,
          messageType,
          isRead: false,
          createdAt: savedMessage.createdAt,
        });

        // Trigger notification if recipient is not in active chat room
        if (recipientId) {
          const activeRoomClients = io.sockets.adapter.rooms.get(roomName);
          let recipientInRoom = false;

          if (activeRoomClients) {
            for (const clientId of activeRoomClients) {
              const clientSocket = io.sockets.sockets.get(clientId);
              if (clientSocket && clientSocket.user?._id?.toString() === recipientId) {
                recipientInRoom = true;
                break;
              }
            }
          }

          if (!recipientInRoom) {
            await createAndEmitNotification({
              recipientId,
              type: 'chat:new_message',
              title: `New message from ${senderName}`,
              message: `New message in "${campaignTitle}": ${trimmed.substring(0, 50)}`,
              relatedId: targetConvId,
              relatedType: 'Collaboration',
              extraData: {
                conversationId: targetConvId,
                senderId: userId,
                senderName,
              },
            });
          }
        }
      } catch (err) {
        console.error('[Socket.IO Chat] Error on chat:send:', err);
      }
    });

    // 4. Typing Indicator
    socket.on('chat:typing', async (data = {}) => {
      try {
        const { conversationId, isTyping } = data;
        if (!conversationId) return;

        const isAuth = await verifyConversationParticipant(conversationId, userId);
        if (!isAuth) return;

        const targetConv = await getConversationRef(conversationId);
        const targetId = targetConv ? targetConv._id.toString() : conversationId.toString();

        const roomName = `conversation:${targetId}`;
        socket.to(roomName).emit('chat:typing', {
          conversationId: targetId,
          userId,
          userName: socket.user.name || 'User',
          isTyping: !!isTyping,
        });
      } catch (err) {
        console.error('[Socket.IO Chat] Error on chat:typing:', err);
      }
    });

    // 5. Read Receipt Socket Event
    socket.on('chat:read', async (data = {}) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        const isAuth = await verifyConversationParticipant(conversationId, userId);
        if (!isAuth) return;

        const targetConv = await getConversationRef(conversationId);
        const targetId = targetConv ? targetConv._id.toString() : conversationId.toString();

        const roomName = `conversation:${targetId}`;
        io.to(roomName).emit('chat:read', {
          conversationId: targetId,
          userId,
          readAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket.IO Chat] Error on chat:read:', err);
      }
    });
  });
};

/**
 * Helper to get conversation reference (either by _id or collaborationId)
 */
const getConversationRef = async (id) => {
  try {
    if (getIsConnected()) {
      let conv = await Conversation.findById(id);
      if (!conv) conv = await Conversation.findOne({ collaborationId: id });
      return conv;
    } else {
      return memoryStore.conversations.find(
        (c) => c._id.toString() === id.toString() || c.collaborationId.toString() === id.toString()
      );
    }
  } catch (err) {
    return null;
  }
};

/**
 * Helper to verify user is a participant of conversation
 */
const verifyConversationParticipant = async (conversationId, userId) => {
  try {
    const conv = await getConversationRef(conversationId);
    if (!conv) return false;
    return conv.participants.some((p) => (p._id ? p._id.toString() : p.toString()) === userId.toString());
  } catch (err) {
    return false;
  }
};
