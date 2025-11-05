# 🏥 Ayurvedic Clinic Management System (ACMS)

A comprehensive, modern, and cost-effective clinic management system specifically designed for Ayurvedic clinics. Built with a focus on minimal operational costs and rapid deployment.

![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ACMS is a complete clinic management solution that helps Ayurvedic clinics streamline their operations, manage patient records, schedule appointments, track inventory, and generate reports. The system is designed to be deployed with minimal infrastructure costs while maintaining professional-grade features.

### Key Highlights

- ✅ **Low Cost**: ~$10-20/month operational cost using free tiers
- ✅ **Fast Setup**: MVP ready in 6-8 weeks
- ✅ **Modern UI**: Clean, responsive interface built with React & Tailwind
- ✅ **Secure**: JWT authentication, encrypted data storage
- ✅ **Scalable**: Built to grow with your clinic
- ✅ **Mobile Ready**: Progressive Web App (PWA) support

## 🚀 Features

### Current MVP Features (v1.0)

#### User Management
- Multi-role authentication (Admin, Doctor, Receptionist, Pharmacy)
- Secure JWT-based login
- Role-based access control
- User profile management

#### Patient Management
- Complete patient registration
- Demographic information
- Dosha type classification (Vata, Pitta, Kapha)
- Allergy tracking
- Medical history records
- Unique patient codes
- Search and filter capabilities

#### Appointment System
- Appointment scheduling
- Today's appointments dashboard
- Doctor-patient assignments
- Appointment status tracking (Scheduled, Completed, Cancelled, Missed)
- Chief complaint recording
- Follow-up date tracking

#### Dashboard & Reports
- Real-time clinic statistics
- Today's appointments overview
- Patient count tracking
- Quick access to important metrics

### Coming Soon (v1.1+)

- 💊 Medicine inventory management
- 📝 Prescription management
- 💰 Billing and invoicing
- 📊 Advanced analytics and reports
- 📧 Email/SMS notifications
- 📱 Native mobile apps (iOS/Android)
- 🔔 Appointment reminders
- 📈 Revenue tracking

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: bcryptjs, helmet, cors
- **ORM**: pg (node-postgres)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: Formik + Yup
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Utilities**: date-fns

### Infrastructure (Recommended)
- **Hosting**: Render / Railway (free tier)
- **Database**: PostgreSQL on hosting platform
- **CDN**: Cloudflare (free tier)
- **File Storage**: Cloudinary (free tier)
- **Email**: SendGrid (free tier)
- **SMS**: Twilio (pay-per-use)

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  React App (Vite) + Tailwind CSS                            │
│  - Authentication Context                                   │
│  - React Query for API calls                                │
│  - Protected Routes                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Cloudflare CDN
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                               │
│  Express.js REST API                                        │
│  - JWT Authentication Middleware                            │
│  - Role-based Authorization                                 │
│  - Request Validation (Joi)                                 │
│  - Error Handling                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                │
│  PostgreSQL with Connection Pool                            │
│  - Users, Patients, Appointments                            │
│  - Medicines, Prescriptions, Bills                          │
│  - Indexed for performance                                  │
└─────────────────────────────────────────────────────────────┘
```

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ayur
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Seed initial data (optional but recommended)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Login

Open `http://localhost:5173` in your browser and login with:

- **Admin**: admin@clinic.com / password123
- **Doctor**: doctor@clinic.com / password123
- **Receptionist**: receptionist@clinic.com / password123

## 📦 Installation

### Detailed Setup Guide

#### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### Step 2: Database Setup

1. Install PostgreSQL 14+ on your system
2. Create a new database:

```sql
CREATE DATABASE acms_db;
```

3. Update `backend/.env` with your database credentials

#### Step 3: Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=acms_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 4: Run Migrations

```bash
cd backend
npm run migrate
```

This will create all necessary tables with proper relationships and indexes.

#### Step 5: Seed Database (Optional)

```bash
npm run seed
```

This creates:
- 4 demo users (admin, doctor, receptionist, pharmacy)
- 5 sample medicines
- 3 sample patients
- 3 sample appointments

#### Step 6: Start Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## ⚙️ Configuration

### Backend Configuration

The backend can be configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | acms_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | Token expiration | 7d |
| `ALLOWED_ORIGINS` | CORS origins | localhost:5173 |

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | /api |

## 🚢 Deployment

### Deploying to Render (Recommended)

#### Backend Deployment

1. Create account on [Render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Add environment variables from `.env.example`
6. Create a PostgreSQL database (Render provides free tier)
7. Deploy!

#### Frontend Deployment

1. Create a new **Static Site** on Render
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
3. Add environment variable:
   - `VITE_API_URL`: Your backend URL
4. Deploy!

### Alternative: Railway

Similar steps apply for [Railway.app](https://railway.app), which also offers free tier hosting.

### Production Checklist

- [ ] Change all default passwords
- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Enable SSL/HTTPS (provided by Render/Railway)
- [ ] Configure database backups
- [ ] Set up monitoring (Sentry recommended)
- [ ] Configure CORS properly for production domain
- [ ] Review and tighten security headers
- [ ] Set up CDN (Cloudflare recommended)

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Rajesh Kumar",
    "email": "doctor@clinic.com",
    "role": "doctor"
  }
}
```

### Patients

#### Get All Patients
```http
GET /api/patients?search=john
Authorization: Bearer <token>
```

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "age": 45,
  "gender": "Male",
  "dosha_type": "vata_pitta"
}
```

### Appointments

#### Get Today's Appointments
```http
GET /api/appointments/today
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient_id": 1,
  "doctor_id": 1,
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00:00",
  "chief_complaint": "General checkup"
}
```

For complete API documentation, see [API.md](./docs/API.md) (coming soon).

## 💰 Cost Estimation

### First Year Costs

| Item | Cost | Notes |
|------|------|-------|
| Development | $5,000-$10,000 | One-time |
| Hosting | $0-$120/year | Free tier for MVP |
| Domain | $12/year | .com domain |
| SSL | $0 | Free via Let's Encrypt |
| SMS/Email | $200-$500/year | Pay-per-use |
| **Total** | **~$5,200-$10,650** | First year |

### Ongoing Costs (Year 2+)

- Hosting: $10-20/month
- SMS/Email: ~$50/month
- **Total: ~$720-$840/year**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Ayurvedic healthcare practitioners
- Inspired by traditional healing wisdom meets modern technology
- Special thanks to the open-source community

## 📞 Support

For support, email support@yourclinicdomain.com or create an issue in this repository.

---

**Built with ❤️ for Ayurvedic Healthcare**
#   a y u r  
 