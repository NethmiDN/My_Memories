import axios from 'axios';

const GATEWAY_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: GATEWAY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Service API calls (MySQL)
export const getUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/api/users', userData);
  return response.data;
};

// Event Service API calls (MongoDB)
export const getEvents = async () => {
  const response = await api.get('/api/events');
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/api/events', eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/api/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/api/events/${id}`);
  return response.data;
};

export const attachImageToEvent = async (eventId, imageUrl) => {
  const response = await api.patch(`/api/events/${eventId}/images`, { imageUrl });
  return response.data;
};

// Media Service API calls (GCP Storage)
export const uploadMedia = async (file, eventId) => {
  const formData = new FormData();
  formData.append('file', file);
  if (eventId) {
    formData.append('eventId', eventId);
  }

  const response = await axios.post(`${GATEWAY_BASE_URL}/api/media/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Microservices Mesh Health Status Checks
export const checkMeshStatus = async () => {
  const services = [
    { key: 'gateway', name: 'API Gateway (:8080)', url: `${GATEWAY_BASE_URL}/actuator/health` },
    { key: 'users', name: 'User Service (:8081)', url: `${GATEWAY_BASE_URL}/api/users` },
    { key: 'events', name: 'Event Service (:8082)', url: `${GATEWAY_BASE_URL}/api/events` },
    { key: 'media', name: 'Media Service (:8083)', url: `${GATEWAY_BASE_URL}/api/media` },
  ];

  const results = {};

  for (const s of services) {
    try {
      const res = await fetch(s.url, { method: 'OPTIONS' }).catch(() => fetch(s.url, { method: 'GET' }));
      results[s.key] = res.ok || res.status === 405 || res.status === 404;
    } catch {
      results[s.key] = false;
    }
  }

  return results;
};

export default api;
