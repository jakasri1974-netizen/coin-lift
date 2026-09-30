import { FEATURED_PROJECTS } from '../data/projectsData';
import { CREATORS } from '../data/creatorsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token Management
export const getToken = () => localStorage.getItem('cryplift_token') || localStorage.getItem('coinlift_token');
export const setToken = (token) => {
  localStorage.setItem('cryplift_token', token);
  localStorage.setItem('coinlift_token', token);
};
export const removeToken = () => {
  localStorage.removeItem('cryplift_token');
  localStorage.removeItem('coinlift_token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('cryplift_user') || localStorage.getItem('coinlift_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('cryplift_user', JSON.stringify(user));
  localStorage.setItem('coinlift_user', JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem('cryplift_user');
  localStorage.removeItem('coinlift_user');
};

// Generic Fetch Wrapper
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
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
    const errorMsg = data.message || (data.errors && data.errors[0]?.msg) || 'API Request failed';
    throw new Error(errorMsg);
  }
  return data;
};

// 1. Auth Service (Real HTTP Requests only - NO mock fallbacks)
export const authService = {
  login: async (email, password) => {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      setToken(res.data.token);
      setCurrentUser(res.data);
    }
    return res;
  },

  register: async (userData) => {
    const res = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.data?.token) {
      setToken(res.data.token);
      setCurrentUser(res.data);
    }
    return res;
  },

  getMe: async () => {
    return await fetchAPI('/auth/me');
  },

  logout: () => {
    removeToken();
    removeCurrentUser();
  }
};

// 2. Creators Service
export const creatorsService = {
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/creators?${query}`);
  },

  getById: async (id) => {
    return await fetchAPI(`/creators/${id}`);
  },

  getMyProfile: async () => {
    return await fetchAPI('/creators/me');
  },

  updateProfile: async (profileData) => {
    return await fetchAPI('/creators/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
};

// 3. Projects Service
export const projectsService = {
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/projects?${query}`);
  },

  getById: async (id) => {
    return await fetchAPI(`/projects/${id}`);
  },

  getMyProfile: async () => {
    return await fetchAPI('/projects/me');
  },

  updateProfile: async (profileData) => {
    return await fetchAPI('/projects/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
};

// 4. Campaigns Service
export const campaignsService = {
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/campaigns?${query}`);
  },

  getById: async (id) => {
    return await fetchAPI(`/campaigns/${id}`);
  },

  create: async (campaignData) => {
    return await fetchAPI('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  },

  apply: async (campaignId, message) => {
    return await fetchAPI(`/campaigns/${campaignId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
};

// 5. Applications Service
export const applicationsService = {
  getMyApplications: async () => {
    return await fetchAPI('/applications/my');
  },

  updateStatus: async (applicationId, status) => {
    return await fetchAPI(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

// 6. Collaborations Service
export const collaborationsService = {
  getMyCollaborations: async () => {
    return await fetchAPI('/collaborations/my');
  },

  getById: async (id) => {
    return await fetchAPI(`/collaborations/${id}`);
  },

  update: async (id, updateData) => {
    return await fetchAPI(`/collaborations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }
};

// 7. Dashboard Service
export const dashboardService = {
  getCreatorDashboard: async () => {
    return await fetchAPI('/dashboard/creator');
  },

  getProjectDashboard: async () => {
    return await fetchAPI('/dashboard/project');
  }
};

// 8. Notifications Service
export const notificationsService = {
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/notifications?${query}`);
  },

  getUnreadCount: async () => {
    return await fetchAPI('/notifications/unread-count');
  },

  markAsRead: async (id) => {
    return await fetchAPI(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return await fetchAPI('/notifications/read-all', {
      method: 'PUT',
    });
  }
};

// 9. Chat Service
export const chatService = {
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

  sendMessage: async (conversationId, text) => {
    return await fetchAPI(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: text, text }),
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
};

// 10. Agreements Service
export const agreementsService = {
  getAgreements: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchAPI(`/agreements${query ? `?${query}` : ''}`);
  },

  getAgreement: async (id) => {
    return await fetchAPI(`/agreements/${id}`);
  },

  createAgreement: async (agreementData) => {
    return await fetchAPI('/agreements', {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
  },

  updateAgreement: async (id, updateData) => {
    return await fetchAPI(`/agreements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  acceptAgreement: async (id) => {
    return await fetchAPI(`/agreements/${id}/accept`, {
      method: 'PUT',
    });
  },

  rejectAgreement: async (id) => {
    return await fetchAPI(`/agreements/${id}/reject`, {
      method: 'PUT',
    });
  },

  cancelAgreement: async (id) => {
    return await fetchAPI(`/agreements/${id}/cancel`, {
      method: 'PUT',
    });
  },
};

export const analyticsService = {
  getCampaignAnalytics: async (campaignId) => {
    return await fetchAPI(`/analytics/campaigns/${campaignId}`);
  },

  getCollaborationAnalytics: async (collaborationId) => {
    return await fetchAPI(`/analytics/collaborations/${collaborationId}`);
  },

  getCreatorAnalytics: async (creatorId) => {
    return await fetchAPI(`/analytics/creators/${creatorId}`);
  },

  getProjectAnalytics: async (projectId) => {
    return await fetchAPI(`/analytics/projects/${projectId}`);
  },

  getAnalyticsOverview: async () => {
    return await fetchAPI('/analytics/overview');
  },

  updateCollaborationAnalytics: async (collaborationId, data) => {
    return await fetchAPI(`/analytics/collaborations/${collaborationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  createAnalyticsSnapshot: async (collaborationId) => {
    return await fetchAPI(`/analytics/collaborations/${collaborationId}/snapshot`, {
      method: 'POST',
    });
  },

  getAnalyticsHistory: async (collaborationId) => {
    return await fetchAPI(`/analytics/collaborations/${collaborationId}/history`);
  },
};


