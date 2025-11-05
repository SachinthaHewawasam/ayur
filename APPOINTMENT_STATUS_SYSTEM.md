# Appointment Status Management System 🎯

## Overview

Complete appointment status management system with business rules, validation, and user-friendly UI components for marking appointments as cancelled or missed.

## 🏗️ Architecture

### Backend Components
- **AppointmentService**: Business logic and validation
- **Status Controller**: Dedicated endpoints for status changes
- **Validation Rules**: Business rules for status transitions
- **Audit Trail**: Tracking status changes

### Frontend Components
- **Status Manager**: Complete UI for status management
- **Status Badge**: Reusable status display
- **Custom Hooks**: React Query hooks for status operations
- **Service Layer**: API integration

## 📋 Status Flow

```
Scheduled → In Progress → Completed
    ↓          ↓
  Cancelled   Missed
    ↓
  Rescheduled (back to Scheduled)
```

### Business Rules

| From Status | To Status | Rules |
|-------------|-----------|--------|
| **Scheduled** → **In Progress** | Can start 15min before/after scheduled time |
| **Scheduled** → **Cancelled** | Always allowed |
| **Scheduled** → **Missed** | Only past appointments |
| **In Progress** → **Completed** | Must be in progress |
| **In Progress** → **Cancelled** | Always allowed |
| **Cancelled/Missed** → **Scheduled** | Rescheduling allowed |

## 🔧 API Endpoints

### Status Management
```
PATCH /api/appointments/:id/start
PATCH /api/appointments/:id/complete
PATCH /api/appointments/:id/miss
PATCH /api/appointments/:id/cancel
GET /api/appointments/:id/status-rules
```

### Request Examples

#### Start Appointment
```javascript
// PATCH /api/appointments/123/start
// No body required
```

#### Complete Appointment
```javascript
// PATCH /api/appointments/123/complete
{
  "diagnosis": "Patient has flu",
  "treatment_notes": "Prescribed rest and medication",
  "followup_date": "2024-11-15"
}
```

#### Mark as Missed
```javascript
// PATCH /api/appointments/123/miss
{
  "reason": "Patient did not show up"
}
```

#### Cancel Appointment
```javascript
// PATCH /api/appointments/123/cancel
{
  "reason": "Doctor unavailable"
}
```

## 🎨 UI Components

### 1. AppointmentStatusManager
Complete status management with modal dialogs

```jsx
<AppointmentStatusManager 
  appointment={appointment} 
  onStatusChange={handleStatusChange}
/>
```

### 2. StatusBadge
Reusable status display component

```jsx
<StatusBadge 
  status="completed" 
  showIcon={true} 
  size="md" 
/>
```

### 3. Custom Hooks

#### Status Management Hooks
```javascript
// Start appointment
const startMutation = useStartAppointment();

// Complete appointment
const completeMutation = useCompleteAppointment();

// Mark as missed
const missMutation = useMarkAsMissed();

// Cancel appointment
const cancelMutation = useCancelAppointment();

// Get status rules
const { data: statusRules } = useStatusRules(appointmentId);
```

## 🚀 Usage Examples

### Complete Status Management

```jsx
import AppointmentStatusManager from '../components/AppointmentStatusManager';
import { useAppointments } from '../hooks/useAppointments';

function AppointmentsPage() {
  const { data: appointments, refetch } = useAppointments();

  return (
    <div>
      {appointments?.appointments?.map(appointment => (
        <AppointmentStatusManager 
          key={appointment.id}
          appointment={appointment}
          onStatusChange={refetch}
        />
      ))}
    </div>
  );
}
```

### Individual Status Actions

```javascript
// Using individual hooks
const { mutate: markAsMissed } = useMarkAsMissed();

const handleMarkAsMissed = (appointmentId, reason) => {
  markAsMissed({ id: appointmentId, reason });
};
```

## 🎯 Features

