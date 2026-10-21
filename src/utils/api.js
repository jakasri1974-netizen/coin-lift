const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Centralized API client helper for CoinLift
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('coinlift_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data.error?.code || 'API_ERROR';
      error.details = data.error?.details;
      throw error;
    }

    return data;
  } catch (err) {
    // If Network error / server unreachable, return graceful fallback or rethrow formatted error
    if (!err.status) {
      err.message = err.message || 'Cannot connect to server. Please check your connection.';
    }
    throw err;
  }
}
