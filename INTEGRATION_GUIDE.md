# RakshakOS Backend-Frontend Integration Guide

## Overview

This guide explains how the FastAPI backend (`api.py`) integrates with the Next.js frontend to transform multi-agent pipeline outputs into UI-ready data.

## Architecture

```
┌─────────────────────┐
│  Next.js Frontend   │  
│  (localhost:3000)   │  ← React Components expecting CommandCenterOverview
└──────────┬──────────┘
           │ HTTP POST /process_incident
           ↓
┌─────────────────────┐
│   FastAPI Backend   │  
│  (localhost:8000)   │  ← parse_rakshak_for_nextjs_frontend()
└──────────┬──────────┘
           │ Python function call
           ↓
┌─────────────────────┐
│  Multi-Agent Pipeline│
│   run_rakshak()     │  ← Situation, Ground, Resource, Planning Agents
└─────────────────────┘
```

## Data Transformation Flow

### 1. Multi-Agent Raw Output Structure

The `run_rakshak()` function returns:

```python
{
    "status": "SUCCESS",
    "agent": "rakshak",
    "incident_id": "RK-TEST-001",
    "summary": {
        "incident_id": "RK-TEST-001",
        "executive_summary": "...",
        "overall_status": "PENDING_REVIEW",
        "critical_alerts": [...]
    },
    "specialist_results": [
        {
            "agent": "situation_impact",
            "assessment": { ... }
        },
        {
            "agent": "ground_verification",
            "verification": { ... }
        },
        {
            "agent": "resource_management",
            "decision": { ... }
        },
        {
            "agent": "response_planning",
            "plan": { ... }
        }
    ]
}
```

### 2. Frontend Expected Structure

The Next.js Command Center expects `CommandCenterOverview`:

```typescript
interface CommandCenterOverview {
  disasterScenarioName: string;
  regionLocation: string;
  operationStatus: string;
  lastUpdated: string;
  stats: OperationalStat[];
  incidents: IncidentItem[];
  teams: ResponseTeamItem[];
  resources: ResourceItem[];
  zones: ResponseZone[];
  alerts: OperationalAlert[];
  agentActivity: AgentActivitySummaryEvent[];
  humanAttentionItems: HumanAttentionItem[];
  activeState: ActiveOperationalState;
}
```

### 3. Adapter Function

`parse_rakshak_for_nextjs_frontend()` bridges the gap with:

- **Defensive extraction**: Safely navigates nested dictionaries with fallbacks
- **Type coercion**: Ensures all fields match TypeScript types
- **Data enrichment**: Generates derived fields (stats, alerts, events)
- **Null safety**: Replaces missing data with sensible defaults

## API Endpoints

### POST /process_incident

