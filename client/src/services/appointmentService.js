import api from './api';

export const appointmentService = {
  // Listar agendamentos
  async getAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar agendamento por ID
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Criar agendamento
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Atualizar agendamento
  async updateAppointment(id, appointmentData) {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Deletar agendamento
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar horários disponíveis
  async getAvailableSlots(date, serviceId, professionalId) {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { date, serviceId, professionalId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Estatísticas (admin)
  async getStats() {
    try {
      const response = await api.get('/appointments/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};