### ✅ Backend Features
- **Business rule validation** for status transitions
- **Time-based restrictions** (can't mark future as missed)
- **Role-based access** (doctors, receptionists, admins)
- **Audit trail** with timestamps
- **Reason tracking** for cancellations and missed appointments

### ✅ Frontend Features
- **Real-time status updates** with React Query
- **Loading states** for better UX
- **Error handling** with user-friendly messages
- **Modal dialogs** for reason input
- **Status badges** with icons and colors
- **Business rule awareness** (disabled buttons for invalid transitions)

## 🎨 Status Visual Design

### Color Scheme
- **Scheduled**: Blue (#3B82F6)
- **In Progress**: Yellow (#F59E0B)
- **Completed**: Green (#10B981)
- **Cancelled**: Red (#EF4444)
- **Missed**: Orange (#F97316)

### Icons
- **Scheduled**: Clock icon
- **In Progress**: Play icon
- **Completed**: CheckCircle icon
- **Cancelled**: XCircle icon
- **Missed**: AlertCircle icon

## 🔍 Validation Rules

### Time-based Restrictions
```javascript
// Cannot mark future appointments as missed
const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
if (appointmentDateTime > new Date()) {
  throw new BusinessError('Cannot mark future appointment as missed');
}

// Can start appointment 15 minutes before/after scheduled time
const timeDiff = Math.abs(now - appointmentDateTime) / (1000 * 60); // minutes
if (timeDiff > 15 && now < appointmentDateTime) {
  throw new BusinessError('Cannot start appointment more than 15 minutes early');
}
```

### Status Transition Matrix
```javascript
const transitionRules = {
  scheduled: ['in_progress', 'cancelled', 'missed'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['scheduled'],
  missed: ['scheduled']
};
```

## 🧪 Testing

### Backend Tests
```javascript
// Test status transitions
describe('Appointment Status Management', () => {
  it('should allow marking past appointment as missed', async () => {
    // Test implementation
  });
  
  it('should prevent marking future appointment as missed', async () => {
    // Test implementation
  });
});
```

### Frontend Tests
```javascript
// Test status manager component
describe('AppointmentStatusManager', () => {
  it('should show correct buttons for scheduled status', () => {
    // Test implementation
  });
  
  it('should disable buttons during loading', () => {
    // Test implementation
  });
});
```

## 📊 Migration Guide

### 1. Backend Setup
```bash
# No database changes needed - uses existing schema
# Just restart the server to load new endpoints
```

### 2. Frontend Integration
```bash
# Install dependencies (if not already installed)
npm install lucide-react

# Import components
import AppointmentStatusManager from './components/AppointmentStatusManager';
import StatusBadge from './components/ui/StatusBadge';
```

### 3. Replace Existing Status Display
```jsx
// Old way
<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
  {appointment.status}
</span>

// New way
<StatusBadge status={appointment.status} showIcon />
```

## 🔄 Status Change Workflow

### 1. User Clicks Status Button
### 2. System Validates Transition Rules
### 3. Shows Confirmation Modal (if required)
### 4. Updates Status via API
### 5. Refreshes Data Automatically
### 6. Shows Success/Error Message

## 🎯 Next Steps

1. **Add notifications** for status changes
2. **Implement audit trail** UI
3. **Add bulk operations** for multiple appointments
4. **Create mobile-optimized** status manager
5. **Add email/SMS notifications** for patients

---

## ✅ Implementation Status

| Component | Status | Notes |
|-----------|--------|--------|
| **Backend Endpoints** | ✅ Complete | All status endpoints implemented |
| **Business Rules** | ✅ Complete | Validation and restrictions added |
| **Frontend Hooks** | ✅ Complete | React Query hooks created |
| **UI Components** | ✅ Complete | Status manager and badges ready |
| **Error Handling** | ✅ Complete | User-friendly error messages |
| **Documentation** | ✅ Complete | This comprehensive guide |

**Ready for Production Use! 🚀**
