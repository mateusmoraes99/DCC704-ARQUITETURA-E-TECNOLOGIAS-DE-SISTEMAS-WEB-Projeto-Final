import api from './api';

export const userService = {
  // Listar usuários (admin)
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Listar profissionais
  async getProfessionals() {
    try {
      const response = await api.get('/users/professionals');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar usuário por ID (admin)
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};