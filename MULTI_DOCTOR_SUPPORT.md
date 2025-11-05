# 👨‍⚕️ Multi-Doctor Support - Complete Guide

## ✅ What's Already Working

Your system **already supports multiple doctors**! Here's what's in place:

### Backend Support
- ✅ `doctor_id` field in appointments table
- ✅ Doctor assignment in appointment creation
- ✅ Doctor filtering in appointment queries
- ✅ Doctor information in appointment responses
- ✅ User management with role-based access (admin, doctor, staff)

### Frontend Support
- ✅ Doctor selection dropdown in appointment creation
- ✅ Doctor name display in appointment lists
- ✅ Doctor filtering in appointment views
- ✅ Doctor information in appointment details

---

## 🎯 How It Works

### 1. Add Doctors via Settings

**Navigate to:** `http://localhost:5174/settings` → **Users Tab**

**Steps:**
1. Click "Add User" button
2. Fill in details:
   - Name: `Dr. Jane Smith`
   - Email: `jane@clinic.lk`
   - Phone: `+94 77 999 8888`
   - Role: **Doctor** (select from dropdown)
   - Specialization: `Panchakarma` (optional)
   - Password: Set login credentials
3. Click "Create User"

**Result:** New doctor is added and can:
- Log in to the system
- Be assigned appointments
- View their appointments
- Manage patients

### 2. Assign Appointments to Doctors

**When creating an appointment:**

1. **From Calendar:** Click on a time slot
2. **From Appointments:** Click "New Appointment"
3. **Fill the form:**
   - Select Patient
   - **Select Doctor** (dropdown shows all doctors)
   - Choose Date & Time
   - Add Chief Complaint
4. Click "Create Appointment"

**The appointment is now assigned to the selected doctor!**

### 3. View Doctor Assignments

**Appointments List shows:**
- Patient name
- **Doctor name** (e.g., "Dr. Jane Smith")
- Date & Time
- Status

**Filter by Doctor:**
- Use the doctor filter in appointments view
- See only appointments for specific doctors

---

## 🔧 Recent Update

### AppointmentModal.jsx Enhancement

**Before:**
```javascript
// Only showed current logged-in user as doctor
const response = await api.get('/auth/profile');
return { doctors: [response.data.user] };
```

**After:**
```javascript
// Fetches all doctors from the system
const response = await api.get('/users');
const doctors = response.data.users.filter(
  user => user.role === 'doctor' || user.role === 'admin'
);
return { doctors };
```

**What this means:**
- ✅ All doctors appear in the dropdown
- ✅ Admin can assign appointments to any doctor
- ✅ Doctors can assign appointments to themselves or colleagues

---

## 📊 Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(50),  -- 'admin', 'doctor', 'staff'
  specialization VARCHAR(255),
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true
)
```

### Appointments Table
```sql
appointments (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES users(id),  -- Links to doctor
  appointment_date DATE,
  appointment_time TIME,
  status VARCHAR(50),
  chief_complaint TEXT
)
```

---

## 🎯 Use Cases

### Scenario 1: Multi-Specialty Clinic
```
Doctors:
- Dr. Admin (Admin) - Ayurvedic Medicine
- Dr. Jane Smith (Doctor) - Panchakarma
- Dr. John Doe (Doctor) - Herbal Medicine

Appointments:
- 9:00 AM - Patient A → Dr. Jane Smith
- 10:00 AM - Patient B → Dr. John Doe
- 11:00 AM - Patient C → Dr. Admin
```

### Scenario 2: Doctor Availability
```
Monday:
- Dr. Jane Smith: 9 AM - 2 PM
- Dr. John Doe: 2 PM - 7 PM

Tuesday:
- Dr. Jane Smith: Full day
- Dr. John Doe: Off
```

### Scenario 3: Specialization-Based Assignment
```
Patient needs Panchakarma treatment
→ Assign to Dr. Jane Smith (Panchakarma specialist)

Patient needs general consultation
→ Assign to any available doctor
```

---

## 🔒 Permissions & Access

### Admin Role
- ✅ Can add/edit/delete doctors
- ✅ Can assign appointments to any doctor
- ✅ Can view all appointments
- ✅ Can manage system settings

### Doctor Role
- ✅ Can view their own appointments
- ✅ Can view all patients
- ✅ Can create appointments (assign to self or others)
- ✅ Can update appointment status
- ❌ Cannot manage other doctors
- ❌ Cannot access system settings

### Staff Role
- ✅ Can create appointments
- ✅ Can view appointments
- ✅ Can manage patients
- ❌ Cannot manage users
- ❌ Cannot access system settings

---

## 📝 API Endpoints

### Get All Users (Including Doctors)
```javascript
GET /api/users

Response:
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "Dr. Admin",
      "email": "admin@clinic.lk",
      "role": "admin",
      "specialization": "Ayurvedic Medicine"
    },
    {
      "id": 2,
      "name": "Dr. Jane Smith",
      "email": "jane@clinic.lk",
      "role": "doctor",
      "specialization": "Panchakarma"
    }
  ]
}
```

### Create Appointment with Doctor
```javascript
POST /api/appointments
Body: {
  "patient_id": 123,
  "doctor_id": 2,  // Dr. Jane Smith
  "appointment_date": "2025-11-06",
  "appointment_time": "10:00:00",
  "chief_complaint": "Back pain treatment"
}
```

### Filter Appointments by Doctor
```javascript
GET /api/appointments?doctor_id=2

Returns: All appointments for Dr. Jane Smith
```

---

## ✅ Testing Checklist

### Add Multiple Doctors
- [ ] Go to Settings → Users
- [ ] Add 2-3 doctors with different specializations
- [ ] Verify they appear in the users list
- [ ] Check role badges are correct

### Assign Appointments
- [ ] Create new appointment
- [ ] See all doctors in dropdown
- [ ] Select different doctors
- [ ] Verify appointment shows correct doctor name

### View Assignments
- [ ] Go to Appointments page
- [ ] See doctor names for each appointment
- [ ] Filter by specific doctor
- [ ] Verify correct appointments show

### Doctor Login
- [ ] Log out as admin
- [ ] Log in as doctor
- [ ] Verify doctor can see appointments
- [ ] Verify doctor can create appointments

---

## 🎉 Summary

**Your system is fully equipped for multi-doctor operations!**

✅ **Backend:** Complete support for multiple doctors
✅ **Frontend:** Doctor selection and display working
✅ **Settings:** Easy doctor management
✅ **Appointments:** Full doctor assignment capability
✅ **Filtering:** View appointments by doctor
✅ **Permissions:** Role-based access control

**To start using:**
1. Add doctors via Settings → Users tab
2. Create appointments and select doctors
3. View and filter appointments by doctor
4. Each doctor can log in and manage their appointments

**Everything is ready to go!** 🚀
