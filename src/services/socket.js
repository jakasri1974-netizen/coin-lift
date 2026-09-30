import { io } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socket = null;
let statusListeners = new Set();
let currentStatus = 'disconnected'; // 'connecting', 'connected', 'disconnected'

const notifyStatus = (status) => {
  currentStatus = status;
  statusListeners.forEach((listener) => listener(status));
};

export const connectSocket = () => {
  const token = getToken();

  if (!token) {
    disconnectSocket();
    return null;
  }

  // Reuse existing active socket
  if (socket && socket.connected) {
    return socket;
  }

  // Disconnect existing socket if reconnection needed
  if (socket) {
    socket.disconnect();
  }

  notifyStatus('connecting');

  socket = io(SOCKET_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO Frontend] Connected to real-time server:', socket.id);
    notifyStatus('connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Frontend] Disconnected:', reason);
    notifyStatus('disconnected');
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.IO Frontend] Connection error:', error.message);
    notifyStatus('disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  notifyStatus('disconnected');
};

export const getSocket = () => socket;

export const getSocketStatus = () => currentStatus;

export const subscribeSocketStatus = (callback) => {
  statusListeners.add(callback);
  callback(currentStatus);
  return () => {
    statusListeners.delete(callback);
  };
};

export const onSocketEvent = (event, callback) => {
  if (!socket) {
    connectSocket();
  }
  if (socket) {
    socket.on(event, callback);
  }

  return () => {
    if (socket) {
      socket.off(event, callback);
    }
  };
};

export const offSocketEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// --- Chat Socket Helpers ---

export const joinConversation = (conversationId) => {
  const s = connectSocket();
  if (s) {
    s.emit('chat:join', { conversationId });
  }
};

export const leaveConversation = (conversationId) => {
  const s = getSocket();
  if (s) {
    s.emit('chat:leave', { conversationId });
  }
};

export const sendChatMessage = (conversationId, text) => {
  const s = connectSocket();
  if (s) {
    s.emit('chat:send', { conversationId, text, message: text });
  }
};

export const sendTyping = (conversationId, isTyping) => {
  const s = getSocket();
  if (s) {
    s.emit('chat:typing', { conversationId, isTyping });
  }
};

export const markRead = (conversationId) => {
  const s = getSocket();
  if (s) {
    s.emit('chat:read', { conversationId });
  }
};
