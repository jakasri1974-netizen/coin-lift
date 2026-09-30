import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Collaboration from '../models/Collaboration.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification, getIO } from '../sockets/socketServer.js';

/**
 * Ensures a conversation exists for a collaboration (creates if not existing)
 */
export const ensureConversationExists = async ({ collaborationId, campaignId, creatorId, projectId }) => {
  try {
    const colId = collaborationId.toString();
    const campId = campaignId ? campaignId.toString() : null;
    const cId = creatorId.toString();
    const pId = projectId.toString();

    if (getIsConnected()) {
      let conversation = await Conversation.findOne({ collaborationId: colId });
      if (!conversation) {
        conversation = await Conversation.create({
          collaborationId: colId,
          campaignId: campId,
          creatorId: cId,
          projectId: pId,
          participants: [cId, pId],
          lastMessageAt: new Date(),
        });
      }
      return conversation;
    } else {
      let conversation = memoryStore.conversations.find((c) => c.collaborationId.toString() === colId);
      if (!conversation) {
        conversation = {
          _id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          collaborationId: colId,
          campaignId: campId,
          creatorId: cId,
          projectId: pId,
          participants: [cId, pId],
          lastMessage: null,
          lastMessageId: null,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryStore.conversations.push(conversation);
      }
      return conversation;
    }
  } catch (err) {
    console.error('[Chat Error] Failed to ensure conversation exists:', err);
    return null;
  }
};

// @desc    Create or get conversation for a collaboration
// @route   POST /api/chat/conversations
// @access  Private
export const createOrGetConversation = async (req, res, next) => {
  try {
    const { collaborationId } = req.body;
    if (!collaborationId) {
      return res.status(400).json({ success: false, message: 'collaborationId is required' });
    }

    if (getIsConnected()) {
      const collaboration = await Collaboration.findById(collaborationId);
      if (!collaboration) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const userId = req.user._id.toString();
      const isParticipant =
        req.user.role === 'admin' ||
        collaboration.creatorId.toString() === userId ||
        collaboration.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const conversation = await ensureConversationExists({
        collaborationId: collaboration._id,
        campaignId: collaboration.campaignId,
        creatorId: collaboration.creatorId,
        projectId: collaboration.projectId,
      });

      const populatedConv = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role profileImage')
        .populate('campaignId', 'title category')
        .populate('collaborationId', 'status progress')
        .populate('lastMessageId');

      return res.json({ success: true, data: populatedConv });
    } else {
      const collab = memoryStore.collaborations.find((c) => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const userId = req.user._id.toString();
      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const conversation = await ensureConversationExists({
        collaborationId: collab._id,
        campaignId: collab.campaignId,
        creatorId: collab.creatorId,
        projectId: collab.projectId,
      });

      return res.json({ success: true, data: conversation });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated user's conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { search = '', page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      let conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name email role profileImage')
        .populate('campaignId', 'title category logoColor')
        .populate('collaborationId', 'status progress deliverables')
        .populate('lastMessageId')
        .sort('-lastMessageAt')
        .lean();

      let formatted = await Promise.all(
        conversations.map(async (conv) => {
          const otherUser = conv.participants.find((p) => p._id?.toString() !== userId) || conv.participants[0];
          const unreadCount = await Message.countDocuments({
            conversationId: conv._id,
            senderId: { $ne: userId },
            isRead: false,
          });

          const lastMsgText = conv.lastMessage || conv.lastMessageId?.text || conv.lastMessageId?.message || null;

          return {
            _id: conv._id,
            conversationId: conv._id,
            collaborationId: conv.collaborationId?._id || conv.collaborationId,
            collaborationStatus: conv.collaborationId?.status || 'active',
            campaignId: conv.campaignId?._id || conv.campaignId,
            campaignTitle: conv.campaignId?.title || 'Web3 Campaign',
            participants: conv.participants,
            otherParticipant: {
              _id: otherUser?._id,
              name: otherUser?.name || 'User',
              role: otherUser?.role || 'creator',
              profileImage: otherUser?.profileImage || '',
            },
            lastMessage: lastMsgText,
            lastMessageAt: conv.lastMessageAt || conv.updatedAt,
            unreadCount,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
          };
        })
      );

      // Search filtering by campaign title or participant name
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        formatted = formatted.filter(
          (c) =>
            (c.campaignTitle && c.campaignTitle.toLowerCase().includes(query)) ||
            (c.otherParticipant?.name && c.otherParticipant.name.toLowerCase().includes(query))
        );
      }

      const total = formatted.length;
      const paginated = formatted.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    } else {
      const userConvs = memoryStore.conversations.filter((c) =>
        c.participants.map((p) => p.toString()).includes(userId)
      );

      let formatted = userConvs.map((conv) => {
        const otherUserId = conv.participants.find((p) => p.toString() !== userId) || conv.participants[0];
        const otherUserObj = memoryStore.users.find((u) => u._id.toString() === otherUserId.toString());
        const collabObj = memoryStore.collaborations.find((c) => c._id.toString() === conv.collaborationId.toString());
        const campObj = memoryStore.campaigns.find((c) => c._id.toString() === (conv.campaignId || '').toString());

        const convMsgs = memoryStore.messages.filter((m) => m.conversationId.toString() === conv._id.toString());
        const lastMsgObj = convMsgs[convMsgs.length - 1];
        const unreadCount = convMsgs.filter((m) => m.senderId.toString() !== userId && !m.isRead).length;

        const lastMsgText = conv.lastMessage || lastMsgObj?.text || lastMsgObj?.message || null;

        return {
          _id: conv._id,
          conversationId: conv._id,
          collaborationId: conv.collaborationId,
          collaborationStatus: collabObj?.status || 'active',
          campaignId: conv.campaignId,
          campaignTitle: campObj?.title || 'Web3 Campaign',
          participants: conv.participants,
          otherParticipant: {
            _id: otherUserObj?._id || otherUserId,
            name: otherUserObj?.name || 'User',
            role: otherUserObj?.role || 'creator',
            profileImage: otherUserObj?.profileImage || '',
          },
          lastMessage: lastMsgText,
          lastMessageAt: conv.lastMessageAt || conv.createdAt,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        formatted = formatted.filter(
          (c) =>
            (c.campaignTitle && c.campaignTitle.toLowerCase().includes(query)) ||
            (c.otherParticipant?.name && c.otherParticipant.name.toLowerCase().includes(query))
        );
      }

      const total = formatted.length;
      const paginated = formatted.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/chat/conversations/:id
// @access  Private
export const getConversationById = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let conversation = await Conversation.findById(conversationId)
        .populate('participants', 'name email role profileImage')
        .populate('campaignId', 'title category logoColor')
        .populate('collaborationId', 'status progress deliverables')
        .populate('lastMessageId');

      if (!conversation) {
        // Try searching by collaborationId if passed
        conversation = await Conversation.findOne({ collaborationId: conversationId })
          .populate('participants', 'name email role profileImage')
          .populate('campaignId', 'title category logoColor')
          .populate('collaborationId', 'status progress deliverables')
          .populate('lastMessageId');
      }

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conversation.participants.some((p) => (p._id ? p._id.toString() : p.toString()) === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      return res.json({ success: true, data: conversation });
    } else {
      let conv = memoryStore.conversations.find(
        (c) => c._id.toString() === conversationId.toString() || c.collaborationId.toString() === conversationId.toString()
      );

      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conv.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      return res.json({ success: true, data: conv });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        conversation = await Conversation.findOne({ collaborationId: conversationId });
      }

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conversation.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      const targetConvId = conversation._id;
      const query = { conversationId: targetConvId };
      const total = await Message.countDocuments(query);

      // Fetch messages sorted newest first for pagination, then reverse for display order
      const rawMessages = await Message.find(query)
        .populate('senderId', 'name email role profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean();

      const messages = rawMessages.reverse().map((m) => ({
        ...m,
        text: m.text || m.message,
        message: m.message || m.text,
      }));

      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: messages.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: messages,
      });
    } else {
      let conv = memoryStore.conversations.find(
        (c) => c._id.toString() === conversationId.toString() || c.collaborationId.toString() === conversationId.toString()
      );

      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conv.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      const allMsgs = memoryStore.messages.filter((m) => m.conversationId.toString() === conv._id.toString());
      const total = allMsgs.length;

      const sortedNewest = [...allMsgs].reverse();
      const paginated = sortedNewest.slice(skip, skip + limitNum).reverse().map((m) => ({
        ...m,
        text: m.text || m.message,
        message: m.message || m.text,
      }));
      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (REST API fallback)
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessageREST = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const rawContent = req.body.text !== undefined ? req.body.text : req.body.message;
    const userId = req.user._id.toString();

    if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content is required and cannot be empty' });
    }

    const trimmedMsg = rawContent.trim();
    if (trimmedMsg.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters' });
    }

    // Link detection
    const isLink = /^https?:\/\/[^\s]+$/i.test(trimmedMsg);
    const messageType = isLink ? 'link' : 'text';

    if (getIsConnected()) {
      let conversation = await Conversation.findById(conversationId).populate('collaborationId');
      if (!conversation) {
        conversation = await Conversation.findOne({ collaborationId: conversationId }).populate('collaborationId');
      }

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conversation.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      if (conversation.collaborationId && ['completed', 'cancelled'].includes(conversation.collaborationId.status)) {
        return res.status(400).json({ success: false, message: 'This collaboration is completed. Chat is read-only.' });
      }

      const recipientId = conversation.participants.find((p) => p.toString() !== userId)?.toString();

      const newMsg = await Message.create({
        conversationId: conversation._id,
        senderId: req.user._id,
        receiverId: recipientId || null,
        content: trimmedMsg,
        text: trimmedMsg,
        message: trimmedMsg,
        messageType,
        isRead: false,
      });

      conversation.lastMessage = trimmedMsg;
      conversation.lastMessageId = newMsg._id;
      conversation.lastMessageAt = newMsg.createdAt;
      await conversation.save();

      const populatedMsg = await Message.findById(newMsg._id).populate('senderId', 'name email role profileImage');

      // Emit Socket.IO event to room
      const io = getIO();
      if (io) {
        const roomName = `conversation:${conversation._id.toString()}`;
        io.to(roomName).emit('chat:message', {
          _id: populatedMsg._id,
          messageId: populatedMsg._id,
          conversationId: conversation._id,
          senderId: userId,
          receiverId: recipientId,
          senderName: req.user.name,
          content: trimmedMsg,
          text: trimmedMsg,
          message: trimmedMsg,
          messageType,
          isRead: false,
          createdAt: populatedMsg.createdAt,
        });
      }

      // Trigger chat notification for recipient if not active in room
      if (recipientId) {
        const campaign = await Campaign.findById(conversation.campaignId);
        await createAndEmitNotification({
          recipientId,
          type: 'chat:new_message',
          title: `New message from ${req.user.name || 'Partner'}`,
          message: `You have a new message in your collaboration "${campaign?.title || 'Campaign'}": ${trimmedMsg.substring(0, 50)}`,
          relatedId: conversation._id,
          relatedType: 'Collaboration',
          extraData: {
            conversationId: conversation._id,
            messageId: populatedMsg._id,
            senderId: userId,
            senderName: req.user.name,
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          ...populatedMsg.toObject(),
          content: trimmedMsg,
          text: trimmedMsg,
          message: trimmedMsg,
        },
      });
    } else {
      let conv = memoryStore.conversations.find(
        (c) => c._id.toString() === conversationId.toString() || c.collaborationId.toString() === conversationId.toString()
      );

      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conv.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
      }

      const collab = memoryStore.collaborations.find((c) => c._id.toString() === conv.collaborationId.toString());
      if (collab && ['completed', 'cancelled'].includes(collab.status)) {
        return res.status(400).json({ success: false, message: 'This collaboration is completed. Chat is read-only.' });
      }

      const recipientId = conv.participants.find((p) => p.toString() !== userId)?.toString();

      const newMsg = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        conversationId: conv._id,
        senderId: userId,
        receiverId: recipientId || null,
        content: trimmedMsg,
        text: trimmedMsg,
        message: trimmedMsg,
        messageType,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
      };
      memoryStore.messages.push(newMsg);

      conv.lastMessage = trimmedMsg;
      conv.lastMessageId = newMsg._id;
      conv.lastMessageAt = newMsg.createdAt;

      if (recipientId) {
        const camp = memoryStore.campaigns.find((c) => c._id.toString() === (conv.campaignId || '').toString());
        await createAndEmitNotification({
          recipientId,
          type: 'chat:new_message',
          title: `New message from ${req.user.name || 'Partner'}`,
          message: `You have a new message in your collaboration "${camp?.title || 'Campaign'}": ${trimmedMsg.substring(0, 50)}`,
          relatedId: conv._id,
          relatedType: 'Collaboration',
          extraData: {
            conversationId: conv._id,
            senderId: userId,
            senderName: req.user.name,
          },
        });
      }

      return res.status(201).json({ success: true, message: 'Message sent successfully', data: newMsg });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single message as read
// @route   PUT /api/chat/messages/:id/read
// @access  Private
export const markMessageRead = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const message = await Message.findById(messageId).populate('conversationId');
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      const conversation = message.conversationId;
      const isParticipant =
        req.user.role === 'admin' ||
        (conversation && conversation.participants.some((p) => p.toString() === userId));

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not a participant in this conversation.' });
      }

      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      return res.json({
        success: true,
        message: 'Message marked as read',
        data: {
          ...message.toObject(),
          text: message.text || message.message,
        },
      });
    } else {
      const msg = memoryStore.messages.find((m) => m._id.toString() === messageId.toString());
      if (!msg) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      const conv = memoryStore.conversations.find((c) => c._id.toString() === msg.conversationId.toString());
      const isParticipant =
        req.user.role === 'admin' ||
        (conv && conv.participants.some((p) => p.toString() === userId));

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not a participant in this conversation.' });
      }

      msg.isRead = true;
      msg.readAt = new Date().toISOString();

      return res.json({ success: true, message: 'Message marked as read', data: msg });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all incoming messages in a conversation as read
// @route   PUT /api/chat/conversations/:id/read-all
// @access  Private
export const markConversationReadAll = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        conversation = await Conversation.findOne({ collaborationId: conversationId });
      }

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conversation.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not a participant in this conversation.' });
      }

      const readAtNow = new Date();
      await Message.updateMany(
        { conversationId: conversation._id, senderId: { $ne: userId }, isRead: false },
        { isRead: true, readAt: readAtNow }
      );

      // Emit chat:read socket event
      const io = getIO();
      if (io) {
        io.to(`conversation:${conversation._id.toString()}`).emit('chat:read', {
          conversationId: conversation._id,
          userId,
          readAt: readAtNow,
        });
      }

      return res.json({ success: true, message: 'All messages marked as read' });
    } else {
      let conv = memoryStore.conversations.find(
        (c) => c._id.toString() === conversationId.toString() || c.collaborationId.toString() === conversationId.toString()
      );

      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        conv.participants.some((p) => p.toString() === userId);

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not a participant in this conversation.' });
      }

      const nowIso = new Date().toISOString();
      memoryStore.messages.forEach((m) => {
        if (m.conversationId.toString() === conv._id.toString() && m.senderId.toString() !== userId) {
          m.isRead = true;
          m.readAt = nowIso;
        }
      });

      return res.json({ success: true, message: 'All messages marked as read' });
    }
  } catch (error) {
    next(error);
  }
};
