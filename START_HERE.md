# 🚀 START HERE - Complete Setup Guide

## What You'll See

After following these steps, you'll have:
- ✅ **Frontend UI**: http://localhost:3000/demo
- ✅ **Backend API**: http://localhost:8000
- ✅ **Mock Data**: Works immediately without backend
- ✅ **Live AI Pipeline**: Click button to run real multi-agent system

---

## Quick Start (3 Steps)

### Step 1: Install Dependencies

Open PowerShell in the project folder:

```powershell
cd "c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource"

# Backend dependencies (if not installed)
pip install -r requirements.txt

# Frontend dependencies
cd frontend\RakshakOS-Frontend\frontend
npm install
```

### Step 2: Start Backend (Terminal 1)

**Option A - Double-click:** 
- Double-click `start_backend.bat`

**Option B - Command line:**
```powershell
cd "c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource"
python api.py
```

You should see:
```
🚀 Starting RakshakOS FastAPI Backend on http://localhost:8000
📊 Data-parsing adapter ready for Next.js Frontend on http://localhost:3000
```

### Step 3: Start Frontend (Terminal 2)

**Option A - Double-click:**
- Go to `frontend\RakshakOS-Frontend\frontend\`
- Double-click `start_frontend.bat`

**Option B - Command line:**
```powershell
cd "c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource\frontend\RakshakOS-Frontend\frontend"
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:   http://localhost:3000
```

---

## 🎯 View the Application

### **DEMO PAGE** (Recommended to start)
👉 **http://localhost:3000/demo**

This page has:
- ✅ Toggle between Mock Data and Live AI Pipeline
- ✅ Backend health check button
- ✅ Clear instructions
- ✅ Error messages if backend is offline
- ✅ JSON data preview

### Original Command Center
👉 **http://localhost:3000/official/command-center**

Full command center with mock data.

---

## 📋 How to Use the Demo Page

### View Mock Data (Works Offline)
1. Go to http://localhost:3000/demo
2. Click **"View Mock Data"** button
3. See example disaster response dashboard

### Run Live AI Pipeline
1. Make sure backend is running (Step 2 above)
2. Click **"Check Health"** to verify backend connection
3. Click **"Run Live AI Pipeline"** button
4. Wait 5-10 seconds for AI agents to process
5. See real-time data from multi-agent system!

---

## 🔧 Troubleshooting

### Problem: "Cannot reach backend"

**Solution 1:** Check if backend is running
```powershell
# Open browser and visit:
http://localhost:8000/
# Should show: {"service":"RakshakOS API","status":"operational"}
```

**Solution 2:** Restart backend
- Close the backend terminal (Ctrl+C)
- Run `start_backend.bat` again

### Problem: Frontend shows blank page

**Solution:** Check browser console (F12)
- Look for error messages
- Common issue: Port 3000 already in use

```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Then restart frontend
```

### Problem: "Module not found" errors

**Solution:** Reinstall dependencies
```powershell
cd frontend\RakshakOS-Frontend\frontend
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📂 Project Structure

```
RakshakOS_Agents_OpenSource/
│
├── api.py                    ← Backend server (port 8000)
├── adapter.py                ← Data transformation
├── rakshak.py                ← Multi-agent pipeline
├── start_backend.bat         ← Click to start backend
│
└── frontend/RakshakOS-Frontend/frontend/
    ├── start_frontend.bat    ← Click to start frontend
    ├── .env.local            ← API configuration
    └── src/
        ├── app/
        │   └── demo/
        │       └── page.tsx  ← DEMO PAGE (start here!)
        └── lib/
            └── api/
                └── rakshak-api.ts  ← API client
```

---

## 🎬 Complete Workflow

### 1. Mock Data Flow (Instant)
```
User clicks "View Mock Data"
  ↓
Frontend loads pre-built data from mockCommandCenterOverview
  ↓
UI displays example dashboard
```

### 2. Live AI Pipeline Flow (5-10 seconds)
```
User clicks "Run Live AI Pipeline"
  ↓
Frontend sends incident to: POST http://localhost:8000/process_incident
  ↓
Backend runs multi-agent pipeline:
  - Situation & Impact Agent
  - Ground Verification Agent
  - Resource Management Agent
  - Response Planning Agent
  ↓
Backend transforms raw output with adapter
  ↓
Frontend receives CommandCenterOverview JSON
  ↓
UI displays real-time AI-generated dashboard
```

---

## 🧪 Testing API Directly

### Test with PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:8000/

# Process incident
$body = @{
    incident_id = "TEST-001"
    disaster_type = "flood"
    location = "Test City"
    latitude = 16.52
    longitude = 80.64
    priority = "P1"
    requirements = @("boat")
    reports = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/process_incident `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Test with Browser

Visit: http://localhost:8000/docs

This opens FastAPI's interactive API documentation where you can:
- ✅ See all endpoints
- ✅ Test each endpoint in browser
- ✅ See request/response schemas

---

## 📊 What Each Component Does

### Backend (`api.py`)
- Hosts REST API on port 8000
- Receives incident requests
- Runs multi-agent pipeline
- Transforms data for frontend
- Returns JSON to frontend

### Frontend (`demo/page.tsx`)
- Interactive dashboard on port 3000
- Toggle between mock and live data
- Health check button
- Error handling with helpful messages
- JSON data preview

### Adapter (`adapter.py`)
- Transforms nested agent outputs
- Maps to TypeScript interfaces
- Provides safe fallbacks
- Never crashes UI

---

## 🎯 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Demo Page** | http://localhost:3000/demo | **START HERE** - Interactive demo |
| Command Center | http://localhost:3000/official/command-center | Full dashboard (mock data) |
| API Docs | http://localhost:8000/docs | Test API in browser |
| API Health | http://localhost:8000/ | Check backend status |

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000/demo
- [ ] Mock data loads instantly
- [ ] "Check Health" shows ✅ Connected
- [ ] "Run Live AI Pipeline" processes successfully
- [ ] Can see transformed data in JSON preview

---

## 🆘 Still Having Issues?

### Check Versions
```powershell
# Python version (need 3.8+)
python --version

# Node version (need 18+)
node --version

# npm version
npm --version
```

### Check Ports
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### Check Logs
- Backend logs appear in terminal where you ran `python api.py`
- Frontend logs appear in browser console (F12)

---

## 🎉 You're Done!

Open http://localhost:3000/demo and start exploring!

**Quick Test:**
1. Click "View Mock Data" - Should load instantly ✅
2. Click "Check Health" - Should show "Connected" ✅
3. Click "Run Live AI Pipeline" - Should process in 5-10 seconds ✅

Enjoy your full-stack AI disaster response system! 🚀
