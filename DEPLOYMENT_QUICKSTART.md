# 🚀 Deployment Quick Start

## Choose Your Deployment Method

### 🎯 Option 1: Docker (Easiest - Recommended)
**Time:** 5 minutes | **Cost:** Free (self-hosted)

```bash
# 1. Copy and edit environment file
copy .env.example .env
# Edit .env with your passwords

# 2. Run deployment script
# Windows:
deploy-docker.bat

# Mac/Linux:
chmod +x deploy-docker.sh
./deploy-docker.sh

# 3. Access your app
# Frontend: http://localhost
# Backend: http://localhost:5000/api
```

**✅ Done! Your app is running locally!**

---

### ☁️ Option 2: Render.com (Free Cloud Hosting)
**Time:** 10 minutes | **Cost:** Free tier available

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### Step 2: Deploy Database
1. Go to [render.com](https://render.com) → Sign up
2. Click "New +" → "PostgreSQL"
3. Name: `acms-database`
4. Click "Create Database"
5. Copy the **Internal Database URL**

#### Step 3: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `acms-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste Internal Database URL>
   JWT_SECRET=your_secret_key_min_32_chars
   JWT_EXPIRE=7d
   ```
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy your backend URL: `https://acms-backend-xxx.onrender.com`

#### Step 4: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `acms-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://acms-backend-xxx.onrender.com/api
   ```
5. Click "Create Static Site"
6. Wait for deployment (2-3 minutes)

#### Step 5: Run Database Migration
1. Go to your backend service on Render
2. Click "Shell" tab
3. Run:
   ```bash
   node run-settings-migration.js
   ```

**✅ Done! Your app is live!**
- Frontend: `https://acms-frontend-xxx.onrender.com`
- Backend: `https://acms-backend-xxx.onrender.com`

---

### 🚂 Option 3: Railway.app (Easy + Fast)
**Time:** 5 minutes | **Cost:** $5/month

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway init
railway up

# 4. Add database
railway add --database postgres

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_key

# 6. Done!
railway open
```

---

### 🌊 Option 4: DigitalOcean (Production-Ready)
**Time:** 15 minutes | **Cost:** $12-25/month

1. **Create Droplet:**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create → Droplets
   - Choose: Ubuntu 22.04, Basic plan ($6/mo)
   - Add SSH key

2. **SSH into server:**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Install Docker Compose:**
   ```bash
   apt install docker-compose -y
   ```

5. **Clone your repo:**
   ```bash
   git clone YOUR_REPO_URL
   cd ayur
   ```

6. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit passwords
   ```

7. **Deploy:**
   ```bash
   docker-compose up -d
   ```

8. **Access:**
   - `http://your_droplet_ip`

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] `package.json` has `"start": "node src/server.js"`
- [ ] `.env` file configured with secure passwords
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] Database URL is correct
- [ ] CORS origin set for frontend domain

### Frontend
- [ ] `VITE_API_URL` points to backend
- [ ] Build works: `npm run build`
- [ ] No console errors in production build

### Database
- [ ] PostgreSQL 14+ available
- [ ] Database created
- [ ] Migrations ready to run

---

## 🔧 Environment Variables

### Backend `.env`
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend `.env`
```bash
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🧪 Testing After Deployment

### 1. Health Check
```bash
# Backend
curl https://your-backend.com/api/health

# Should return: {"status":"healthy"}
```

### 2. Test Login
1. Go to frontend URL
2. Login with default credentials
3. Verify dashboard loads

### 3. Test Features
- [ ] Create patient
- [ ] Create appointment
- [ ] Add medicine
- [ ] Generate invoice
- [ ] Update settings

---

## 🆘 Common Issues

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check DATABASE_URL format
postgresql://username:password@host:5432/database_name

# Test connection
psql $DATABASE_URL
```

### Issue: "CORS error"
**Solution:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

### Issue: "Frontend shows blank page"
**Solution:**
```bash
# Check browser console for errors
# Verify VITE_API_URL is correct
echo $VITE_API_URL

# Rebuild frontend
npm run build
```

### Issue: "502 Bad Gateway"
**Solution:**
```bash
# Backend not running, check logs
docker-compose logs backend

# Or on cloud platform, check service logs
```

---

## 📊 Cost Comparison

| Platform | Setup Time | Monthly Cost | Best For |
|----------|------------|--------------|----------|
| **Docker (Local)** | 5 min | $0 | Development |
| **Render Free** | 10 min | $0 | Demo/Testing |
| **Render Paid** | 10 min | $7-15 | Small clinic |
| **Railway** | 5 min | $5-20 | Easy deploy |
| **DigitalOcean** | 15 min | $12-25 | Production |
| **AWS** | 30 min | $50-100 | Enterprise |

---

## 🎯 Recommended Path

### For Testing:
**→ Docker (Local)** or **Render (Free)**

### For Production:
**→ Railway** or **DigitalOcean**

### For Enterprise:
**→ AWS** or **Azure**

---

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review error logs
3. Verify environment variables
4. Test database connection
5. Check firewall/security groups

---

## ✅ Success!

After deployment, you should have:
- ✅ Frontend accessible via URL
- ✅ Backend API responding
- ✅ Database connected
- ✅ HTTPS enabled (on cloud platforms)
- ✅ All features working

**Your ACMS is now deployed! 🎉**

---

## 🔄 Updating After Deployment

### Docker:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Render/Railway:
```bash
git push origin main
# Auto-deploys on push
```

### Manual:
```bash
git pull
cd backend && npm install && pm2 restart backend
cd ../frontend && npm install && npm run build
```

---

**Ready to deploy? Choose your method above and follow the steps!** 🚀
