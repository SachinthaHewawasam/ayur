# ⚙️ Settings Backend API - Implementation Complete!

## ✅ What's Been Created

### Backend Files Created:

1. **Database Migration**
   - `backend/src/database/migrations/006_create_settings_table.sql`
   - Creates `settings` table
   - Adds `specialization` and `phone` to `users` table

2. **Repository Layer**
   - `backend/src/infrastructure/repositories/SettingsRepository.js`
   - Database operations for settings

3. **Service Layer**
   - `backend/src/application/services/SettingsService.js`
   - Business logic for settings management

4. **Controllers**
   - `backend/src/controllers/settings.controller.js` - System settings
   - `backend/src/controllers/users.controller.js` - User management (CRUD)

5. **Routes**
   - `backend/src/routes/settings.routes.js`
   - `backend/src/routes/users.routes.js`

6. **Server Integration**
   - Updated `backend/src/server.js` with new routes

---

## 🔌 API Endpoints

### Settings Endpoints

```javascript
GET  /api/settings/system    // Get system settings
PUT  /api/settings/system    // Update system settings
```

### User Management Endpoints

```javascript
GET    /api/users           // Get all users
GET    /api/users/:id       // Get user by ID
POST   /api/users           // Create new user
PUT    /api/users/:id       // Update user
DELETE /api/users/:id       // Delete user (soft delete)
```

---

## 🗄️ Database Schema

### Settings Table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id),
  system_name VARCHAR(100) DEFAULT 'ACMS',
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  clinic_phone VARCHAR(20),
  clinic_email VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Users Table Updates
```sql
ALTER TABLE users 
ADD COLUMN specialization VARCHAR(255),
ADD COLUMN phone VARCHAR(20);
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

**Option A: Using psql command line**
```bash
psql -U postgres -d ayurvedic_clinic -f backend/src/database/migrations/006_create_settings_table.sql
```

**Option B: Using pgAdmin or any PostgreSQL client**
1. Open the migration file
2. Copy the SQL
3. Run it in your database

**Option C: Manual SQL execution**
Connect to your database and run the SQL from the migration file.

### Step 2: Restart Backend Server

```bash
cd backend
npm run dev
```

The server will now have the new endpoints available!

### Step 3: Update Frontend (Next Step)

The frontend Settings page needs to be updated to use these API endpoints instead of local state.

---

## 📊 API Request/Response Examples

### Get System Settings
```javascript
GET /api/settings/system

Response:
{
  "success": true,
  "settings": {
    "system_name": "ACMS",
    "clinic_name": "Nirvaan Ayurvedic Clinic",
    "clinic_address": "123 Galle Road, Colombo",
    "clinic_phone": "+94 11 234 5678",
    "clinic_email": "info@nirvaan.lk"
  }
}
```

### Update System Settings
```javascript
PUT /api/settings/system
Body: {
  "system_name": "Nirvaan",
  "clinic_name": "Nirvaan Ayurvedic Clinic",
  "clinic_address": "123 Galle Road, Colombo 03",
  "clinic_phone": "+94 11 234 5678",
  "clinic_email": "info@nirvaan.lk"
}

Response:
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

### Get All Users
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
      "phone": "+94 77 123 4567",
      "role": "admin",
      "specialization": "Ayurvedic Medicine",
      "is_active": true
    }
  ]
}
```

### Create New User
```javascript
POST /api/users
Body: {
  "name": "Dr. Jane Smith",
  "email": "jane@clinic.lk",
  "phone": "+94 77 999 8888",
  "role": "doctor",
  "specialization": "Panchakarma",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "user": { ... }
}
```

### Update User
```javascript
PUT /api/users/:id
Body: {
  "name": "Dr. Jane Smith Updated",
  "email": "jane.smith@clinic.lk",
  "phone": "+94 77 999 8888",
  "role": "doctor",
  "specialization": "Panchakarma & Ayurvedic Medicine"
}

Response:
{
  "success": true,
  "message": "User updated successfully",
  "user": { ... }
}
```

### Delete User
```javascript
DELETE /api/users/:id

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🔒 Security Features

### Authentication
- All endpoints require authentication
- Uses JWT token from login

### Authorization
- Users can only manage users in their clinic
- Admin users cannot be deleted
- Soft delete (sets is_active = false)

### Password Security
- Passwords hashed with bcrypt
- Passwords never returned in API responses

### Validation
- Email uniqueness checked
- Required fields validated
- Clinic isolation enforced

---

## 🎯 Next Steps

### Update Frontend to Use API

The Settings.jsx file needs to be updated to:

1. **Replace useState with useQuery** for fetching data
2. **Replace mock data** with API calls
3. **Use useMutation** for create/update/delete operations
4. **Remove useEffect syncing** (data comes from API)

Would you like me to:
1. ✅ Update the frontend Settings page to use these APIs?
2. ✅ Test the endpoints with sample requests?
3. ✅ Add profile update endpoint for current user?

---

## 📝 Testing Checklist

Once migration is run and server restarted:

**Settings:**
- [ ] GET /api/settings/system returns default settings
- [ ] PUT /api/settings/system updates and persists
- [ ] Changes survive server restart

**Users:**
- [ ] GET /api/users returns current users
- [ ] POST /api/users creates new user
- [ ] PUT /api/users/:id updates user
- [ ] DELETE /api/users/:id soft deletes user
- [ ] Cannot delete admin users
- [ ] Email uniqueness enforced

---

## ✅ Status

**Backend: COMPLETE** ✅
- Database schema created
- Repository layer implemented
- Service layer implemented
- Controllers created
- Routes configured
- Server integrated

**Frontend: PENDING** ⏳
- Needs to be updated to use API calls
- Remove mock data
- Add loading states
- Add error handling

**Ready to proceed with frontend integration!** 🚀
