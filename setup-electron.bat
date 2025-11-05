@echo off
echo.
echo 🚀 ACMS Electron Desktop App Setup
echo ===================================
echo.

cd frontend

echo 📦 Installing Electron dependencies...
call npm install --save-dev electron electron-builder concurrently wait-on

if errorlevel 1 (
    echo ❌ Installation failed!
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 📝 Updating package.json...

REM Backup package.json
copy package.json package.json.backup >nul

REM Note: Manual step required
echo.
echo ⚠️  MANUAL STEP REQUIRED:
echo.
echo Please add the following to your package.json:
echo.
echo 1. Add to "scripts" section:
echo    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
echo    "electron:build": "npm run build && electron-builder",
echo    "electron:build:win": "npm run build && electron-builder --win"
echo.
echo 2. Add "main" field at top level:
echo    "main": "electron/main.js",
echo.
echo 3. Add "build" configuration (see DESKTOP_APP_GUIDE.md)
echo.
echo 📖 Full instructions in: DESKTOP_APP_GUIDE.md
echo.
echo ✅ Setup complete! Next steps:
echo    1. Update package.json as shown above
echo    2. Run: npm run electron:dev (to test)
echo    3. Run: npm run electron:build:win (to build installer)
echo.
pause
