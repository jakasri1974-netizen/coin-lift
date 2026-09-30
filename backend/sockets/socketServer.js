import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socketAuth.js';
import Notification from '../models/Notification.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

import { setupChatSocketEvents } from './chatSocket.js';

let io = null;

export const initSocketServer = (httpServer) => {
  const allowedOrigins = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins
        ? (allowedOrigins.includes(',') ? allowedOrigins.split(',').map(s => s.trim()) : allowedOrigins)
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authenticate connections with JWT
  io.use(socketAuthMiddleware);

  // Setup Chat Socket Events
  setupChatSocketEvents(io);

  io.on('connection', (socket) => {
    const userId = socket.user?._id;
    const userRoom = `user:${userId}`;

    // Automatically join private user room
    socket.join(userRoom);
    console.log(`[Socket.IO] Authenticated connection established for user ${userId} in room ${userRoom}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] User ${userId} disconnected (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Socket server not initialized yet');
  }
  return io;
};

/**
 * Creates a notification in MongoDB (or memoryStore) AND emits real-time Socket.IO events to recipient room
 */
export const createAndEmitNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
  extraData = {},
}) => {
  try {
    const targetUserId = recipientId ? recipientId.toString() : null;
    if (!targetUserId) return null;

    let notificationObj = null;

    if (getIsConnected()) {
      const doc = await Notification.create({
        recipientId: targetUserId,
        type,
        title,
        message,
        relatedId: relatedId ? relatedId.toString() : null,
        relatedType,
      });
      notificationObj = doc.toObject();
    } else {
      notificationObj = {
        _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientId: targetUserId,
        type,
        title,
        message,
        relatedId: relatedId ? relatedId.toString() : null,
        relatedType,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      memoryStore.notifications.unshift(notificationObj);
    }

    // Prepare socket event payload
    const payload = {
      ...notificationObj,
      ...extraData,
    };

    // Emit real-time socket events if Socket.IO server is active
    if (io) {
      const room = `user:${targetUserId}`;
      // Specific event type (e.g. 'application:new', 'collaboration:updated')
      io.to(room).emit(type, payload);
      // General new notification event
      io.to(room).emit('notification:new', payload);
      console.log(`[Socket.IO] Emitted event '${type}' to room ${room}`);
    }

    return notificationObj;
  } catch (err) {
    console.error('[Notification Error] Failed to create or emit notification:', err);
    return null;
  }
};
