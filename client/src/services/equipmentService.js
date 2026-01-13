import api from './api';

const equipmentService = {
  // GET equipamentos de um lab
  getLabEquipment: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/equipment`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET equipamento específico
  getEquipmentById: async (id) => {
    try {
      const response = await api.get(`/labs/equipment/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST criar equipamento
  createEquipment: async (labId, data) => {
    try {
      const response = await api.post(`/labs/${labId}/equipment`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT atualizar equipamento
  updateEquipment: async (id, data) => {
    try {
      const response = await api.put(`/labs/equipment/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE equipamento
  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/labs/equipment/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default equipmentService;
