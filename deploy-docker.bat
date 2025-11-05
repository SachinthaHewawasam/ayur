@echo off
REM ACMS Docker Deployment Script for Windows
REM Usage: deploy-docker.bat

echo.
echo 🚀 ACMS Deployment Script
echo ==========================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and set secure passwords!
    echo    - DB_PASSWORD
    echo    - JWT_SECRET
    echo.
    pause
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start containers
echo 🔨 Building and starting containers...
docker-compose up -d --build

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service health
echo.
echo 🔍 Checking service health...

REM Check database
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 0 (
    echo ✅ Database is healthy
) else (
    echo ❌ Database is not responding
)

REM Check backend
curl -f http://localhost:5000/api/health >nul 2>&1
if errorlevel 0 (
    echo ✅ Backend is healthy
) else (
    echo ⚠️  Backend is starting... ^(may take a few more seconds^)
)

REM Check frontend
curl -f http://localhost/ >nul 2>&1
if errorlevel 0 (
    echo ✅ Frontend is healthy
) else (
    echo ⚠️  Frontend is starting... ^(may take a few more seconds^)
)

echo.
echo 🎉 Deployment complete!
echo.
echo 📍 Access your application:
echo    Frontend: http://localhost
echo    Backend:  http://localhost:5000/api
echo    Database: localhost:5432
echo.
echo 📊 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.
echo 🔄 Restart services:
echo    docker-compose restart
echo.
pause
