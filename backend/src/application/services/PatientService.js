import { PatientRepository } from '../../infrastructure/repositories/PatientRepository.js';
import { Patient } from '../../domain/models/Patient.js';
import { BusinessError, NotFoundError } from '../../domain/errors/index.js';

export class PatientService {
  constructor() {
    this.patientRepo = new PatientRepository();
  }
  
  /**
   * Get all patients with pagination
   */
  async getAllPatients(clinicId, filters = {}) {
    const patients = await this.patientRepo.findAllByClinic(clinicId, filters);
    const total = await this.patientRepo.countByClinic(clinicId, filters);
    
    return {
      patients: patients.map(p => p.toJSON()),
      pagination: {
        total,
        limit: filters.limit || total,
        offset: filters.offset || 0
      }
    };
  }
  
  /**
   * Get patient by ID
   */
  async getPatient(id, clinicId) {
    const patient = await this.patientRepo.findById(id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    return patient.toJSON();
  }
  
  /**
   * Get patient with full details including history
   */
  async getPatientWithHistory(id, clinicId) {
    const patient = await this.patientRepo.findById(id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    const history = await this.patientRepo.getAppointmentHistory(id, clinicId);
    
    return {
      ...patient.toJSON(),
      appointment_history: history
    };
  }
  
  /**
   * Create new patient
   */
  async createPatient(clinicId, data) {
    // Check for duplicate phone
    const existingPatient = await this.patientRepo.findByPhone(data.phone, clinicId);
    
    if (existingPatient) {
      throw new BusinessError('Patient with this phone number already exists');
    }
    
    // Generate patient code
    const patientCode = await this.generatePatientCode(clinicId);
    
    // Create patient model (validates automatically)
    const patient = new Patient({
      ...data,
      clinic_id: clinicId,
      patient_code: patientCode
    });
    
    // Save to database
    const savedPatient = await this.patientRepo.create(patient);
    
    return savedPatient.toJSON();
  }
  
  /**
   * Update patient
   */
  async updatePatient(id, clinicId, data) {
    const patient = await this.patientRepo.findById(id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    // Check if phone is being changed and if it's already taken
    if (data.phone && data.phone !== patient.phone) {
      const existingPatient = await this.patientRepo.findByPhone(data.phone, clinicId);
      if (existingPatient && existingPatient.id !== id) {
        throw new BusinessError('Phone number already in use by another patient');
      }
    }
    
    // Update patient properties
    Object.assign(patient, {
      name: data.name || patient.name,
      dateOfBirth: data.date_of_birth || patient.dateOfBirth,
      age: data.age !== undefined ? data.age : patient.age,
      gender: data.gender || patient.gender,
      phone: data.phone || patient.phone,
      email: data.email !== undefined ? data.email : patient.email,
      address: data.address !== undefined ? data.address : patient.address,
      doshaType: data.dosha_type !== undefined ? data.dosha_type : patient.doshaType,
      allergies: data.allergies !== undefined ? data.allergies : patient.allergies,
      medicalHistory: data.medical_history !== undefined ? data.medical_history : patient.medicalHistory,
      emergencyContactName: data.emergency_contact_name !== undefined ? data.emergency_contact_name : patient.emergencyContactName,
      emergencyContactPhone: data.emergency_contact_phone !== undefined ? data.emergency_contact_phone : patient.emergencyContactPhone
    });
    
    // Validate updated patient
    patient.validate();
    
    // Save to database
    const updatedPatient = await this.patientRepo.update(patient);
    
    return updatedPatient.toJSON();
  }
  
  /**
   * Delete patient (soft delete)
   */
  async deletePatient(id, clinicId) {
    const patient = await this.patientRepo.findById(id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    await this.patientRepo.softDelete(id);
    
    return { message: 'Patient deleted successfully' };
  }
  
  /**
   * Generate unique patient code
   */
  async generatePatientCode(clinicId) {
    // Use timestamp + random number to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAT${timestamp}${random}`;
  }
  
  /**
   * Search patients
   */
  async searchPatients(clinicId, searchTerm) {
    const patients = await this.patientRepo.findAllByClinic(clinicId, {
      search: searchTerm,
      isActive: true
    });
    
    return patients.map(p => p.toJSON());
  }
}
