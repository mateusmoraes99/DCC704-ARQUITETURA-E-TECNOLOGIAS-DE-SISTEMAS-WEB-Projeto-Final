import api from './api';

export const serviceService = {
  // Listar todos os serviços
  async getServices(params = {}) {
    try {
      const response = await api.get('/services', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar serviço por ID
  async getServiceById(id) {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Criar serviço (admin)
  async createService(serviceData) {
    try {
      const response = await api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Atualizar serviço (admin)
  async updateService(id, serviceData) {
    try {
      const response = await api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Deletar serviço (admin)
  async deleteService(id) {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Listar categorias
  async getCategories() {
    try {
      const response = await api.get('/services/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};