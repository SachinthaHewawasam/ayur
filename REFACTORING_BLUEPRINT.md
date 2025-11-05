# 🏗️ ACMS REFACTORING BLUEPRINT

**Status:** Deep Analysis Complete | **Priority:** CRITICAL  
**Estimated Effort:** 8-12 weeks | **Risk Level:** MEDIUM

---

## 📊 EXECUTIVE SUMMARY

### Current Health Scores
- **Backend:** 45/100 (Critical refactoring needed)
- **Frontend:** 52/100 (Significant improvements needed)
- **Overall:** 48/100 (Not production-ready)

### Top 5 Critical Issues
1. ❌ **No Service Layer** - Business logic in controllers (Backend)
2. ❌ **No Repository Pattern** - Direct DB access everywhere (Backend)
3. ❌ **Fat Components** - 200+ line page components (Frontend)
4. ❌ **Zero Tests** - No test coverage (Both)
5. ❌ **No Error Boundaries** - Unhandled errors crash app (Frontend)

---

## 🔧 BACKEND REFACTORING

### Current Problems

#### Problem 1: Fat Controllers (559 lines in medicine.controller.js)
```javascript
// ❌ CURRENT: Everything in controller
export const createMedicine = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    // Validation logic
    // Business logic
    // SQL queries
    // Transaction management
    // Response formatting
    // Error handling
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({...});
  }
};
```

#### Problem 2: No Domain Models
```javascript
// ❌ CURRENT: Plain objects, no validation
const patient = result.rows[0];
patient.age = -5; // Invalid but allowed!
```

#### Problem 3: Duplicate SQL Queries
- Same query patterns repeated 15+ times across controllers
- Hard to maintain, optimize, or modify

---

### Proposed Architecture

```
Routes → Controllers (HTTP only)
           ↓
       Services (Business logic)
           ↓
       Models (Domain validation)
           ↓
       Repositories (Data access)
           ↓
       Database
```

---

### Refactoring Steps

#### STEP 1: Create Error Classes (Week 1)

**File:** `backend/src/domain/errors/index.js`
```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BusinessError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

export class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}
```

#### STEP 2: Create Domain Models (Week 1-2)

**File:** `backend/src/domain/models/Patient.js`
```javascript
export class Patient {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.age = data.age;
    // ... other fields
    this.validate();
  }
  
  validate() {
    if (!this.name || this.name.length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }
    if (!/^[0-9]{10}$/.test(this.phone)) {
      throw new ValidationError('Phone must be 10 digits');
    }
    if (this.age < 0 || this.age > 150) {
      throw new ValidationError('Invalid age');
    }
  }
  
  isAdult() { return this.age >= 18; }
  hasAllergies() { return !!this.allergies; }
  
  toDatabase() { /* Convert to DB format */ }
  toJSON() { /* Convert to API format */ }
}
```

**File:** `backend/src/domain/models/Medicine.js`
```javascript
export class Medicine {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.quantityStock = data.quantity_stock || 0;
    this.minimumStockLevel = data.minimum_stock_level || 10;
    // ... other fields
    this.validate();
  }
  
  validate() {
    if (!this.name) throw new ValidationError('Name required');
    if (this.quantityStock < 0) throw new ValidationError('Stock cannot be negative');
  }
  
  // Domain methods
  isLowStock() { return this.quantityStock <= this.minimumStockLevel; }
  isExpired() { return this.expiryDate && new Date(this.expiryDate) < new Date(); }
  canFulfillOrder(qty) { return this.quantityStock >= qty; }
  
  addStock(qty) {
    if (qty <= 0) throw new BusinessError('Quantity must be positive');
    this.quantityStock += qty;
  }
  
  removeStock(qty) {
    if (!this.canFulfillOrder(qty)) {
      throw new BusinessError(`Insufficient stock. Available: ${this.quantityStock}`);
    }
    this.quantityStock -= qty;
  }
}
```

#### STEP 3: Create Repository Layer (Week 2-3)

**File:** `backend/src/infrastructure/repositories/BaseRepository.js`
```javascript
import { pool } from '../../config/database.js';
import { DatabaseError } from '../../domain/errors/index.js';

export class BaseRepository {
  constructor(tableName, ModelClass) {
    this.tableName = tableName;
    this.ModelClass = ModelClass;
  }
  
  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? new this.ModelClass(result.rows[0]) : null;
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.tableName}: ${error.message}`);
    }
  }
  
  async findAll(filters = {}) {
    // Implement generic findAll with filters
  }
  
  async create(model) {
    // Implement generic create
  }
  
  async update(model) {
    // Implement generic update
  }
  
  async delete(id) {
    // Implement soft delete
  }
}
```

**File:** `backend/src/infrastructure/repositories/PatientRepository.js`
```javascript
import { BaseRepository } from './BaseRepository.js';
import { Patient } from '../../domain/models/Patient.js';

