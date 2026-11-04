import { api } from './api';

export const productoService = {
  async getAll() {
    const res = await api.get('/productos');
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/productos/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/productos', data);
  },

  async update(id, data) {
    return api.put(`/productos/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/productos/${id}`);
  }
};

