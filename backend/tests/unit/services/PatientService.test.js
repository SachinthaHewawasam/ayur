import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientService } from '../../../src/application/services/PatientService.js';
import { PatientRepository } from '../../../src/infrastructure/repositories/PatientRepository.js';
import { Patient } from '../../../src/domain/models/Patient.js';
import { NotFoundError, BusinessError } from '../../../src/domain/errors/index.js';

// Mock the repository
vi.mock('../../../src/infrastructure/repositories/PatientRepository.js');

describe('PatientService', () => {
  let patientService;
  let mockPatientRepo;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Create mock repository
    mockPatientRepo = {
      findById: vi.fn(),
      findAllByClinic: vi.fn(),
      countByClinic: vi.fn(),
      findByPhone: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      getAppointmentHistory: vi.fn()
    };
    
    // Create service with mocked repository
    patientService = new PatientService();
    patientService.patientRepo = mockPatientRepo;
  });

  describe('getAllPatients', () => {
    it('should return all patients for a clinic', async () => {
      // Arrange
      const clinicId = 1;
      const mockPatients = [
        new Patient({
          id: 1,
          name: 'John Doe',
          phone: '1234567890',
          age: 30,
          gender: 'Male',
          clinic_id: clinicId
        }),
        new Patient({
          id: 2,
          name: 'Jane Smith',
          phone: '0987654321',
          age: 25,
          gender: 'Female',
          clinic_id: clinicId
        })
      ];
      
      mockPatientRepo.findAllByClinic.mockResolvedValue(mockPatients);
      mockPatientRepo.countByClinic.mockResolvedValue(mockPatients.length);

      // Act
      const result = await patientService.getAllPatients(clinicId);

      // Assert
      expect(mockPatientRepo.findAllByClinic).toHaveBeenCalledWith(clinicId, {});
      expect(result.patients).toHaveLength(2);
      expect(result.patients[0]).toHaveProperty('name', 'John Doe');
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const clinicId = 1;
      const filters = { search: 'John', limit: 10, offset: 0 };
      
      mockPatientRepo.findAllByClinic.mockResolvedValue([]);
      mockPatientRepo.countByClinic.mockResolvedValue(0);

      // Act
      await patientService.getAllPatients(clinicId, filters);

      // Assert
      expect(mockPatientRepo.findAllByClinic).toHaveBeenCalledWith(clinicId, filters);
    });
  });

  describe('getPatient', () => {
    it('should return a patient by ID', async () => {
      // Arrange
      const patientId = 1;
      const clinicId = 1;
      const mockPatient = new Patient({
        id: patientId,
        name: 'John Doe',
        phone: '1234567890',
        age: 30,
        gender: 'Male',
        clinic_id: clinicId
      });
      
      mockPatientRepo.findById.mockResolvedValue(mockPatient);

      // Act
      const result = await patientService.getPatient(patientId, clinicId);

      // Assert
      expect(mockPatientRepo.findById).toHaveBeenCalledWith(patientId, clinicId);
      expect(result).toHaveProperty('name', 'John Doe');
    });

    it('should throw NotFoundError when patient does not exist', async () => {
      // Arrange
      const patientId = 999;
      const clinicId = 1;
      
      mockPatientRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        patientService.getPatient(patientId, clinicId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      // Arrange
      const clinicId = 1;
      const patientData = {
        name: 'John Doe',
        phone: '1234567890',
        age: 30,
        gender: 'Male'
      };
      
      const mockCreatedPatient = new Patient({
        id: 1,
        patient_code: 'P-001',
        ...patientData,
        clinic_id: clinicId
      });
      
      mockPatientRepo.findByPhone.mockResolvedValue(null);
      mockPatientRepo.create.mockResolvedValue(mockCreatedPatient);

      // Act
      const result = await patientService.createPatient(clinicId, patientData);

      // Assert
      expect(mockPatientRepo.findByPhone).toHaveBeenCalledWith(patientData.phone, clinicId);
      expect(mockPatientRepo.create).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('patient_code');
    });

    it('should throw BusinessError when phone already exists', async () => {
      // Arrange
      const clinicId = 1;
      const patientData = {
        name: 'John Doe',
        phone: '1234567890',
        age: 30,
        gender: 'Male'
      };
      
      const existingPatient = new Patient({
        id: 2,
        ...patientData,
        clinic_id: clinicId
      });
      
      mockPatientRepo.findByPhone.mockResolvedValue(existingPatient);

      // Act & Assert
      await expect(
        patientService.createPatient(clinicId, patientData)
      ).rejects.toThrow(BusinessError);
      
      expect(mockPatientRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePatient', () => {
    it('should update an existing patient', async () => {
      // Arrange
      const patientId = 1;
      const clinicId = 1;
      const updateData = { name: 'Jane Doe' };
      
      const existingPatient = new Patient({
        id: patientId,
        name: 'John Doe',
        phone: '1234567890',
        age: 30,
        gender: 'Male',
        clinic_id: clinicId
      });
      
      const updatedPatient = new Patient({
        ...existingPatient,
        name: 'Jane Doe'
      });
      
      mockPatientRepo.findById.mockResolvedValue(existingPatient);
      mockPatientRepo.update.mockResolvedValue(updatedPatient);

      // Act
      const result = await patientService.updatePatient(patientId, clinicId, updateData);

      // Assert
      expect(mockPatientRepo.findById).toHaveBeenCalledWith(patientId, clinicId);
      expect(mockPatientRepo.update).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Jane Doe');
    });

    it('should throw NotFoundError when patient does not exist', async () => {
      // Arrange
      const patientId = 999;
      const clinicId = 1;
      const updateData = { name: 'Jane Doe' };
      
      mockPatientRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        patientService.updatePatient(patientId, clinicId, updateData)
      ).rejects.toThrow(NotFoundError);
      
      expect(mockPatientRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePatient', () => {
    it('should soft delete a patient', async () => {
      // Arrange
      const patientId = 1;
      const clinicId = 1;
      
      const existingPatient = new Patient({
        id: patientId,
        name: 'John Doe',
        phone: '1234567890',
        age: 30,
        gender: 'Male',
        clinic_id: clinicId
      });
      
      mockPatientRepo.findById.mockResolvedValue(existingPatient);
      mockPatientRepo.softDelete.mockResolvedValue(true);

      // Act
      await patientService.deletePatient(patientId, clinicId);

      // Assert
      expect(mockPatientRepo.findById).toHaveBeenCalledWith(patientId, clinicId);
      expect(mockPatientRepo.softDelete).toHaveBeenCalledWith(patientId);
    });

    it('should throw NotFoundError when patient does not exist', async () => {
      // Arrange
      const patientId = 999;
      const clinicId = 1;
      
      mockPatientRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        patientService.deletePatient(patientId, clinicId)
      ).rejects.toThrow(NotFoundError);
      
      expect(mockPatientRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
