# 🚀 DEPLOYMENT CHECKLIST

## Pre-Deployment Checklist

### 1. Code Quality ✅
- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME comments in critical paths
- [ ] Code reviewed and approved
- [ ] ESLint passing with no errors
- [ ] Prettier formatting applied

### 2. Environment Configuration ✅
- [ ] `.env` file configured for production
- [ ] Database credentials secured
- [ ] JWT secret is strong and unique
- [ ] CORS origins configured correctly
- [ ] Rate limiting configured
- [ ] All sensitive data in environment variables

### 3. Database ✅
- [ ] Database migrations run
- [ ] Database indexes created
- [ ] Database backup strategy in place
- [ ] Connection pooling configured
- [ ] Database credentials rotated
- [ ] SSL/TLS enabled for database connection

### 4. Security ✅
- [ ] Helmet middleware enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF protection (if needed)
- [ ] Input validation on all endpoints
- [ ] Authentication working correctly
- [ ] Authorization rules enforced
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens expiring correctly

### 5. Performance ✅
- [ ] Database queries optimized
- [ ] Indexes added to frequently queried columns
- [ ] Response compression enabled
- [ ] Caching strategy implemented (if needed)
- [ ] Connection pooling configured
- [ ] Memory leaks checked
- [ ] Load testing completed

### 6. Monitoring & Logging ✅
- [ ] Error logging configured
- [ ] Request logging enabled
- [ ] Performance monitoring set up
- [ ] Health check endpoint working
- [ ] Alerts configured for critical errors
- [ ] Log rotation configured

### 7. Documentation ✅
- [ ] API documentation complete
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented

---

## Deployment Steps

### Step 1: Prepare Production Environment
```bash
# 1. Clone repository
git clone <repository-url>
cd acms-backend

# 2. Install dependencies
npm install --production

# 3. Set up environment variables
cp .env.example .env
nano .env  # Edit with production values
```

### Step 2: Database Setup
```bash
# 1. Create production database
createdb acms_production

# 2. Run migrations
npm run db:migrate

# 3. Verify database connection
npm run db:test
```

### Step 3: Build & Test
```bash
# 1. Run tests
npm run test

# 2. Run linter
npm run lint

# 3. Check for vulnerabilities
npm audit

# 4. Fix critical vulnerabilities
npm audit fix
```

### Step 4: Deploy Application
```bash
# 1. Start application with PM2
pm2 start src/server.js --name acms-backend

# 2. Save PM2 configuration
pm2 save

# 3. Set up PM2 to start on boot
pm2 startup

# 4. Verify application is running
pm2 status
```

### Step 5: Configure Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 6: SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Verify Deployment
```bash
# 1. Check health endpoint
curl https://api.yourdomain.com/health

# 2. Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 3. Check logs
pm2 logs acms-backend

# 4. Monitor performance
pm2 monit
```

---

## Post-Deployment Checklist

### Immediate (Within 1 hour)
- [ ] Health check endpoint responding
- [ ] Authentication working
- [ ] Database connections stable
- [ ] No errors in logs
- [ ] SSL certificate valid
- [ ] CORS working correctly
- [ ] Rate limiting working

### Within 24 hours
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database performance
- [ ] Check memory usage
- [ ] Review logs for issues
- [ ] Test all critical endpoints
- [ ] Verify backup process

### Within 1 week
- [ ] Performance metrics reviewed
- [ ] User feedback collected
- [ ] Error patterns identified
- [ ] Optimization opportunities noted
- [ ] Documentation updated
- [ ] Team trained on new system

---

## Environment Variables

### Required
```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional
```env
# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Rollback Procedure

### If deployment fails:

```bash
# 1. Stop current version
pm2 stop acms-backend

# 2. Checkout previous version
git checkout <previous-commit-hash>

# 3. Install dependencies
npm install

# 4. Restart application
pm2 restart acms-backend

# 5. Verify rollback
curl https://api.yourdomain.com/health
```

### If database migration fails:

```bash
# 1. Restore database from backup
pg_restore -d acms_production backup.dump

# 2. Verify data integrity
psql acms_production -c "SELECT COUNT(*) FROM patients;"

# 3. Restart application
pm2 restart acms-backend
```

---

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs acms-backend

# Monitor resources
pm2 monit

# View process info
pm2 info acms-backend

# View metrics
pm2 web
```

### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Performance Optimization

### Database Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
```

### Connection Pooling
```javascript
// In database.js
const pool = new Pool({
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### Caching (Optional)
```javascript
// Add Redis for caching
import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache frequently accessed data
const cacheKey = `patient:${id}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

---

## Security Hardening

### 1. Update Dependencies
```bash
npm audit
npm audit fix
npm update
```

### 2. Configure Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 3. Set Up Fail2Ban
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for nginx
sudo nano /etc/fail2ban/jail.local
```

### 4. Regular Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump acms_production > backup_$DATE.sql
gzip backup_$DATE.sql

# Upload to S3 or backup server
aws s3 cp backup_$DATE.sql.gz s3://your-bucket/backups/
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs acms-backend --lines 100

# Check environment variables
pm2 env 0

# Check port availability
lsof -i :5000
```

### Database connection errors
```bash
# Test database connection
psql -h localhost -U username -d acms_production

# Check connection pool
# Look for "too many connections" errors
```

### High memory usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart acms-backend

# Check for memory leaks
node --inspect src/server.js
```

### Slow responses
```bash
# Check database queries
# Enable query logging in PostgreSQL

# Check for missing indexes
# Use EXPLAIN ANALYZE on slow queries

# Monitor API response times
# Use PM2 metrics or APM tool
```

---

## Success Criteria

✅ **Application is running** - PM2 shows status as "online"  
✅ **Health check passes** - `/health` returns 200  
✅ **Authentication works** - Can login and get JWT token  
✅ **Database connected** - Queries execute successfully  
✅ **SSL enabled** - HTTPS working correctly  
✅ **Logs clean** - No critical errors in logs  
✅ **Performance good** - Response times < 500ms  
✅ **Backups working** - Database backups running  

---

**Deployment Status:** Ready for production deployment  
**Last Updated:** November 5, 2025  
**Version:** 2.0.0
