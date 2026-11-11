const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'authToken';

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const registerUser = (data) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const loginUser = (data) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getCurrentUser = () => request('/api/auth/me');

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
