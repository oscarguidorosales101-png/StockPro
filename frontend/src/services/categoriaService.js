import { api } from './api';

export const categoriaService = {
  async getAll() {
    const res = await api.get('/categorias');
    return res.data || [];
  },

  async getById(id) {
    const res = await api.get(`/categorias/${id}`);
    return res.data;
  },

  async create(data) {
    return api.post('/categorias', data);
  },

  async update(id, data) {
    return api.put(`/categorias/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/categorias/${id}`);
  }
};

