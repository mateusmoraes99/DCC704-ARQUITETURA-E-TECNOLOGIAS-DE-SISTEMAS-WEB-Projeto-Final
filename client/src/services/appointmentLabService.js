import api from './api';

const appointmentLabService = {
  // GET meus agendamentos
  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments-labs');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET agendamento específico
  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/appointments-labs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET agendamentos de um laboratório específico
  getLabAppointments: async (labId) => {
    try {
      const response = await api.get(`/appointments-labs/labs/${labId}/appointments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST criar novo agendamento
  createAppointment: async (labId, data) => {
    try {
      const response = await api.post(`/appointments-labs/labs/${labId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT confirmar agendamento (labAdmin)
  confirmAppointment: async (id) => {
    try {
      const response = await api.put(`/appointments-labs/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT rejeitar agendamento (labAdmin)
  rejectAppointment: async (id, motivo) => {
    try {
      const response = await api.put(`/appointments-labs/${id}/reject`, { motivo });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE cancelar agendamento
  cancelAppointment: async (id, motivo) => {
    try {
      const response = await api.delete(`/appointments-labs/${id}`, {
        data: { motivo }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET dias disponíveis (para calendário)
  getAvailableDays: async (labId, month, year) => {
    try {
      const response = await api.get('/appointments-labs/labs/available-days', {
        params: { labId, month, year }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default appointmentLabService;