Process a new disaster incident through the multi-agent pipeline.

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
    "disasterScenarioName": "flood",
    "regionLocation": "Vijayawada Emergency Operations Center",
    "stats": [...],
    "incidents": [...],
    "teams": [...],
    "resources": [...],
    "zones": [...],
    "alerts": [...],
    "agentActivity": [...],
    "humanAttentionItems": [...],
    "activeState": {...}
  },
  "raw_output": { ... }
}
```

### POST /test_adapter

Test the data transformation without running the pipeline.

**Request Body:**
```json
{
  "incident_id": "TEST-001",
  "summary": { ... },
  "specialist_results": [ ... ]
}
```

### GET /

Health check endpoint.

## Frontend Integration Steps

### Step 1: Install Dependencies

In the frontend directory:

```bash
cd frontend/RakshakOS-Frontend/frontend
npm install
```

### Step 2: Create API Service

Create `src/lib/api/rakshak-api.ts`:

```typescript
export async function processIncident(incident: IncidentRequest): Promise<CommandCenterOverview> {
  const response = await fetch('http://localhost:8000/process_incident', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incident),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

### Step 3: Update Command Center Page

Modify `src/app/official/command-center/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { processIncident } from '@/lib/api/rakshak-api';
import { CommandCenterOverview } from '@/lib/types/official';

export default function CommandCenterPage() {
  const [data, setData] = useState<CommandCenterOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIncident() {
      try {
        const result = await processIncident({
          incident_id: "RK-LIVE-001",
          disaster_type: "flood",
          location: "Vijayawada",
          latitude: 16.52,
          longitude: 80.64,
          priority: "P1",
          requirements: ["boat", "medical transport"],
          reports: [
            {
              source_type: "citizen",
              claim: "water entered houses",
              stale: false
            }
          ]
        });
        setData(result);
      } catch (error) {
        console.error('Failed to load incident:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadIncident();
  }, []);

  if (loading) return <div>Loading real-time data...</div>;
  if (!data) return <div>Failed to load data</div>;

  // Rest of your existing component code...
  // Just replace mockCommandCenterOverview with data
}
```

## Running the System

### Terminal 1: Start Backend

```bash
cd c:\Users\tejag\Downloads\RakshakOS_Agents_OpenSource\RakshakOS_Agents_OpenSource
python api.py
```

Output:
```
🚀 Starting RakshakOS FastAPI Backend on http://localhost:8000
📊 Data-parsing adapter ready for Next.js Frontend on http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd frontend/RakshakOS-Frontend/frontend
npm run dev
```

Output:
```
- Local:   http://localhost:3000
```

### Terminal 3: Test the Integration

```bash
# Test health check
curl http://localhost:8000/

# Test incident processing
curl -X POST http://localhost:8000/process_incident \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "RK-TEST-001",
    "disaster_type": "flood",
    "location": "Vijayawada",
    "latitude": 16.52,
    "longitude": 80.64,
    "priority": "P1",
    "requirements": ["boat"],
    "reports": []
  }'
```

## Defensive Parsing Features

### 1. Null Safety

Every field extraction uses fallbacks:

```python
location = (
    impact_data.get("location") or 
    summary.get("location") or 
    "Unknown Zone"
)
```

### 2. Type Coercion

Ensures data types match frontend expectations:

```python
if not isinstance(critical_infrastructure, list):
    critical_infrastructure = [str(critical_infrastructure)]
```

### 3. Data Enrichment

Generates derived metrics:

```python
total_teams = len(assignments) + 2  # Assume some standby
deployed_teams = len(assignments)
deployment_percentage = int(deployed_teams/total_teams*100)
```

### 4. Human-in-the-Loop Boundary

Automatically escalates resource shortages:

```python
for shortage in shortages:
    human_attention_items.append({
        "title": f"External Resource Request: {shortage}",
        "riskLevel": "OUT_OF_BOUNDS",
        "status": "PENDING"
    })
```

## Debugging Tips

### Enable Verbose Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Inspect Raw vs. Transformed Data

The `/process_incident` endpoint returns both:

```json
{
  "status": "success",
  "data": { ... },  // Transformed for frontend
  "raw_output": { ... }  // Original pipeline output
}
```

### Test Adapter Independently

```bash
curl -X POST http://localhost:8000/test_adapter \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "TEST-001",
    "summary": {},
    "specialist_results": []
  }'
```

## Error Handling

The adapter is designed to **never crash the UI**:

1. **Missing fields**: Replaced with safe defaults
2. **Wrong types**: Coerced to expected types
3. **Empty collections**: Return empty arrays `[]`
4. **Null values**: Replaced with "Unknown" or 0

Example:

```python
# If AI returns None for teams
teams = resource_data.get("assignments", [])  # Default to []
if not teams:
    # Still generate a placeholder
    teams = [{"id": "TEAM-PENDING", "status": "STANDBY"}]
```

## Key Mapping Reference

| Multi-Agent Field | Frontend Field | Transformation |
|------------------|----------------|----------------|
| `assessment.location` | `incidents[0].location` | Direct mapping |
| `assessment.severity` | `incidents[0].priority` | Mapped: CRITICAL→CRITICAL, MEDIUM→HIGH |
| `decision.assignments` | `teams[]` | Expanded into team objects |
| `decision.shortages` | `humanAttentionItems[]` | Escalated to approval items |
| `plan.route` | `activeState.route` | Direct mapping |
| `summary.critical_alerts` | `alerts[]` | Expanded into alert objects |

## Production Considerations

1. **Caching**: Consider caching processed incidents
2. **WebSockets**: Add real-time updates for active incidents
3. **Rate Limiting**: Add rate limits to prevent abuse
4. **Authentication**: Add JWT/OAuth for production
5. **Monitoring**: Add logging and metrics (Prometheus, DataDog)
6. **Error Tracking**: Integrate Sentry or similar

## Support

For issues or questions:
- Backend: Check `api.py` logs
- Frontend: Check browser console
- Integration: Compare `raw_output` vs `data` in API response
