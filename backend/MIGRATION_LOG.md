# Database Migration Log

## 2025-11-05: Add 'in_progress' Status to Appointment Enum

### Issue
The backend service was attempting to set appointment status to `'in_progress'`, but this value was missing from the `appointment_status` enum in the database, causing the error:
```
invalid input value for enum appointment_status: "in_progress"
```

### Solution
Added `'in_progress'` to the `appointment_status` enum type.

### Files Modified
1. **schema.sql** - Updated enum definition to include `'in_progress'` for new installations
2. **migrations/add_in_progress_status.sql** - Created migration script to add the value to existing databases

### Migration Applied
```bash
node run-migration.js
```

### Current Enum Values
The `appointment_status` enum now includes:
- `scheduled`
- `in_progress` ← **NEW**
- `completed`
- `cancelled`
- `missed`
- `rescheduled`

### Impact
- Appointments can now be properly transitioned to "in progress" status when started
- The start appointment endpoint (`PATCH /api/appointments/:id/start`) now works correctly
- Frontend status management is fully functional

### Testing
After applying this migration:
1. Start an appointment from the Dashboard
2. Verify the status changes to "In Progress"
3. Complete the appointment
4. Verify the status changes to "Completed"
