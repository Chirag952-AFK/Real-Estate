const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const getProperties = () => request('/api/properties');

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
