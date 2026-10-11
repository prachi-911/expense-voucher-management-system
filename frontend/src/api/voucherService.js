import api from './client';

export const voucherService = {
  getDashboardStats: async () => {
    const res = await api.get('/vouchers/dashboard');
    return res.data;
  },

  getVouchers: async (params = {}) => {
    const res = await api.get('/vouchers', { params });
    return res.data;
  },

  getVoucherById: async (id) => {
    const res = await api.get(`/vouchers/${id}`);
    return res.data;
  },

  createVoucher: async (voucherData) => {
    const isFormData = voucherData instanceof FormData;
    const res = await api.post('/vouchers', voucherData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },

  updateDraftVoucher: async (id, voucherData) => {
    const isFormData = voucherData instanceof FormData;
    const res = await api.put(`/vouchers/${id}`, voucherData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },

  submitVoucher: async (id, data = {}) => {
    const isFormData = data instanceof FormData;
    const res = await api.post(`/vouchers/${id}/submit`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },

  deleteDraftVoucher: async (id) => {
    const res = await api.delete(`/vouchers/${id}`);
    return res.data;
  },

  approveVoucher: async (id, data = {}) => {
    const isFormData = data instanceof FormData;
    const res = await api.post(`/vouchers/${id}/approve`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return res.data;
  },

  rejectVoucher: async (id, data) => {
    const res = await api.post(`/vouchers/${id}/reject`, data);
    return res.data;
  }
};
