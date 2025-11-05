import api from './api.service';

class PatientService {
  async getAllPatients(params = {}) {
    return api.get('/patients', params);
  }

  async getPatientById(id) {
    return api.get(`/patients/${id}`);
  }

  async createPatient(patientData) {
    return api.post('/patients', patientData);
  }

  async updatePatient(id, patientData) {
    return api.put(`/patients/${id}`, patientData);
  }

  async deletePatient(id) {
    return api.delete(`/patients/${id}`);
  }

  async searchPatients(query) {
    return api.get('/patients/search', { q: query });
  }

  async getPatientHistory(id) {
    return api.get(`/patients/${id}/history`);
  }

  async getPatientAppointments(id, params = {}) {
    return api.get(`/patients/${id}/appointments`, params);
  }

  async getPatientInvoices(id, params = {}) {
    return api.get(`/patients/${id}/invoices`, params);
  }
}

export default new PatientService();
