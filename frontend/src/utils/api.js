import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

export const serviceAccountAPI = {
  upload: (formData) => api.post('/api/service-accounts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/api/service-accounts'),
};

export const appAPI = {
  getAll: (serviceAccountId) => api.get('/api/apps', { params: { service_account_id: serviceAccountId } }),
  sync: (serviceAccountId) => api.post('/api/apps/sync', null, { params: { service_account_id: serviceAccountId } }),
  add: (packageNames, serviceAccountId) => api.post('/api/apps/add', 
    { package_names: packageNames }, 
    { params: { service_account_id: serviceAccountId } }
  ),
  getListing: (appId, language = 'en') => api.get(`/api/apps/${appId}/listing`, { 
    params: { language } 
  }),
  delete: (appId) => api.delete(`/api/apps/${appId}`),
  uploadAAB: (formData) => api.post('/api/apps/upload-aab', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const listingAPI = {
  update: (data, serviceAccountId) => api.post('/api/listings/update', data, {
    params: { service_account_id: serviceAccountId }
  }),
  saveDraft: (data, serviceAccountId) => api.post('/api/listings/save-draft', data, {
    params: { service_account_id: serviceAccountId }
  }),
  submitForReview: (data, serviceAccountId) => api.post('/api/listings/submit-for-review', data, {
    params: { service_account_id: serviceAccountId }
  }),
  translate: (data) => api.post('/api/translate', data),
};

export const graphicAPI = {
  upload: (formData) => api.post('/api/graphics/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (appId) => api.get(`/api/graphics/list/${appId}`),
  delete: (graphicId) => api.delete(`/api/graphics/delete/${graphicId}`),
};

export const templateAPI = {
  create: (data) => api.post('/api/templates', data),
  getAll: () => api.get('/api/templates'),
};

export const testingAPI = {
  addTesters: (packageName, emails, track, serviceAccountId) => 
    api.post('/api/testing/add-testers', {
      package_name: packageName,
      emails,
      track
    }, { params: { service_account_id: serviceAccountId } }),
  
  createRelease: (packageName, track, releaseNotes, serviceAccountId) => 
    api.post('/api/testing/create-release', null, {
      params: {
        package_name: packageName,
        track,
        release_notes: releaseNotes,
        service_account_id: serviceAccountId
      }
    }),
  
  getLink: (packageName, track, serviceAccountId) => 
    api.get('/api/testing/link', {
      params: {
        package_name: packageName,
        track,
        service_account_id: serviceAccountId
      }
    }),
  
  getTrackStatus: (packageName, serviceAccountId) =>
    api.get('/api/testing/track-status', {
      params: {
        package_name: packageName,
        service_account_id: serviceAccountId
      }
    }),
  
  getStats: (packageName, serviceAccountId) =>
    api.get('/api/testing/stats', {
      params: {
        package_name: packageName,
        service_account_id: serviceAccountId
      }
    })
};

export const aiAPI = {
  analyze: (data) => api.post('/api/ai/analyze', data),
};

export const deployAPI = {
  fullDeploy: (data, serviceAccountId) => 
    api.post(`/api/full-deploy?service_account_id=${serviceAccountId}`, data),
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  getApps: () => api.get('/api/admin/apps'),
  updateUser: (userId, data) => api.put(`/api/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
};

export const supportAPI = {
  getTickets: () => api.get('/api/support/tickets'),
  getTicket: (id) => api.get(`/api/support/tickets/${id}`),
  createTicket: (data) => api.post('/api/support/tickets', data),
  addMessage: (ticketId, message) => api.post(`/api/support/tickets/${ticketId}/messages`, { message }),
  updateStatus: (ticketId, status) => api.put(`/api/support/tickets/${ticketId}/status`, { status }),
};

export default api;
