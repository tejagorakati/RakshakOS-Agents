# 🎯 WORKING DEMO - 2 Simple Steps!

## What You'll Get

✅ **Beautiful Dashboard UI** - Works in your browser  
✅ **Mock Data** - See it working instantly (no backend needed)  
✅ **Live AI Pipeline** - Connect to backend to run real AI agents  
✅ **No npm install** - Pure HTML/JavaScript, no dependencies  

---

## 🚀 Quick Start (2 Steps!)

### Step 1: Open the Demo Page

**Double-click this file:**
```
demo.html
```

Or open in browser manually:
```
C:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource\demo.html
```

You should see a beautiful purple dashboard! 🎨

### Step 2: (Optional) Start Backend for Live AI

If you want to run the actual AI pipeline:

**Option A - Double-click:**
```
start_backend.bat
```

**Option B - Command line:**
```powershell
cd "C:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource"
python api.py
```

---

## 📱 How to Use

### View Mock Data (Works Immediately!)

1. Open `demo.html` in browser
2. Click **"View Mock Data"** button
3. See the dashboard populate with example disaster response data

### Run Live AI Pipeline (Requires Backend)

1. Start backend (see Step 2 above)
2. In browser, click **"Check Health"** button
3. Should show ✅ "Backend Connected"
4. Click **"Run Live AI Pipeline"** button
5. Wait 5-10 seconds
6. See real AI-generated response data!

---

## 🎨 What You'll See

### Control Panel
- Backend connection status
- Toggle between mock and live data
- Health check button

### Operational Metrics
- 4 stat cards showing:
  - Active incidents
  - Critical incidents  
  - Teams deployed
  - Resource allocation

### Active Incidents
- Incident code and title
- Priority level (CRITICAL/HIGH/MEDIUM)
- Status (DISPATCHED/ON_SITE/etc)
- Location
- Assigned team
- Resources allocated

### Response Teams
- Team name and type
- Deployment status
- Location
- Member count

### Critical Alerts
- Alert title and severity
- Message details
- Timestamp

### Raw JSON Data
- Complete data structure
- Scrollable JSON viewer

---

## 🔧 Troubleshooting

### "Backend Offline" message?

**Solution:** Start the backend server

```powershell
cd "C:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource"
python api.py
```

Should see:
```
🚀 Starting RakshakOS FastAPI Backend on http://localhost:8000
```

### "Check Health" shows error?

**Reason:** Backend not running or blocked by firewall

**Fix:**
1. Make sure you ran `python api.py`
2. Check if port 8000 is available:
   ```powershell
   netstat -ano | findstr :8000
   ```
3. Try accessing in browser: http://localhost:8000/

### Demo page not loading?

**Solution:** Open directly in browser
- Right-click `demo.html`
- Choose "Open with" → Your browser (Chrome/Edge/Firefox)

---

## 📂 File Locations

```
C:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource\
│
├── demo.html              ← OPEN THIS IN BROWSER! 🌟
├── start_backend.bat      ← Double-click to start backend
├── api.py                 ← Backend server
├── adapter.py             ← Data transformation
└── rakshak.py             ← Multi-agent pipeline
```

---

## 🎯 URLs

| What | URL |
|------|-----|
| **Demo Page** | file:///C:/Users/tejag/Downloads/RakshakOS_Agents_OpenSource/RakshakOS_Agents_OpenSource/demo.html |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## ✅ Testing Checklist

- [ ] `demo.html` opens in browser
- [ ] Click "View Mock Data" shows dashboard
- [ ] Backend starts with `python api.py`
- [ ] Click "Check Health" shows ✅ Connected
- [ ] Click "Run Live AI Pipeline" processes data
- [ ] Can see JSON preview at bottom

---

## 🎉 You're Done!

Just open `demo.html` and click "View Mock Data" to see it working!

Want the full AI experience? Start the backend and click "Run Live AI Pipeline"!

---

## 📊 Architecture

```
demo.html (Your Browser)
    ↓
    JavaScript fetch()
    ↓
POST http://localhost:8000/process_incident
    ↓
api.py (FastAPI Server)
    ↓
run_rakshak() (Multi-Agent Pipeline)
    ├── Situation Agent
    ├── Ground Verification Agent
    ├── Resource Management Agent
    └── Response Planning Agent
    ↓
adapter.py (Data Transformation)
    ↓
Returns CommandCenterOverview JSON
    ↓
demo.html displays beautiful dashboard
```

---

## 💡 Pro Tips

1. **Bookmark the demo.html** - Works offline with mock data
2. **Check browser console** (F12) - See API calls and responses
3. **Refresh page** - Reset to initial state
4. **Compare mock vs live** - See how AI adapts to different scenarios

---

## 🆘 Need Help?

1. Make sure `demo.html` opens (just double-click it!)
2. Try "View Mock Data" first - should work immediately
3. For live data, ensure backend is running: `python api.py`
4. Check browser console (F12) for error messages

Enjoy your full-stack AI disaster response system! 🚀
