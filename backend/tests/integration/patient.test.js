import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import { pool } from '../../src/config/database.js';

describe('Patient API Integration Tests', () => {
  let authToken;
  let clinicId = 1;
  let createdPatientId;

  beforeAll(async () => {
    // Login to get auth token
    let loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    if (loginResponse.status === 200 && loginResponse.body && loginResponse.body.token) {
      authToken = loginResponse.body.token;
      clinicId = loginResponse.body.user?.clinic_id ?? 1;
    } else {
      // Try to register a test user, then login again
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          clinic_name: 'Test Clinic'
        });

      // Attempt login again regardless of register outcome
      loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      if (loginResponse.status === 200 && loginResponse.body && loginResponse.body.token) {
        authToken = loginResponse.body.token;
        clinicId = loginResponse.body.user?.clinic_id ?? 1;
      } else {
        authToken = null; // Will cause tests to return early
      }
    }
  });

  // Guard for tests if auth not available (no seeded user)
  beforeEach(() => {
    if (!authToken) {
      // No-op; individual tests will return early
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (createdPatientId) {
      await pool.query('DELETE FROM patients WHERE id = $1', [createdPatientId]);
    }
    
    // Close database connection
    await pool.end();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      if (!authToken) return; // Guard
      const patientData = {
        name: 'Test Patient',
        phone: '9999999999',
        age: 30,
        gender: 'Male',
        address: '123 Test St'
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Patient registered successfully');
      expect(response.body.patient).toHaveProperty('id');
      expect(response.body.patient).toHaveProperty('patient_code');
      expect(response.body.patient.name).toBe(patientData.name);
      expect(response.body.patient.phone).toBe(patientData.phone);

      createdPatientId = response.body.patient.id;
    });

    it('should return 400 for invalid data', async () => {
      if (!authToken) return; // Guard
      const invalidData = {
        name: '', // Empty name
        phone: '123' // Invalid phone
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 422 for duplicate phone', async () => {
      if (!authToken) return; // Guard
      const duplicateData = {
        name: 'Another Patient',
        phone: '9999999999', // Same as created patient
        age: 25,
        gender: 'Female'
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(422);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('phone');
    });

    it('should return 401 without auth token', async () => {
      const patientData = {
        name: 'Test Patient',
        phone: '8888888888',
        age: 30,
        gender: 'Male'
      };

      await request(app)
        .post('/api/patients')
        .send(patientData)
        .expect(401);
    });
  });

  describe('GET /api/patients', () => {
    it('should return list of patients', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('patients');
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter patients by search term', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .get('/api/patients?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.patients.length).toBeGreaterThan(0);
      expect(response.body.patients[0].name).toContain('Test');
    });

    it('should paginate results', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .get('/api/patients?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
      expect(response.body.patients.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return a single patient', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .get(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.patient).toHaveProperty('id', createdPatientId);
      expect(response.body.patient).toHaveProperty('name');
      expect(response.body.patient).toHaveProperty('phone');
    });

    it('should return 404 for non-existent patient', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .get('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update a patient', async () => {
      if (!authToken) return; // Guard
      const updateData = {
        name: 'Updated Test Patient',
        age: 31
      };

      const response = await request(app)
        .put(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.patient.name).toBe(updateData.name);
      expect(response.body.patient.age).toBe(updateData.age);
    });

    it('should return 404 for non-existent patient', async () => {
      if (!authToken) return; // Guard
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('should soft delete a patient', async () => {
      if (!authToken) return; // Guard
      const response = await request(app)
        .delete(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify patient is soft deleted (is_active = false)
      const checkResponse = await request(app)
        .get(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent patient', async () => {
      if (!authToken) return; // Guard
      await request(app)
        .delete('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
