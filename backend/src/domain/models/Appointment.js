import { ValidationError } from '../errors/index.js';

export class Appointment {
  constructor(data) {
    this.id = data.id;
    this.clinicId = data.clinic_id;
    this.patientId = data.patient_id;
    this.doctorId = data.doctor_id;
    this.appointmentDate = data.appointment_date;
    this.appointmentTime = data.appointment_time;
    this.durationMinutes = data.duration_minutes || 30;
    this.status = data.status || 'scheduled';
    this.chiefComplaint = data.chief_complaint;
    this.diagnosis = data.diagnosis;
    this.treatmentNotes = data.treatment_notes;
    this.followupDate = data.followup_date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    // Additional fields from joins
    this.patientName = data.patient_name;
    this.patientPhone = data.patient_phone;
    this.patientCode = data.patient_code;
    this.doctorName = data.doctor_name;
    
    // Patient health information fields
    this.doshaType = data.dosha_type;
    this.allergies = data.allergies;
    this.medicalHistory = data.medical_history;
    
    this.validate();
  }
  
  validate() {
    if (!this.patientId) {
      throw new ValidationError('Patient ID is required');
    }
    
    if (!this.doctorId) {
      throw new ValidationError('Doctor ID is required');
    }
    
    if (!this.appointmentDate) {
      throw new ValidationError('Appointment date is required');
    }
    
    if (!this.appointmentTime) {
      throw new ValidationError('Appointment time is required');
    }
    
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'missed', 'in_progress'];
    if (this.status && !validStatuses.includes(this.status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (this.durationMinutes < 15 || this.durationMinutes > 180) {
      throw new ValidationError('Duration must be between 15 and 180 minutes');
    }
  }
  
  // Domain methods
  isScheduled() {
    return this.status === 'scheduled';
  }
  
  isCompleted() {
    return this.status === 'completed';
  }
  
  isCancelled() {
    return this.status === 'cancelled';
  }
  
  isPast() {
    const appointmentDateTime = new Date(`${this.appointmentDate}T${this.appointmentTime}`);
    return appointmentDateTime < new Date();
  }
  
  isToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.appointmentDate === today;
  }
  
  needsFollowup() {
    return this.followupDate && new Date(this.followupDate) >= new Date();
  }
  
  canBeCancelled() {
    return this.isScheduled() && !this.isPast();
  }
  
  canBeRescheduled() {
    return this.isScheduled() && !this.isPast();
  }
  
  getEndTime() {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }
  
  // Convert to database format
  toDatabase() {
    return {
      clinic_id: this.clinicId,
      patient_id: this.patientId,
      doctor_id: this.doctorId,
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      duration_minutes: this.durationMinutes,
      status: this.status,
      chief_complaint: this.chiefComplaint,
      diagnosis: this.diagnosis,
      treatment_notes: this.treatmentNotes,
      followup_date: this.followupDate
    };
  }
  
  // Convert to API response format (snake_case for frontend compatibility)
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patientId,
      patient_name: this.patientName,
      patient_phone: this.patientPhone,
      patient_code: this.patientCode,
      doctor_id: this.doctorId,
      doctor_name: this.doctorName,
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      end_time: this.getEndTime(),
      duration_minutes: this.durationMinutes,
      status: this.status,
      chief_complaint: this.chiefComplaint,
      diagnosis: this.diagnosis,
      treatment_notes: this.treatmentNotes,
      followup_date: this.followupDate,
      // Patient health information
      dosha_type: this.doshaType,
      allergies: this.allergies,
      medical_history: this.medicalHistory,
      is_today: this.isToday(),
      is_past: this.isPast(),
      can_be_cancelled: this.canBeCancelled(),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}
