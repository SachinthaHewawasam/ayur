# 🚀 Deployment Guide - ACMS (Nirvaan)

## 📋 Table of Contents
1. [Quick Deploy (Easiest)](#quick-deploy-easiest)
2. [Production Deploy (Recommended)](#production-deploy-recommended)
3. [Docker Deploy](#docker-deploy)
4. [Cloud Platforms](#cloud-platforms)
5. [Environment Setup](#environment-setup)
6. [Post-Deployment](#post-deployment)

---

## 🎯 Quick Deploy (Easiest)

### Option 1: Render.com (Free Tier Available)
**Best for:** Quick deployment, free hosting, automatic SSL

#### Backend Deployment

1. **Push to GitHub:**
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. **Deploy on Render:**
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repo
- Configure:
  ```
  Name: acms-backend
  Environment: Node
  Build Command: npm install
  Start Command: npm start
  ```

3. **Add Environment Variables:**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRE=7d
```

4. **Database (PostgreSQL):**
- On Render: "New +" → "PostgreSQL"
- Copy the Internal Database URL
- Use it as `DATABASE_URL` in backend

#### Frontend Deployment

1. **Update API URL:**
```javascript
// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://acms-backend.onrender.com/api';
```

2. **Deploy on Render:**
- "New +" → "Static Site"
- Connect GitHub repo
- Configure:
  ```
  Name: acms-frontend
  Build Command: cd frontend && npm install && npm run build
  Publish Directory: frontend/dist
  ```

3. **Add Environment Variable:**
```
VITE_API_URL=https://acms-backend.onrender.com/api
```

**Done! Your app is live! 🎉**

---

## 🏆 Production Deploy (Recommended)

### Option 2: Railway.app
**Best for:** Easy deployment, better performance than Render free tier

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 2. Deploy Backend
```bash
cd backend
railway init
railway add --database postgres
railway up
```

#### 3. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_key_here
railway variables set PORT=5000
```

#### 4. Deploy Frontend
```bash
cd ../frontend
railway init
railway up
```

**Cost:** ~$5-10/month for both services

---

### Option 3: Vercel + Supabase
**Best for:** Serverless, global CDN, excellent performance

#### Backend (Vercel Serverless)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Create `vercel.json` in backend:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy:**
```bash
cd backend
vercel --prod
```

#### Frontend (Vercel)

1. **Deploy:**
```bash
cd frontend
vercel --prod
```

2. **Set Environment Variables:**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend.vercel.app/api
```

#### Database (Supabase)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string
4. Add to Vercel backend env: `DATABASE_URL`

**Cost:** Free tier available, ~$25/month for production

---

## 🐳 Docker Deploy

### Option 4: Docker Compose (Self-Hosted)
**Best for:** Full control, self-hosted, any VPS

#### 1. Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: acms-db
    environment:
      POSTGRES_DB: ayurvedic_clinic
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    networks:
      - acms-network
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: acms-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/ayurvedic_clinic
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRE: 7d
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - acms-network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:5000/api
    container_name: acms-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - acms-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  acms-network:
    driver: bridge
```

#### 2. Create Backend Dockerfile:
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### 3. Create Frontend Dockerfile:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 4. Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. Create `.env` file:
```bash
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_min_32_characters
```

#### 6. Deploy:
```bash
docker-compose up -d
```

**Access:** http://localhost or http://your-server-ip

---

## ☁️ Cloud Platforms

### Option 5: AWS (Production-Grade)

#### Architecture:
```
┌─────────────────────────────────────┐
│  CloudFront (CDN)                   │
│  ↓                                  │
│  S3 (Frontend Static Files)         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Application Load Balancer          │
│  ↓                                  │
│  ECS/EC2 (Backend API)              │
│  ↓                                  │
│  RDS PostgreSQL (Database)          │
└─────────────────────────────────────┘
```

#### Quick Setup:
1. **Frontend:** S3 + CloudFront
2. **Backend:** Elastic Beanstalk or ECS
3. **Database:** RDS PostgreSQL
4. **Cost:** ~$50-100/month

### Option 6: DigitalOcean App Platform

1. **Create App:**
```bash
# Push to GitHub first
doctl apps create --spec .do/app.yaml
```

2. **Create `.do/app.yaml`:**
```yaml
name: acms
services:
  - name: backend
    github:
      repo: your-username/acms
      branch: main
      deploy_on_push: true
    source_dir: /backend
    build_command: npm install
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: ${JWT_SECRET}
        type: SECRET
    http_port: 5000
    
  - name: frontend
    github:
      repo: your-username/acms
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    build_command: npm install && npm run build
    routes:
      - path: /
    
databases:
  - name: postgres
    engine: PG
    version: "15"
```

**Cost:** ~$12-25/month

---

## 🔧 Environment Setup

### Backend `.env` (Production)
```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d

# CORS (if frontend on different domain)
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend `.env` (Production)
```bash
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 📦 Pre-Deployment Checklist

### Backend
- [ ] Update `package.json` start script: `"start": "node src/server.js"`
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for frontend domain
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Run database migrations
- [ ] Test all API endpoints
- [ ] Enable rate limiting
- [ ] Set up error logging (Sentry, LogRocket)

### Frontend
- [ ] Update API URL in production
- [ ] Build and test: `npm run build`
- [ ] Optimize images
- [ ] Enable production mode
- [ ] Test on mobile devices
- [ ] Configure analytics (optional)

### Database
- [ ] Backup existing data
- [ ] Run migrations
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Set up monitoring

### Security
- [ ] Enable HTTPS/SSL
- [ ] Set secure headers
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules

---

## 🚀 Deployment Commands

### Build Frontend
```bash
cd frontend
npm install
npm run build
# Output: dist/ folder
```

### Build Backend
```bash
cd backend
npm install
# No build needed for Node.js
```

### Database Migration
```bash
# Connect to production database
psql $DATABASE_URL

# Run schema
\i backend/src/database/schema.sql

# Run migrations
\i backend/src/database/migrations/001_*.sql
\i backend/src/database/migrations/002_*.sql
# ... etc
```

---

## 🔍 Post-Deployment

### 1. Health Checks
```bash
# Backend health
curl https://your-backend.com/api/health

# Frontend
curl https://your-frontend.com
```

### 2. Test Critical Flows
- [ ] Login
- [ ] Create patient
- [ ] Create appointment
- [ ] Create medicine
- [ ] Create invoice
- [ ] Settings update

### 3. Monitoring Setup

**Backend Monitoring:**
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

**Recommended Tools:**
- **Uptime:** UptimeRobot (free)
- **Errors:** Sentry (free tier)
- **Analytics:** Google Analytics
- **Performance:** Lighthouse CI

### 4. Backup Strategy
```bash
# Automated daily backups
0 2 * * * pg_dump $DATABASE_URL > backup-$(date +\%Y\%m\%d).sql
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid | Best For |
|----------|-----------|------|----------|
| **Render** | ✅ Yes (limited) | $7/mo | Quick start |
| **Railway** | ✅ $5 credit | $5-20/mo | Easy deploy |
| **Vercel + Supabase** | ✅ Yes | $20-40/mo | Serverless |
| **DigitalOcean** | ❌ No | $12-25/mo | Balanced |
| **AWS** | ✅ 12 months | $50-100/mo | Enterprise |
| **Self-Hosted VPS** | ❌ No | $5-10/mo | Full control |

---

## 🎯 Recommended Approach

### For Testing/Demo:
**→ Render.com (Free Tier)**
- Quick setup
- Free PostgreSQL
- Automatic SSL
- No credit card needed

### For Small Clinic (1-50 users):
**→ Railway or DigitalOcean**
- Reliable performance
- Easy scaling
- Affordable ($10-25/mo)
- Good support

### For Growing Clinic (50+ users):
**→ AWS or DigitalOcean**
- High availability
- Auto-scaling
- Professional support
- Advanced features

### For Enterprise:
**→ AWS with Load Balancer**
- Multi-region
- High availability
- Advanced security
- Compliance ready

---

## 📝 Quick Start (Render - Easiest)

### 1. Prepare Code
```bash
# Ensure package.json has start script
cd backend
# Add to package.json: "start": "node src/server.js"

cd ../frontend
# Update src/services/api.js with production URL
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 3. Deploy on Render
1. Go to [render.com](https://render.com) → Sign up
2. **Database:** New → PostgreSQL → Create
3. **Backend:** New → Web Service → Connect GitHub
   - Build: `npm install`
   - Start: `npm start`
   - Add env vars (DATABASE_URL, JWT_SECRET)
4. **Frontend:** New → Static Site → Connect GitHub
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist`
   - Add env: `VITE_API_URL`

### 4. Done! 🎉
Your app is live at:
- Frontend: `https://acms-frontend.onrender.com`
- Backend: `https://acms-backend.onrender.com`

---

## 🆘 Troubleshooting

### Issue: Database connection fails
```bash
# Check DATABASE_URL format
postgresql://user:password@host:5432/database

# Test connection
psql $DATABASE_URL
```

### Issue: CORS errors
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### Issue: Build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Issue: Frontend can't reach backend
```javascript
// Check API URL
console.log(import.meta.env.VITE_API_URL);

// Update in .env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Frontend loads without errors
- [ ] Can login successfully
- [ ] API calls work
- [ ] Database connected
- [ ] HTTPS enabled
- [ ] Mobile responsive
- [ ] All features functional
- [ ] Performance acceptable
- [ ] Monitoring set up
- [ ] Backups configured

**Your ACMS is now deployed and production-ready! 🚀**
