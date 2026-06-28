import api from '../lib/api';

export const categoryService = {
  getCategories: async (page = 1, pageSize = 10) => {
    return await api.get(`/categories?page=${page}&pageSize=${pageSize}`);
  },
  createCategory: async (data: { name: string; description?: string }) => {
    return await api.post('/categories', data);
  },
  updateCategory: async (id: string, data: { name: string; description?: string }) => {
    return await api.put(`/categories/${id}`, data);
  },
  deleteCategory: async (id: string) => {
    return await api.delete(`/categories/${id}`);
  }
};