export class PatientRepository extends BaseRepository {
  constructor() {
    super('patients', Patient);
  }
  
  async findByPhone(phone, clinicId) {
    const result = await pool.query(
      'SELECT * FROM patients WHERE phone = $1 AND clinic_id = $2',
      [phone, clinicId]
    );
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }
  
  async findAllByClinic(clinicId, filters = {}) {
    // Clinic-specific query
  }
}
```

#### STEP 4: Create Service Layer (Week 3-4)

**File:** `backend/src/application/services/PatientService.js`
```javascript
import { PatientRepository } from '../../infrastructure/repositories/PatientRepository.js';
import { Patient } from '../../domain/models/Patient.js';
import { BusinessError, NotFoundError } from '../../domain/errors/index.js';

export class PatientService {
  constructor() {
    this.patientRepo = new PatientRepository();
  }
  
  async createPatient(clinicId, data) {
    // Check for duplicate phone
    const existing = await this.patientRepo.findByPhone(data.phone, clinicId);
    if (existing) {
      throw new BusinessError('Patient with this phone already exists');
    }
    
    // Generate patient code
    const patientCode = await this.generatePatientCode(clinicId);
    
    // Create patient model
    const patient = new Patient({
      ...data,
      clinic_id: clinicId,
      patient_code: patientCode
    });
    
    // Save to database
    return await this.patientRepo.create(patient);
  }
  
  async getPatient(id, clinicId) {
    const patient = await this.patientRepo.findById(id);
    if (!patient || patient.clinicId !== clinicId) {
      throw new NotFoundError('Patient not found');
    }
    return patient;
  }
  
  async updatePatient(id, clinicId, data) {
    const patient = await this.getPatient(id, clinicId);
    Object.assign(patient, data);
    patient.validate();
    return await this.patientRepo.update(patient);
  }
  
  async generatePatientCode(clinicId) {
    const count = await this.patientRepo.count({ clinic_id: clinicId });
    return `PAT${String(count + 1).padStart(5, '0')}`;
  }
}
```

#### STEP 5: Refactor Controllers (Week 4-5)

**File:** `backend/src/controllers/patient.controller.js`
```javascript
import { PatientService } from '../application/services/PatientService.js';

const patientService = new PatientService();

// ✅ NEW: Thin controller, delegates to service
export const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(
      req.user.clinic_id,
      req.body
    );
    
    res.status(201).json({
      message: 'Patient registered successfully',
      patient: patient.toJSON()
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

export const getPatient = async (req, res, next) => {
  try {
    const patient = await patientService.getPatient(
      req.params.id,
      req.user.clinic_id
    );
    
    res.json({ patient: patient.toJSON() });
  } catch (error) {
    next(error);
  }
};
```

#### STEP 6: Global Error Handler (Week 5)

**File:** `backend/src/middleware/errorHandler.js`
```javascript
import { AppError } from '../domain/errors/index.js';

export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  
  // Programming errors - don't leak details
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message,
      stack: err.stack 
    })
  });
};
```

**Update:** `backend/src/server.js`
```javascript
import { errorHandler } from './middleware/errorHandler.js';

// ... routes

// Global error handler (must be last)
app.use(errorHandler);
```

---

## 🎨 FRONTEND REFACTORING

### Current Problems

#### Problem 1: Fat Page Components (185 lines in Patients.jsx)
```javascript
// ❌ CURRENT: Everything in one component
export default function Patients() {
  // State management
  // Data fetching
  // Event handlers
  // Rendering logic (185 lines)
}
```

#### Problem 2: Duplicate Code
- Loading spinners repeated 10+ times
- Error states duplicated across pages
- Status badge logic repeated

#### Problem 3: No Custom Hooks
- Data fetching logic not reusable
- Form logic duplicated

---

### Refactoring Steps

#### STEP 1: Extract Custom Hooks (Week 1)

**File:** `frontend/src/hooks/usePatients.js`
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export function usePatients(search = '') {
  return useQuery({
    queryKey: ['patients', search],
    queryFn: async () => {
      const response = await api.get('/patients', { params: { search } });
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/patients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create patient');
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient updated successfully');
    },
  });
}
```

**File:** `frontend/src/hooks/useMedicines.js`
```javascript
export function useMedicines(filters = {}) {
  return useQuery({
    queryKey: ['medicines', filters],
    queryFn: async () => {
      const data = await medicineService.getAllMedicines(filters);
      return data;
    },
  });
}

export function useLowStockMedicines() {
  return useQuery({
    queryKey: ['medicines', 'low-stock'],
    queryFn: () => medicineService.getLowStockAlerts(),
  });
}
```

#### STEP 2: Create Reusable Components (Week 1-2)

