# ⚡ PERFORMANCE OPTIMIZATION GUIDE

## Overview

This guide covers performance optimization strategies for the ACMS backend.

---

## 1. Database Optimization

### Add Indexes

```sql
-- Patients table
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_patients_is_active ON patients(is_active);

-- Medicines table
CREATE INDEX idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_is_active ON medicines(is_active);
CREATE INDEX idx_medicines_quantity_stock ON medicines(quantity_stock);

-- Appointments table
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);

-- Invoices table
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Composite indexes for common queries
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_patients_clinic_active ON patients(clinic_id, is_active);
```

### Query Optimization

```javascript
// ❌ Bad: N+1 query problem
const patients = await patientRepo.findAll();
for (const patient of patients) {
  const appointments = await appointmentRepo.findByPatient(patient.id);
}

// ✅ Good: Single query with JOIN
const query = `
  SELECT p.*, 
         json_agg(a.*) as appointments
  FROM patients p
  LEFT JOIN appointments a ON p.id = a.patient_id
  WHERE p.clinic_id = $1
  GROUP BY p.id
`;
```

### Connection Pooling

```javascript
// config/database.js
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Optimization settings
  min: 2,                      // Minimum connections
  max: 10,                     // Maximum connections
  idleTimeoutMillis: 30000,    // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if can't connect
  
  // Statement timeout
  statement_timeout: 10000     // Kill queries taking > 10s
});

// Monitor pool
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
```

---

## 2. Caching Strategy

### Redis Caching (Optional)

```javascript
// services/cache.js
import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

export class CacheService {
  async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key, value, ttl = 300) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key) {
    await redis.del(key);
  }
  
  async flush() {
    await redis.flushall();
  }
}

// Usage in service
export class PatientService {
  constructor() {
    this.patientRepo = new PatientRepository();
    this.cache = new CacheService();
  }
  
  async getPatient(id, clinicId) {
    // Try cache first
    const cacheKey = `patient:${id}:${clinicId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Fetch from database
    const patient = await this.patientRepo.findById(id, clinicId);
    if (!patient) throw new NotFoundError('Patient not found');
    
    // Cache for 5 minutes
    const result = patient.toJSON();
    await this.cache.set(cacheKey, result, 300);
    
    return result;
  }
  
  async updatePatient(id, clinicId, data) {
    const patient = await this.patientRepo.update(id, clinicId, data);
    
    // Invalidate cache
    await this.cache.del(`patient:${id}:${clinicId}`);
    
    return patient.toJSON();
  }
}
```

### In-Memory Caching (Simple)

```javascript
// utils/cache.js
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check expiry
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value, ttl = 300000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  
  delete(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
```

---

## 3. Response Compression

```javascript
// server.js
import compression from 'compression';

// Enable compression
app.use(compression({
  level: 6,                    // Compression level (0-9)
  threshold: 1024,             // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

---

## 4. Pagination

```javascript
// Always paginate large result sets
export const getPatients = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20,  // Default limit
      search 
    } = req.query;
    
    // Enforce maximum limit
    const maxLimit = Math.min(parseInt(limit), 100);
    const offset = (parseInt(page) - 1) * maxLimit;
    
    const result = await patientService.getAllPatients(clinicId, {
      search,
      limit: maxLimit,
      offset
    });
    
    res.json({
      patients: result.patients,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: maxLimit,
        totalPages: Math.ceil(result.total / maxLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Async/Await Optimization

```javascript
// ❌ Bad: Sequential execution
const patient = await patientRepo.findById(id);
const appointments = await appointmentRepo.findByPatient(id);
const invoices = await invoiceRepo.findByPatient(id);

// ✅ Good: Parallel execution
const [patient, appointments, invoices] = await Promise.all([
  patientRepo.findById(id),
  appointmentRepo.findByPatient(id),
  invoiceRepo.findByPatient(id)
]);
```

---

## 6. Rate Limiting

```javascript
// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                    // Limit login attempts
  message: 'Too many login attempts, please try again later'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

---

## 7. Lazy Loading

```javascript
// Only load related data when needed
export const getPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { include } = req.query;
    
    const patient = await patientService.getPatient(id, req.user.clinic_id);
    
    // Only load appointments if requested
    if (include === 'appointments') {
      patient.appointments = await appointmentService.getByPatient(id);
    }
    
    res.json({ patient });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. Database Query Monitoring

```javascript
// middleware/queryLogger.js
export const queryLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

// Apply middleware
app.use(queryLogger);
```

---

## 9. Memory Management

```javascript
// Avoid memory leaks
export class PatientService {
  constructor() {
    this.patientRepo = new PatientRepository();
    // Don't store large objects in memory
  }
  
  async getAllPatients(clinicId, filters) {
    // Process in batches for large datasets
    const batchSize = 1000;
    let offset = 0;
    const results = [];
    
    while (true) {
      const batch = await this.patientRepo.findAllByClinic(clinicId, {
        ...filters,
        limit: batchSize,
        offset
      });
      
      if (batch.length === 0) break;
      
      results.push(...batch.map(p => p.toJSON()));
      offset += batchSize;
      
      // Prevent infinite loops
      if (offset > 100000) break;
    }
    
    return results;
  }
}
```

---

## 10. Monitoring & Profiling

### Add Performance Metrics

```javascript
// middleware/metrics.js
const metrics = {
  requests: 0,
  errors: 0,
  totalResponseTime: 0
};

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  metrics.requests++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.totalResponseTime += duration;
    
    if (res.statusCode >= 400) {
      metrics.errors++;
    }
  });
  
  next();
};

export const getMetrics = (req, res) => {
  res.json({
    requests: metrics.requests,
    errors: metrics.errors,
    averageResponseTime: metrics.totalResponseTime / metrics.requests,
    errorRate: (metrics.errors / metrics.requests) * 100
  });
};

// Add metrics endpoint
app.get('/metrics', getMetrics);
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Response Time (p95) | < 200ms | < 500ms | > 1s |
| Database Query Time | < 50ms | < 200ms | > 500ms |
| Memory Usage | < 512MB | < 1GB | > 2GB |
| CPU Usage | < 50% | < 75% | > 90% |
| Error Rate | < 0.1% | < 1% | > 5% |
| Throughput | > 1000 req/s | > 500 req/s | < 100 req/s |

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test endpoint
ab -n 1000 -c 10 http://localhost:5000/api/patients

# With authentication
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/patients
```

---

## Quick Wins

1. ✅ **Add database indexes** - 10-100x faster queries
2. ✅ **Enable compression** - 50-70% smaller responses
3. ✅ **Use connection pooling** - Reuse database connections
4. ✅ **Implement pagination** - Limit result set sizes
5. ✅ **Cache static data** - Reduce database load
6. ✅ **Use Promise.all()** - Parallel execution
7. ✅ **Add rate limiting** - Prevent abuse
8. ✅ **Monitor slow queries** - Identify bottlenecks

---

**Last Updated:** November 5, 2025  
**Status:** Ready for implementation
