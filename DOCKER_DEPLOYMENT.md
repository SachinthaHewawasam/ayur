# 🐳 Docker Deployment Guide - ACMS

## 🎯 What This Does

Deploys your **entire ACMS application** in Docker containers with **all your data**:
- ✅ PostgreSQL database with your users, patients, appointments
- ✅ Backend API
- ✅ Frontend UI
- ✅ Everything runs locally or on any server with Docker

---

## 📋 Prerequisites

1. **Docker Desktop** installed
   - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Already have it? Great!

2. **Your exported database** (already done! ✅)
   - File: `database-init/02-seed-data.sql`
   - Contains: 2 clinics, 3 users, 5 patients

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Environment File

Create `.env` file in the root directory:

```bash
# Database
DB_PASSWORD=postgres123

# JWT Secret
JWT_SECRET=acms_super_secret_key_2025_production
```

### Step 2: Start Everything

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will:
1. ⏳ Pull Docker images (first time only, ~5 min)
2. 🗄️ Create PostgreSQL database
3. 📊 Load your data (users, patients, etc.)
4. 🚀 Start backend API
5. 🎨 Start frontend

### Step 3: Access Your App

Open your browser:
```
http://localhost
```

**Login with:**
- Email: `admin@clinic.com`
- Password: `admin123`

---

## 🎉 That's It!

Your entire clinic management system is running!

---

## 📊 What's Running?

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost | 80 |
| **Backend API** | http://localhost:5000 | 5000 |
| **Database** | localhost:5432 | 5432 |

---

## 🛠️ Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Just backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Just database
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

### Stop and Remove Data
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Restart a Service
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔄 Update Your App

Made code changes? Rebuild and restart:

```bash
# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Or rebuild specific service
docker-compose -f docker-compose.prod.yml up -d --build backend
```

---

## 💾 Backup Your Data

### Export Database
```bash
docker exec acms-postgres pg_dump -U postgres ayurvedic_clinic > backup.sql
```

### Restore Database
```bash
docker exec -i acms-postgres psql -U postgres ayurvedic_clinic < backup.sql
```

---

## 🌐 Deploy to Cloud

This Docker setup works on:

### 1. **DigitalOcean App Platform**
- Upload your code
- Select "Docker Compose"
- Deploy!
- **Cost:** $12/month

### 2. **AWS ECS**
- Push to ECR
- Create ECS service
- **Cost:** ~$20/month

### 3. **Railway**
- Connect GitHub
- Deploy Docker Compose
- **Cost:** $5/month (with credit)

### 4. **Your Own VPS**
- Any Ubuntu server
- Install Docker
- Run `docker-compose up -d`
- **Cost:** $5-10/month

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.prod.yml
ports:
  - "8080:80"  # Frontend on port 8080
  - "5001:5000"  # Backend on port 5001
```

### Database Won't Start
```bash
# Remove old data and restart
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Can't Connect to Backend
```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend
```

---

## ✅ Your Data is Included!

The deployment includes:

**Users:**
- Admin User (admin@clinic.com)
- Dr. Hasintha Hewawasam (hasintha@clinic.com)
- Dr. Hirushi Rodrigo (hirushi@clinic.com)

**Patients:**
- All 5 patients you created

**Settings:**
- Clinic information
- Currency (LKR)
- Consultation fees

---

## 🎯 Benefits Over Render

| Feature | Docker | Render Free |
|---------|--------|-------------|
| **Always On** | ✅ Yes | ❌ Sleeps after 15 min |
| **Full Control** | ✅ Yes | ❌ Limited |
| **Local Testing** | ✅ Yes | ❌ No |
| **Data Backup** | ✅ Easy | ⚠️ Manual |
| **Cost** | ✅ Free (local) | ✅ Free |
| **Speed** | ✅ Fast | ⚠️ Slow startup |

---

## 🚀 Ready to Deploy?

```bash
# 1. Create .env file (see Step 1 above)
# 2. Start everything
docker-compose -f docker-compose.prod.yml up -d

# 3. Open http://localhost
```

**Your clinic management system is now running!** 🎉

---

## 📞 Need Help?

Common issues:
1. **Docker not running?** Start Docker Desktop
2. **Port 80 in use?** Change to 8080 in docker-compose.prod.yml
3. **Database errors?** Check logs: `docker-compose logs postgres`

---

## 🎊 You're Done!

Your ACMS is now:
- ✅ Fully containerized
- ✅ Running with all your data
- ✅ Easy to deploy anywhere
- ✅ Simple to backup and restore

**Enjoy your clinic management system!** 🏥
