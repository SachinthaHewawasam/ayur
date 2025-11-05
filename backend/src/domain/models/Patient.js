import { ValidationError } from '../errors/index.js';

export class Patient {
  constructor(data) {
    this.id = data.id;
    this.clinicId = data.clinic_id;
    this.patientCode = data.patient_code;
    this.name = data.name;
    this.dateOfBirth = data.date_of_birth;
    this.age = data.age;
    this.gender = data.gender;
    this.phone = data.phone;
    this.email = data.email;
    this.address = data.address;
    this.doshaType = data.dosha_type;
    this.allergies = data.allergies;
    this.medicalHistory = data.medical_history;
    this.emergencyContactName = data.emergency_contact_name;
    this.emergencyContactPhone = data.emergency_contact_phone;
    this.isActive = data.is_active !== false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    this.validate();
  }
  
  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new ValidationError('Patient name must be at least 2 characters');
    }
    
    if (!this.phone || !/^[0-9]{10}$/.test(this.phone)) {
      throw new ValidationError('Phone must be 10 digits');
    }
    
    if (this.age !== undefined && (this.age < 0 || this.age > 150)) {
      throw new ValidationError('Age must be between 0 and 150');
    }
    
    const validGenders = ['Male', 'Female', 'Other'];
    if (this.gender && !validGenders.includes(this.gender)) {
      throw new ValidationError(`Gender must be one of: ${validGenders.join(', ')}`);
    }
    
    const validDoshaTypes = ['vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridosha'];
    if (this.doshaType && !validDoshaTypes.includes(this.doshaType)) {
      throw new ValidationError(`Invalid dosha type: ${this.doshaType}`);
    }
    
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      throw new ValidationError('Invalid email format');
    }
  }
  
  // Domain methods
  isAdult() {
    return this.age >= 18;
  }
  
  hasAllergies() {
    return this.allergies && this.allergies.trim().length > 0;
  }
  
  hasMedicalHistory() {
    return this.medicalHistory && this.medicalHistory.trim().length > 0;
  }
  
  getFullContactInfo() {
    return {
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address
    };
  }
  
  // Convert to database format
  toDatabase() {
    return {
      clinic_id: this.clinicId,
      patient_code: this.patientCode,
      name: this.name,
      date_of_birth: this.dateOfBirth,
      age: this.age,
      gender: this.gender,
      phone: this.phone,
      email: this.email,
      address: this.address,
      dosha_type: this.doshaType,
      allergies: this.allergies,
      medical_history: this.medicalHistory,
      emergency_contact_name: this.emergencyContactName,
      emergency_contact_phone: this.emergencyContactPhone,
      is_active: this.isActive
    };
  }
  
  // Convert to API response format (snake_case for frontend compatibility)
  toJSON() {
    return {
      id: this.id,
      patient_code: this.patientCode,
      name: this.name,
      date_of_birth: this.dateOfBirth,
      age: this.age,
      gender: this.gender,
      phone: this.phone,
      email: this.email,
      address: this.address,
      dosha_type: this.doshaType,
      allergies: this.allergies,
      medical_history: this.medicalHistory,
      emergency_contact_name: this.emergencyContactName,
      emergency_contact_phone: this.emergencyContactPhone,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}
