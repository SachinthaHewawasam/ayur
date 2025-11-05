import { PatientService } from '../application/services/PatientService.js';

const patientService = new PatientService();

/**
 * Get all patients
 * GET /api/patients
 */
export const getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const clinicId = req.user.clinic_id;
    
    const result = await patientService.getAllPatients(clinicId, {
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      patients: result.patients,
      pagination: {
        total: result.pagination.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.pagination.total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient by ID
 * GET /api/patients/:id
 */
export const getPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const patient = await patientService.getPatientWithHistory(id, clinicId);
    
    res.json({ patient });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new patient
 * POST /api/patients
 */
export const createPatient = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    
    const patient = await patientService.createPatient(clinicId, req.body);
    
    res.status(201).json({
      message: 'Patient registered successfully',
      patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient
 * PUT /api/patients/:id
 */
export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const patient = await patientService.updatePatient(id, clinicId, req.body);
    
    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete patient (soft delete)
 * DELETE /api/patients/:id
 */
export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    await patientService.deletePatient(id, clinicId);
    
    res.json({
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search patients
 * GET /api/patients/search
 */
export const searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    const clinicId = req.user.clinic_id;
    
    if (!q || q.length < 2) {
      return res.json({ patients: [] });
    }
    
    const patients = await patientService.searchPatients(clinicId, q);
    
    res.json({ patients });
  } catch (error) {
    next(error);
  }
};
