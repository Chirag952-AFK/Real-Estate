import { clearToken, getToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    const message = typeof data === 'string' ? data : data.message || 'Request failed';
    throw new Error(message);
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const getProperties = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'All') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return request(`/api/properties${queryString ? `?${queryString}` : ''}`);
};

export const getFilterOptions = () => request('/api/properties/filters');

export const getPropertyById = (id) => request(`/api/properties/${id}`);

export const createProperty = (propertyData) =>
  request('/api/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });

export const updateProperty = (id, propertyData) =>
  request(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });

export const deleteProperty = (id) =>
  request(`/api/properties/${id}`, {
    method: 'DELETE',
  });
