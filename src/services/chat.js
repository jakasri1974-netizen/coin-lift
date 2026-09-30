import {
  getSocket,
  connectSocket,
  onSocketEvent,
  joinConversation,
  leaveConversation,
  sendChatMessage,
  sendTyping,
  markRead,
} from './socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cryplift_token') || localStorage.getItem('coinlift_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Chat API request failed');
  }
  return data;
};

export const chatService = {
  // REST APIs
  getConversations: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/chat/conversations${query ? `?${query}` : ''}`);
  },

  getConversation: async (id) => {
    return await fetchAPI(`/chat/conversations/${id}`);
  },

  createOrGetConversation: async (collaborationId) => {
    return await fetchAPI('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ collaborationId }),
    });
  },

  getMessages: async (conversationId, page = 1, limit = 30) => {
    return await fetchAPI(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  sendMessage: async (conversationId, message) => {
    return await fetchAPI(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, text: message }),
    });
  },

  markMessageRead: async (messageId) => {
    return await fetchAPI(`/chat/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },

  markConversationRead: async (conversationId) => {
    return await fetchAPI(`/chat/conversations/${conversationId}/read-all`, {
      method: 'PUT',
    });
  },

  markConversationReadAll: async (conversationId) => {
    return await fetchAPI(`/chat/conversations/${conversationId}/read-all`, {
      method: 'PUT',
    });
  },

  // Socket.IO Helpers
  joinConversation: (conversationId) => {
    joinConversation(conversationId);
  },

  leaveConversation: (conversationId) => {
    leaveConversation(conversationId);
  },

  sendSocketMessage: (conversationId, message) => {
    sendChatMessage(conversationId, message);
  },

  sendTyping: (conversationId, isTyping) => {
    sendTyping(conversationId, isTyping);
  },

  markRead: (conversationId) => {
    markRead(conversationId);
  },

  onMessage: (callback) => onSocketEvent('chat:message', callback),
  onTyping: (callback) => onSocketEvent('chat:typing', callback),
  onRead: (callback) => onSocketEvent('chat:read', callback),
  onOnline: (callback) => onSocketEvent('chat:online', callback),
  onOffline: (callback) => onSocketEvent('chat:offline', callback),
};
