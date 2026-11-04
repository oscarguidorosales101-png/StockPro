import { api } from './api';

export const movimientoService = {
  async getAll(filters = {}) {
    const res = await api.get('/movimientos', filters);
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/movimientos/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/movimientos', data);
  },

  async update(id, data) {
    return api.put(`/movimientos/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/movimientos/${id}`);
  }
};

