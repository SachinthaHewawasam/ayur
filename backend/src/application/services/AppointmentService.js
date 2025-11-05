import { AppointmentRepository } from '../../infrastructure/repositories/AppointmentRepository.js';
import { PatientRepository } from '../../infrastructure/repositories/PatientRepository.js';
import { Appointment } from '../../domain/models/Appointment.js';
import { BusinessError, NotFoundError, ConflictError } from '../../domain/errors/index.js';

export class AppointmentService {
  constructor() {
    this.appointmentRepo = new AppointmentRepository();
    this.patientRepo = new PatientRepository();
  }
  
  /**
   * Get all appointments with filters
   */
  async getAllAppointments(clinicId, filters = {}) {
    const appointments = await this.appointmentRepo.findAllByClinic(clinicId, filters);
    return appointments.map(a => a.toJSON());
  }
  
  /**
   * Get appointment by ID with full details
   */
  async getAppointment(id, clinicId) {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    // Get prescriptions
    const prescriptions = await this.appointmentRepo.getPrescriptions(id);
    
    return {
      ...appointment.toJSON(),
      prescriptions
    };
  }
  
  /**
   * Create new appointment
   */
  async createAppointment(clinicId, data) {
    // Verify patient exists and belongs to clinic
    const patient = await this.patientRepo.findById(data.patient_id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found or does not belong to this clinic');
    }
    
    // Create appointment model (validates automatically)
    const appointment = new Appointment({
      ...data,
      clinic_id: clinicId,
      status: 'scheduled'
    });
    
    // Check for conflicts (done in repository)
    try {
      const savedAppointment = await this.appointmentRepo.create(appointment);
      return savedAppointment.toJSON();
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new BusinessError('This time slot is already booked');
      }
      throw error;
    }
  }
  
  /**
   * Update appointment
   */
  async updateAppointment(id, clinicId, data) {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    // Update properties
    Object.assign(appointment, {
      appointmentDate: data.appointment_date || appointment.appointmentDate,
      appointmentTime: data.appointment_time || appointment.appointmentTime,
      status: data.status || appointment.status,
      chiefComplaint: data.chief_complaint !== undefined ? data.chief_complaint : appointment.chiefComplaint,
      diagnosis: data.diagnosis !== undefined ? data.diagnosis : appointment.diagnosis,
      treatmentNotes: data.treatment_notes !== undefined ? data.treatment_notes : appointment.treatmentNotes,
      followupDate: data.followup_date !== undefined ? data.followup_date : appointment.followupDate
    });
    
    // Validate updated appointment
    appointment.validate();
    
    // Check for conflicts if date/time changed
    if (data.appointment_date || data.appointment_time) {
      const hasConflict = await this.appointmentRepo.checkConflict(
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.appointmentTime,
        id
      );
      
      if (hasConflict) {
        throw new BusinessError('This time slot is already booked');
      }
    }
    
    const updatedAppointment = await this.appointmentRepo.update(appointment);
    return updatedAppointment.toJSON();
  }
  
  /**
   * Cancel appointment
   */
  async cancelAppointment(id, clinicId, reason = '') {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    if (!appointment.canBeCancelled()) {
      throw new BusinessError('This appointment cannot be cancelled');
    }
    
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledAt = new Date();
    
    const updatedAppointment = await this.appointmentRepo.update(appointment);
    
    return updatedAppointment.toJSON();
  }

  /**
   * Mark appointment as missed
   */
  async markAsMissed(id, clinicId, reason = '') {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    // Only allow marking as missed if appointment is scheduled or in progress
    if (!['scheduled', 'in_progress'].includes(appointment.status)) {
      throw new BusinessError(`Cannot mark ${appointment.status} appointment as missed`);
    }
    
    // Only allow marking past appointments as missed
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    if (appointmentDateTime > new Date()) {
      throw new BusinessError('Cannot mark future appointment as missed');
    }
    
    appointment.status = 'missed';
    appointment.missedReason = reason;
    appointment.missedAt = new Date();
    
    const updatedAppointment = await this.appointmentRepo.update(appointment);
    
    return updatedAppointment.toJSON();
  }

  /**
   * Mark appointment as completed
   */
  async markAsCompleted(id, clinicId, completionData = {}) {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    if (appointment.status !== 'in_progress') {
      throw new BusinessError(`Cannot mark ${appointment.status} appointment as completed`);
    }
    
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.diagnosis = completionData.diagnosis || appointment.diagnosis;
    appointment.treatmentNotes = completionData.treatmentNotes || appointment.treatmentNotes;
    appointment.followupDate = completionData.followupDate || appointment.followupDate;
    
    const updatedAppointment = await this.appointmentRepo.update(appointment);
    
    return updatedAppointment.toJSON();
  }

  /**
   * Start appointment (mark as in progress)
   */
  async startAppointment(id, clinicId) {
    const appointment = await this.appointmentRepo.findById(id, clinicId);
    
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    
    if (appointment.status !== 'scheduled') {
      throw new BusinessError(`Cannot start ${appointment.status} appointment`);
    }
    
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = new Date();
    const timeDiff = Math.abs(now - appointmentDateTime) / (1000 * 60); // minutes
    
    // Allow starting 15 minutes before or after scheduled time
    if (timeDiff > 15 && now < appointmentDateTime) {
      throw new BusinessError('Cannot start appointment more than 15 minutes early');
    }
    
    appointment.status = 'in_progress';
    appointment.startedAt = new Date();
    
    const updatedAppointment = await this.appointmentRepo.update(appointment);
    
    return updatedAppointment.toJSON();
  }

  /**
   * Get status transition rules
   */
  getStatusTransitionRules(currentStatus) {
    const rules = {
      scheduled: ['in_progress', 'cancelled', 'missed'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: ['scheduled'],
      missed: ['scheduled']
    };
    
    return {
      allowed: rules[currentStatus] || [],
      current: currentStatus,
      canTransition: (newStatus) => rules[currentStatus]?.includes(newStatus) || false
    };
  }
  
  /**
   * Get today's appointments
   */
  async getTodaysAppointments(clinicId) {
    const appointments = await this.appointmentRepo.getTodaysAppointments(clinicId);
    
    // Group by status
    const grouped = {
      scheduled: [],
      in_progress: [],
      completed: [],
      cancelled: [],
      missed: []
    };
    
    appointments.forEach(apt => {
      const json = apt.toJSON();
      if (grouped[apt.status]) {
        grouped[apt.status].push(json);
      }
    });
    
    return {
      appointments: appointments.map(a => a.toJSON()),
      grouped,
      stats: {
        total: appointments.length,
        scheduled: grouped.scheduled.length,
        in_progress: grouped.in_progress.length,
        completed: grouped.completed.length,
        cancelled: grouped.cancelled.length,
        missed: grouped.missed.length
      }
    };
  }
  
  /**
   * Get upcoming followups
   */
  async getUpcomingFollowups(clinicId, days = 7) {
    const appointments = await this.appointmentRepo.getUpcomingFollowups(clinicId, days);
    return appointments.map(a => a.toJSON());
  }
  
  /**
   * Get appointment statistics
   */
  async getAppointmentStats(clinicId, startDate, endDate) {
    const appointments = await this.appointmentRepo.findAllByClinic(clinicId, {
      startDate,
      endDate
    });
    
    const stats = {
      total: appointments.length,
      byStatus: {
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        missed: appointments.filter(a => a.status === 'missed').length
      },
      completionRate: 0
    };
    
    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.byStatus.completed / stats.total) * 100);
    }
    
    return stats;
  }
}
