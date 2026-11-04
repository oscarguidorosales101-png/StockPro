import { api } from './api';

export const proveedorService = {
  async getAll() {
    const res = await api.get('/proveedores');
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/proveedores/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/proveedores', data);
  },

  async update(id, data) {
    return api.put(`/proveedores/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/proveedores/${id}`);
  }
};

