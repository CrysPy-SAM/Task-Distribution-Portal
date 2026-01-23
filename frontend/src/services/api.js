import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Agent APIs
export const agentAPI = {
  createAgent: (agentData) => api.post('/agents', agentData),
  getAllAgents: () => api.get('/agents'),
  getAgentById: (id) => api.get(`/agents/${id}`),
  updateAgent: (id, agentData) => api.put(`/agents/${id}`, agentData),
  deleteAgent: (id) => api.delete(`/agents/${id}`),
};

// Lead APIs
export const leadAPI = {
  uploadLeads: (formData) => {
    return api.post('/leads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAllLeads: () => api.get('/leads'),
  getLeadsByAgent: (agentId) => api.get(`/leads/agent/${agentId}`),
  getDistribution: () => api.get('/leads/distribution'),
  deleteAllLeads: () => api.delete('/leads'),
};

export default api;