import api from './api.service';

class AppointmentService {
  async getAllAppointments(params = {}) {
    return api.get('/appointments', params);
  }

  async getAppointmentById(id) {
    return api.get(`/appointments/${id}`);
  }

  async createAppointment(appointmentData) {
    return api.post('/appointments', appointmentData);
  }

  async updateAppointment(id, appointmentData) {
    return api.put(`/appointments/${id}`, appointmentData);
  }

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

  async getTodayAppointments() {
    return api.get('/appointments/today');
  }

  async getAppointmentsByDate(date) {
    return api.get('/appointments', { date });
  }

  async getAppointmentsByPatient(patientId) {
    return api.get('/appointments', { patient_id: patientId });
  }

  async getAppointmentsByDoctor(doctorId) {
    return api.get('/appointments', { doctor_id: doctorId });
  }

  async updateAppointmentStatus(id, status) {
    return api.patch(`/appointments/${id}/status`, { status });
  }

  async cancelAppointment(id, reason = '') {
    return api.patch(`/appointments/${id}/cancel`, { reason });
  }

  async getAppointmentPrescriptions(id) {
    return api.get(`/appointments/${id}/prescriptions`);
  }

  async getFollowUps() {
    return api.get('/appointments/follow-ups');
  }
}

export default new AppointmentService();
