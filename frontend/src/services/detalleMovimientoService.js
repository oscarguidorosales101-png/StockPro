import { api } from './api';

export const detalleMovimientoService = {
  async getAll(params = {}) {
    const res = await api.get('/detalle-movimientos', params);
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/detalle-movimientos/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/detalle-movimientos', data);
  },

  async update(id, data) {
    return api.put(`/detalle-movimientos/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/detalle-movimientos/${id}`);
  }
};

