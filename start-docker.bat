@echo off
echo.
echo ========================================
echo   ACMS Docker Deployment
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/4] Checking environment file...
if not exist .env (
    if exist .env.docker (
        copy .env.docker .env
        echo Created .env from .env.docker
    ) else (
        echo [ERROR] No .env file found!
        echo Please create .env file with DB_PASSWORD and JWT_SECRET
        pause
        exit /b 1
    )
)

echo [2/4] Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

echo [3/4] Building and starting containers...
docker-compose -f docker-compose.prod.yml up -d --build

echo [4/4] Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   ACMS is Starting!
echo ========================================
echo.
echo Frontend:  http://localhost
echo Backend:   http://localhost:5000
echo Database:  localhost:5432
echo.
echo Login with:
echo   Email:    admin@clinic.com
echo   Password: admin123
echo.
echo View logs: docker-compose -f docker-compose.prod.yml logs -f
echo Stop:      docker-compose -f docker-compose.prod.yml down
echo.
pause
