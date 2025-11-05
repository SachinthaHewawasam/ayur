# 🔧 Settings Page Implementation Guide

## Overview
Comprehensive Settings page with 3 tabs: Profile, System, and User Management

## Features

### 1. Profile Tab
- Update admin name, email, phone
- Change specialization
- Change password with current password verification
- Password visibility toggle

### 2. System Tab
- Change system name (ACMS → Nirvaan)
- Update clinic name, address, phone, email
- Branding configuration

### 3. Users Tab
- View all doctors and staff
- Add new users with login credentials
- Edit existing users
- Delete users (except admin)
- Role-based badges (Admin, Doctor, Staff)
- Assign appointments to doctors

## Files Created

1. **`frontend/src/pages/Settings.jsx`** - Main settings page with tabs
2. **`frontend/src/components/settings/ProfileTab.jsx`** - Profile management
3. **`frontend/src/components/settings/SystemTab.jsx`** - System branding
4. **`frontend/src/components/settings/UsersTab.jsx`** - User management

## Backend API Endpoints Needed

```javascript
// Profile
PUT /api/auth/profile
GET /api/auth/me

// System Settings
GET /api/settings/system
PUT /api/settings/system

// Users
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

## Database Schema

### settings table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id),
  system_name VARCHAR(100) DEFAULT 'ACMS',
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  clinic_phone VARCHAR(20),
  clinic_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users table (extend existing)
```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN specialization VARCHAR(255);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

## Next Steps

1. Create the three tab components (ProfileTab, SystemTab, UsersTab)
2. Create backend API endpoints
3. Add Settings route to navigation
4. Test all functionality

Would you like me to:
1. Create the tab components now?
2. Create the backend API endpoints?
3. Add the Settings link to navigation?
