import api from './client';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    // If userData is FormData (with signature file), headers adjust automatically
    const isFormData = userData instanceof FormData;
    const res = await api.post('/auth/register', userData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateSignature: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await api.put('/auth/signature', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  }
};
