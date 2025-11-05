# ⚡ Quick Start Guide - ACMS

Get your Ayurvedic Clinic Management System up and running in 10 minutes!

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 🚀 Setup Steps

### 1. Install PostgreSQL (if not installed)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE acms_db;

# Exit
\q
```

### 3. Clone & Setup

```bash
# Clone repository
cd Desktop
cd ayur

# Backend Setup
cd backend
npm install
cp .env.example .env

# Edit .env file with your database password
# Change DB_PASSWORD=your_password_here to your actual PostgreSQL password

# Run migrations
npm run migrate

# Seed demo data
npm run seed

# Start backend
npm run dev
```

**In a new terminal:**

```bash
# Frontend Setup
cd Desktop/ayur/frontend
npm install
cp .env.example .env

# Start frontend
npm run dev
```

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

### 5. Login with Demo Credentials

- **Admin**: admin@clinic.com / password123
- **Doctor**: doctor@clinic.com / password123
- **Receptionist**: receptionist@clinic.com / password123
- **Pharmacy**: pharmacy@clinic.com / password123

## 🎯 What You Can Do Now

### As a Doctor:
- ✅ View today's appointments on dashboard
- ✅ Add new patients
- ✅ View patient details and history
- ✅ Search patients by name/phone

### As a Receptionist:
- ✅ Register new patients
- ✅ Book appointments
- ✅ Manage patient records

### As an Admin:
- ✅ Full access to all features
- ✅ Manage users
- ✅ View system-wide statistics

## 🔧 Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for PostgreSQL service

# Mac/Linux:
sudo systemctl status postgresql
# or
brew services list | grep postgresql
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Change PORT in backend/.env
PORT=5001
```

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules
npm install
```

### Issue: "Migration fails"

**Solution:**
```bash
# Make sure database exists
psql -U postgres -c "CREATE DATABASE acms_db;"

# Check database credentials in .env
# Run migration again
npm run migrate
```

## 📦 Project Structure

```
ayur/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   ├── validators/   # Input validation schemas
│   │   └── database/     # Migrations and seeds
│   ├── .env              # Environment variables
│   └── package.json
│
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Auth context
│   │   ├── services/     # API service
│   │   └── main.jsx      # Entry point
│   ├── .env              # Environment variables
│   └── package.json
│
└── README.md             # Complete documentation
```

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Start development server
npm run migrate  # Run database migrations
npm run seed     # Seed demo data
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📊 Next Steps

1. **Customize for Your Clinic**
   - Update clinic name in database
   - Change default passwords
   - Add your clinic logo

2. **Add More Features**
   - Medicine inventory (coming in v1.1)
   - Prescription management
   - Billing system
   - Email/SMS notifications

3. **Deploy to Production**
   - Follow deployment guide in README.md
   - Use Render.com (free tier available)
   - Set up custom domain

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💡 Tips

- Use the **search** feature to quickly find patients
- The **dashboard** shows today's appointments at a glance
- All dates use **YYYY-MM-DD** format
- Phone numbers should be **10 digits** without country code

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review error messages in terminal/console
- Check browser DevTools (F12) for frontend errors
- Ensure both backend and frontend are running

## ✅ Success Indicators

You've successfully set up ACMS when:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ You can login with demo credentials
- ✅ Dashboard shows stats and appointments
- ✅ You can add a new patient
- ✅ No errors in terminal or browser console

---

**Happy Coding! 🎉**

If everything is working, you now have a fully functional clinic management system!
