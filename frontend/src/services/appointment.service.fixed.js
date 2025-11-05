import api from './api.service.js';

class AppointmentService {
  // Get all appointments
  async getAllAppointments(params = {}) {
    return api.get('/appointments', { params });
  }

  // Get single appointment
  async getAppointmentById(id) {
    return api.get(`/appointments/${id}`);
  }

  // Get today's appointments
  async getTodayAppointments() {
    return api.get('/appointments/today');
  }

  // Get appointments by date
  async getAppointmentsByDate(date) {
    return api.get(`/appointments/date/${date}`);
  }

  // Create appointment
  async createAppointment(data) {
    return api.post('/appointments', data);
  }

  // Update appointment
  async updateAppointment(id, data) {
    return api.put(`/appointments/${id}`, data);
  }

  // Delete appointment
  async deleteAppointment(id) {
    return api.delete(`/appointments/${id}`);
  }

  // Status management methods
  async startAppointment(id) {
    return api.patch(`/appointments/${id}/start`);
  }

  async completeAppointment(id, completionData) {
    return api.patch(`/appointments/${id}/complete`, completionData);
  }

  async markAsMissed(id, reason) {
    return api.patch(`/appointments/${id}/miss`, { reason });
  }

  async cancelAppointment(id, reason) {
    return api.patch(`/appointments/${id}/cancel`, { reason });
  }

  async getStatusRules(id) {
    return api.get(`/appointments/${id}/status-rules`);
  }

  // Follow-up methods
  async getFollowUps() {
    return api.get('/appointments/followups/upcoming');
  }

  async getUpcomingFollowups() {
    return api.get('/appointments/followups/upcoming');
  }
}

export default new AppointmentService();
