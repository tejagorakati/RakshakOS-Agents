# RakshakOS Quick Start Guide

## System Overview

RakshakOS consists of three main components:

1. **Multi-Agent Backend** (`rakshak.py`) - AI agents for disaster response coordination
2. **FastAPI Server** (`api.py`) - REST API with data transformation adapter
3. **Next.js Frontend** (`frontend/RakshakOS-Frontend`) - Command center UI

## Prerequisites

- Python 3.8+
- Node.js 18+
- AWS credentials (for Bedrock LLM access)

## Installation

### 1. Backend Setup

```bash
cd c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend\RakshakOS-Frontend\frontend

# Install Node.js dependencies
npm install
```

## Running the System

### Option 1: Full Stack (3 Terminals)

**Terminal 1 - Backend API Server:**
```bash
cd c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource
python api.py
```
Expected output:
```
🚀 Starting RakshakOS FastAPI Backend on http://localhost:8000
📊 Data-parsing adapter ready for Next.js Frontend on http://localhost:3000
```

**Terminal 2 - Next.js Frontend:**
```bash
cd frontend\RakshakOS-Frontend\frontend
npm run dev
```
Expected output:
```
▲ Next.js 15.x.x
- Local:   http://localhost:3000
```

**Terminal 3 - Test the Integration:**
```bash
# Test health check
curl http://localhost:8000/

# Test adapter transformation
cd c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource
python test_api_adapter.py
```

### Option 2: Backend Only (Testing)

```bash
# Run test without starting the server
python test_api_adapter.py

# Or run the multi-agent pipeline directly
python main.py
```

## Testing the API

### Test with PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:8000/ -Method Get

# Process incident
$body = @{
    incident_id = "RK-TEST-001"
    disaster_type = "flood"
    location = "Vijayawada"
    latitude = 16.52
    longitude = 80.64
    priority = "P1"
    requirements = @("boat", "medical transport")
    reports = @(
        @{
            source_type = "citizen"
            claim = "water entered houses"
            stale = $false
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri http://localhost:8000/process_incident `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Test with Python

```python
import requests

response = requests.post('http://localhost:8000/process_incident', json={
    "incident_id": "RK-TEST-001",
    "disaster_type": "flood",
    "location": "Vijayawada",
    "latitude": 16.52,
    "longitude": 80.64,
    "priority": "P1",
    "requirements": ["boat", "medical transport"],
    "reports": [{
        "source_type": "citizen",
        "claim": "water entered houses",
        "stale": False
    }]
})

print(response.json())
```

## API Endpoints

### `GET /`
Health check endpoint.

**Response:**
```json
{
  "service": "RakshakOS API",
  "status": "operational",
  "version": "1.0.0"
}
```

### `POST /process_incident`
Process disaster incident through multi-agent pipeline.

**Request Body:**
```json
{
  "incident_id": "RK-TEST-001",
  "disaster_type": "flood",
  "location": "Vijayawada",
  "latitude": 16.52,
  "longitude": 80.64,
  "priority": "P1",
  "requirements": ["boat", "medical transport"],
  "reports": [
    {
      "source_type": "citizen",
      "claim": "water entered houses",
      "stale": false
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "disasterScenarioName": "...",
    "incidents": [...],
    "teams": [...],
    "resources": [...],
    // ... full CommandCenterOverview structure
  },
  "raw_output": { /* Original pipeline output */ }
}
```

### `POST /test_adapter`
Test data transformation without running the pipeline.

**Request Body:**
```json
{
  "incident_id": "TEST-001",
  "summary": {},
  "specialist_results": []
}
```

## Architecture Diagram

```
┌────────────────────────┐
│   Next.js Frontend     │
│   localhost:3000       │
│                        │
│  - Command Center UI   │
│  - Real-time Dashboard │
│  - Agent Activity View │
└───────────┬────────────┘
            │ HTTP POST
            │ /process_incident
            ↓
┌────────────────────────┐
│   FastAPI Backend      │
│   localhost:8000       │
│                        │
│  - REST API Endpoints  │
│  - Data Adapter        │
│  - CORS Middleware     │
└───────────┬────────────┘
            │ Python call
            ↓
┌────────────────────────┐
│  Multi-Agent Pipeline  │
│  run_rakshak()         │
│                        │
│  ┌──────────────────┐  │
│  │ Situation Agent  │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Ground Verify    │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Resource Mgmt    │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Response Plan    │  │
│  └──────────────────┘  │
└────────────────────────┘
```

## Data Flow

### 1. Input → Multi-Agent Pipeline
```python
event = {
    "incident_id": "RK-TEST-001",
    "disaster_type": "flood",
    "location": "Vijayawada",
    ...
}
raw_output = run_rakshak(event)
```

### 2. Raw Output → Adapter Transformation
```python
command_center_data = parse_rakshak_for_nextjs_frontend(
    raw_output, 
    incident_id="RK-TEST-001"
)
```

### 3. Transformed Data → Frontend
```typescript
const response = await fetch('http://localhost:8000/process_incident', {
  method: 'POST',
  body: JSON.stringify(incident)
});
const { data } = await response.json();
// data is CommandCenterOverview
```

## File Structure

```
RakshakOS_Agents_OpenSource/
├── api.py                 # FastAPI server (main integration point)
├── adapter.py             # Data transformation logic
├── rakshak.py             # Multi-agent orchestrator
├── situation_impact.py    # Situation assessment agent
├── ground_verification.py # Ground truth verification agent
├── resource_management.py # Resource allocation agent
├── response_planning.py   # Response planning agent
├── test_api_adapter.py    # Adapter unit tests
├── requirements.txt       # Python dependencies
├── INTEGRATION_GUIDE.md   # Detailed integration docs
├── QUICKSTART.md          # This file
│
└── frontend/
    └── RakshakOS-Frontend/
        └── frontend/
            ├── package.json
            ├── src/
            │   ├── app/
            │   │   └── official/
            │   │       └── command-center/
            │   │           └── page.tsx
            │   ├── components/
            │   └── lib/
            │       ├── types/
            │       │   └── official.ts  # TypeScript interfaces
            │       └── mock/
            │           └── command-center-data.ts
            └── public/
```

## Troubleshooting

### Backend Issues

**Problem:** `ImportError: No module named 'fastapi'`
```bash
pip install fastapi uvicorn
```

**Problem:** `ImportError: No module named 'adapter'`
- Ensure you're running from the correct directory
- Check that `adapter.py` exists

**Problem:** Multi-agent pipeline fails
- Verify AWS credentials are configured
- Check `rakshak.py` and agent files exist

### Frontend Issues

**Problem:** `npm: command not found`
- Install Node.js from https://nodejs.org/

**Problem:** Port 3000 already in use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### CORS Issues

**Problem:** Frontend can't reach backend
- Verify backend is running on port 8000
- Check CORS configuration in `api.py` includes your frontend URL
- Try accessing `http://localhost:8000/` in browser

## Next Steps

1. **Integrate with Frontend**: Follow `INTEGRATION_GUIDE.md` for detailed steps
2. **Add Storage**: Implement incident persistence (database integration)
3. **Add WebSockets**: Enable real-time updates
4. **Add Authentication**: Secure endpoints with JWT
5. **Deploy**: Container Dockerize and deploy to cloud

## Support

- API Documentation: http://localhost:8000/docs (when server running)
- Integration Guide: See `INTEGRATION_GUIDE.md`
- Frontend Docs: See `frontend/RakshakOS-Frontend/frontend/README.md`