**File:** `frontend/src/components/common/LoadingSpinner.jsx`
```javascript
export function LoadingSpinner({ size = 'md', message }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`} />
      {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
```

**File:** `frontend/src/components/common/EmptyState.jsx`
```javascript
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

**File:** `frontend/src/components/common/StatusBadge.jsx`
```javascript
export function StatusBadge({ status, type = 'appointment' }) {
  const colors = {
    appointment: {
      scheduled: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      missed: 'bg-gray-100 text-gray-800',
    },
    stock: {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    },
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${colors[type][status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
```

#### STEP 3: Refactor Page Components (Week 2-3)

**File:** `frontend/src/pages/Patients.jsx` (REFACTORED)
```javascript
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PatientSearch } from '../components/patients/PatientSearch';
import { PatientTable } from '../components/patients/PatientTable';
import { PatientModal } from '../components/PatientModal';

export default function Patients() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, refetch } = usePatients(search);
  
  const patients = data?.patients || [];
  
  return (
    <div>
      <PageHeader
        title="Patients"
        description="Manage patient records"
        action={
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Add Patient
          </button>
        }
      />
      
      <PatientSearch value={search} onChange={setSearch} />
      
      {isLoading ? (
        <LoadingSpinner message="Loading patients..." />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={User}
          title="No patients found"
          description={search ? 'Try a different search' : 'Get started by adding a patient'}
        />
      ) : (
        <PatientTable patients={patients} />
      )}
      
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
```

**File:** `frontend/src/components/patients/PatientTable.jsx`
```javascript
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export function PatientTable({ patients }) {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Age/Gender
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <PatientRow key={patient.id} patient={patient} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientRow({ patient }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-sm text-gray-500">{patient.patient_code}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.phone}</div>
        {patient.email && <div className="text-sm text-gray-500">{patient.email}</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {patient.age} years, {patient.gender}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link to={`/patients/${patient.id}`} className="text-primary-600 hover:text-primary-900">
          View Details
        </Link>
      </td>
    </tr>
  );
}
```

#### STEP 4: Add Error Boundaries (Week 3)

**File:** `frontend/src/components/ErrorBoundary.jsx`
```javascript
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-4 text-center text-lg font-semibold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 btn btn-primary"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 btn btn-secondary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

**Update:** `frontend/src/App.jsx`
```javascript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* ... routes */}
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

#### STEP 5: Add Code Splitting (Week 3)

**File:** `frontend/src/App.jsx`
```javascript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Medicines = lazy(() => import('./pages/Medicines'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner size="lg" message="Loading..." />}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create error classes
- [ ] Create domain models (Patient, Medicine, Appointment)
- [ ] Create base repository
- [ ] Extract custom hooks (usePatients, useMedicines)
- [ ] Create reusable components (LoadingSpinner, EmptyState, StatusBadge)

### Phase 2: Backend Refactoring (Weeks 3-5)
- [ ] Implement repositories (Patient, Medicine, Appointment)
- [ ] Implement services (PatientService, MedicineService)
- [ ] Refactor controllers to use services
- [ ] Add global error handler
- [ ] Add request logging middleware

### Phase 3: Frontend Refactoring (Weeks 6-7)
- [ ] Refactor page components (Patients, Appointments, Medicines)
- [ ] Add error boundaries
- [ ] Implement code splitting
- [ ] Create component library
- [ ] Standardize form handling

### Phase 4: Testing (Weeks 8-10)
- [ ] Add unit tests for services
- [ ] Add unit tests for repositories
- [ ] Add unit tests for domain models
- [ ] Add component tests
- [ ] Add integration tests
- [ ] Add E2E tests for critical flows

### Phase 5: Polish (Weeks 11-12)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Documentation
- [ ] Code review and cleanup
- [ ] Deployment preparation

---

## 🎯 SUCCESS METRICS

### Backend
- ✅ Controllers < 50 lines each
- ✅ Services handle all business logic
- ✅ Repositories handle all data access
- ✅ 80%+ test coverage
- ✅ No SQL in controllers

### Frontend
- ✅ Page components < 100 lines
- ✅ Custom hooks for data fetching
- ✅ Reusable components library
- ✅ Code splitting implemented
- ✅ 70%+ test coverage

### Overall
- ✅ Zero critical bugs
- ✅ All tests passing
- ✅ Performance improved 30%+
- ✅ Maintainability score > 80

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Changes
**Mitigation:** Implement feature flags, gradual rollout, comprehensive testing

### Risk 2: Timeline Overrun
**Mitigation:** Prioritize critical refactoring, defer nice-to-haves

### Risk 3: Team Learning Curve
**Mitigation:** Pair programming, code reviews, documentation

### Risk 4: Production Issues
**Mitigation:** Staging environment, rollback plan, monitoring

---

## 📚 NEXT STEPS

1. **Review this document** with the team
2. **Set up project board** with tasks
3. **Create feature branch** for refactoring
4. **Start with Phase 1** (Foundation)
5. **Daily standups** to track progress
6. **Weekly reviews** to adjust plan

---

**Document Owner:** Solutions Architect  
**Last Updated:** November 5, 2025  
**Next Review:** Weekly during implementation
