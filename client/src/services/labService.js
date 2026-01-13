import api from './api';

const labService = {
  // GET todos os labs
  getAllLabs: async () => {
    try {
      const response = await api.get('/labs');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET um lab específico
  getLabById: async (id) => {
    try {
      const response = await api.get(`/labs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET meu lab (para labAdmin)
  getMyLab: async () => {
    try {
      const response = await api.get('/labs/my-lab/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST criar novo lab
  createLab: async (formData) => {
    try {
      const response = await api.post('/labs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT atualizar lab
  updateLab: async (id, formData) => {
    try {
      const response = await api.put(`/labs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE lab
  deleteLab: async (id) => {
    try {
      const response = await api.delete(`/labs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST bloquear dia
  blockDay: async (labId, data, motivo) => {
    try {
      const response = await api.post(`/labs/${labId}/block-day`, {
        data,
        motivo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE desbloquear dia
  unblockDay: async (labId, data) => {
    try {
      const response = await api.delete(`/labs/${labId}/block-day/${encodeURIComponent(data)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET dias bloqueados
  getBlockedDays: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/blocked-days`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET agendamentos do lab
  getLabAppointments: async (labId, status = null) => {
    try {
      let url = `/labs/${labId}/appointments`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET estatísticas do lab
  getLabStats: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default labService;
