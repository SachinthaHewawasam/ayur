# 💻 Desktop App - Quick Start

## 🎯 Convert to Desktop in 3 Steps

### Step 1: Run Setup (2 minutes)
```bash
setup-electron.bat
```

### Step 2: Update package.json (2 minutes)
Add to `frontend/package.json`:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win"
  },
  "build": {
    "appId": "com.acms.desktop",
    "productName": "ACMS",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "public/favicon.ico"
    }
  }
}
```

### Step 3: Build Desktop App (5 minutes)
```bash
cd frontend
npm run electron:build:win
```

**Output:** `frontend/release/ACMS Setup 1.0.0.exe`

---

## 🚀 That's It!

Your desktop app is ready in `frontend/release/`

**Features:**
- ✅ Native Windows application
- ✅ Desktop shortcut
- ✅ Start menu entry
- ✅ Professional installer
- ✅ Auto-updates ready

---

## 🧪 Test Before Building

```bash
cd frontend
npm run electron:dev
```

This opens the app in development mode.

---

## 📦 What You Get

### Windows Installer
- **File:** `ACMS Setup 1.0.0.exe`
- **Size:** ~100 MB
- **Type:** NSIS installer
- **Features:**
  - Choose install location
  - Desktop shortcut
  - Start menu entry
  - Uninstaller

### Portable Version (Optional)
Add to `package.json` build config:
```json
"win": {
  "target": ["nsis", "portable"]
}
```

---

## 🎨 Customize

### App Icon
1. Create `frontend/public/icon.ico` (256x256)
2. Update `package.json`:
   ```json
   "win": {
     "icon": "public/icon.ico"
   }
   ```

### App Name
Update in `package.json`:
```json
"productName": "Nirvaan Clinic",
"build": {
  "appId": "com.nirvaan.clinic"
}
```

### Window Size
Edit `frontend/electron/main.js`:
```javascript
width: 1600,  // Change width
height: 1000  // Change height
```

---

## 🔧 Troubleshooting

### Issue: "electron command not found"
```bash
cd frontend
npm install
```

### Issue: Build fails
```bash
# Clear cache
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue: App won't start
```bash
# Check logs
npm run electron:dev
# Look for errors in console
```

---

## 📊 File Structure

```
frontend/
├── electron/
│   ├── main.js          ✅ Created
│   └── preload.js       ✅ Created
├── dist/                (created on build)
├── release/             (created on build)
│   └── ACMS Setup.exe   🎉 Your installer!
└── package.json         ⚠️ Needs update
```

---

## ✅ Checklist

- [ ] Run `setup-electron.bat`
- [ ] Update `package.json` with scripts
- [ ] Update `package.json` with build config
- [ ] Test with `npm run electron:dev`
- [ ] Build with `npm run electron:build:win`
- [ ] Find installer in `release/` folder
- [ ] Install and test
- [ ] Distribute to users!

---

## 🎉 Success!

You now have:
- ✅ Desktop application
- ✅ Professional installer
- ✅ Native Windows app
- ✅ Offline capability
- ✅ Start menu integration

**Total time: ~10 minutes** ⚡

---

## 📚 More Info

- Full guide: `DESKTOP_APP_GUIDE.md`
- Electron docs: https://electronjs.org
- Electron Builder: https://electron.build

---

## 🚀 Next Steps

1. **Customize branding** (icon, name)
2. **Add auto-updates** (optional)
3. **Code signing** (for production)
4. **Distribute** to clinic staff

**Your web app is now a desktop app!** 💻✨
