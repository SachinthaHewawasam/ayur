# 🚀 QUICK REFERENCE GUIDE

## Server Management

### Start Server
```bash
cd backend
npm run dev
```

### Server URL
```
http://localhost:5000
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## API Endpoints Quick Reference

### Patients
```bash
# List
curl http://localhost:5000/api/patients -H "Authorization: Bearer TOKEN"

# Get one
curl http://localhost:5000/api/patients/1 -H "Authorization: Bearer TOKEN"

# Create
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"John","phone":"1234567890","age":30}'

# Update
curl -X PUT http://localhost:5000/api/patients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Jane"}'

# Delete
curl -X DELETE http://localhost:5000/api/patients/1 \
  -H "Authorization: Bearer TOKEN"
```

### Medicines
```bash
# List
curl http://localhost:5000/api/medicines -H "Authorization: Bearer TOKEN"

# Low stock
curl http://localhost:5000/api/medicines/alerts/low-stock -H "Authorization: Bearer TOKEN"

# Expiring
curl http://localhost:5000/api/medicines/alerts/expiring -H "Authorization: Bearer TOKEN"

# Stats
curl http://localhost:5000/api/medicines/stats -H "Authorization: Bearer TOKEN"

# Update stock
curl -X PATCH http://localhost:5000/api/medicines/1/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type":"out","quantity":10,"reason":"Sale"}'
```

### Appointments
```bash
# List
curl http://localhost:5000/api/appointments -H "Authorization: Bearer TOKEN"

# Today
curl http://localhost:5000/api/appointments/today -H "Authorization: Bearer TOKEN"

# Followups
curl http://localhost:5000/api/appointments/followups/upcoming -H "Authorization: Bearer TOKEN"

# Create
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"patient_id":1,"doctor_id":1,"appointment_date":"2025-11-05","appointment_time":"10:00"}'

# Cancel
curl -X PATCH http://localhost:5000/api/appointments/1/cancel \
  -H "Authorization: Bearer TOKEN"
```

### Invoices
```bash
# List
curl http://localhost:5000/api/invoices -H "Authorization: Bearer TOKEN"

# Stats
curl http://localhost:5000/api/invoices/stats -H "Authorization: Bearer TOKEN"

# Overdue
curl http://localhost:5000/api/invoices/overdue -H "Authorization: Bearer TOKEN"

# Record payment
curl -X POST http://localhost:5000/api/invoices/1/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":1000,"payment_method":"cash"}'
```

---

## File Locations

### Domain Models
```
backend/src/domain/models/
├── Patient.js
├── Medicine.js
├── Appointment.js
└── Invoice.js
```

### Repositories
```
backend/src/infrastructure/repositories/
├── BaseRepository.js
├── PatientRepository.js
├── MedicineRepository.js
├── AppointmentRepository.js
└── InvoiceRepository.js
```

### Services
```
backend/src/application/services/
├── PatientService.js
├── MedicineService.js
├── AppointmentService.js
└── InvoiceService.js
```

### Controllers
```
backend/src/controllers/
├── patient.controller.js
├── medicine.controller.js
├── appointment.controller.js
└── invoice.controller.refactored.js
```

---

## Common Tasks

### Add New Feature
1. Create model in `domain/models/`
2. Create repository in `infrastructure/repositories/`
3. Create service in `application/services/`
4. Create controller in `controllers/`
5. Add routes in `routes/`

### Fix Bug
1. Identify which layer has the bug
2. Fix in that layer only
3. Test the specific layer
4. Verify no regressions

### Add Validation
1. Add to model's `validate()` method
2. Throw appropriate error class
3. Test with invalid data

### Add Business Logic
1. Add method to service class
2. Use repository for data access
3. Use model for validation
4. Return formatted response

### Optimize Query
1. Check repository query
2. Add indexes if needed
3. Use proper filtering
4. Test performance

---

## Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | ValidationError | Invalid input data |
| 401 | UnauthorizedError | Not authenticated |
| 403 | ForbiddenError | Not authorized |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Data conflict (e.g., duplicate) |
| 422 | BusinessError | Business logic violation |
| 500 | DatabaseError | Database error |

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* resource */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description"
}
```

### List Response
```json
{
  "data": [ /* resources */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Database

### Connection
```
Host: localhost
Port: 5432
Database: acms
```

### Tables
- patients
- medicines
- appointments
- invoices
- invoice_payments
- stock_movements
- prescriptions

---

## Testing

### Test Patient Endpoints
```bash
npm run test:patients
```

### Test Medicine Endpoints
```bash
npm run test:medicines
```

### Test Appointment Endpoints
```bash
npm run test:appointments
```

### Test All Endpoints
```bash
npm run test:all
```

---

## Troubleshooting

### Server Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process using port 5000
kill -9 <PID>

# Try again
npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection string in .env
cat .env | grep DATABASE_URL
```

### Frontend Not Connecting
```bash
# Check CORS is enabled
# Check backend is running on port 5000
# Check frontend is on different port (5173)
# Check auth token is valid
```

### API Returns 404
```bash
# Check route exists
# Check controller is exported
# Check middleware is applied
# Check request path is correct
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| REFACTORING_BLUEPRINT.md | Complete refactoring plan |
| BACKEND_REFACTORING_COMPLETE.md | Final documentation |
| FINAL_SUMMARY.md | Project summary |
| QUICK_REFERENCE.md | This file |
| CONTROLLER_REPLACEMENT_GUIDE.md | How to replace controllers |
| ISSUE_FIXED.md | Frontend compatibility fix |

---

## Useful Commands

### View Logs
```bash
# Real-time logs
npm run dev

# Save to file
npm run dev > logs.txt 2>&1
```

### Database Queries
```bash
# Connect to database
psql -U postgres -d acms

# List tables
\dt

# Describe table
\d patients

# Run query
SELECT * FROM patients;
```

### Git Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: refactor backend architecture"

# Push
git push origin main
```

---

## Performance Tips

1. **Use indexes** on frequently queried columns
2. **Limit results** with pagination
3. **Cache responses** for read-heavy operations
4. **Use transactions** for data consistency
5. **Optimize queries** before adding caching
6. **Monitor logs** for slow queries
7. **Use connection pooling** for database

---

## Security Tips

1. **Always validate** input data
2. **Use authentication** on all endpoints
3. **Check authorization** for sensitive operations
4. **Use HTTPS** in production
5. **Sanitize** user input
6. **Use environment variables** for secrets
7. **Log security events** for audit trail

---

## Resources

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **Database:** localhost:5432
- **Documentation:** See markdown files
- **Code:** `backend/src/` and `frontend/src/`

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Production Ready
