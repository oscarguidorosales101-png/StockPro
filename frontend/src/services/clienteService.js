import { api } from './api';

export const clienteService = {
  async getAll(filters = {}) {
    const res = await api.get('/clientes', filters);
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/clientes/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/clientes', data);
  },

  async update(id, data) {
    return api.put(`/clientes/${id}`, data);
  },

  async toggleEstado(id) {
    return api.patch(`/clientes/${id}/estado`);
  },

  async delete(id) {
    return api.delete(`/clientes/${id}`);
  }
};

