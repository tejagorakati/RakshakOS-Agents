from typing import Dict, Any
from common import make_agent, safe_metrics
from schemas import ImpactAssessment
from tools import get_open_meteo_weather, get_usgs_earthquakes

SYSTEM_PROMPT = """
You are the RakshakOS Situation & Impact Assessment Agent.
Determine what is happening and how severe it is.
Identify affected people/area, vulnerable groups, infrastructure impacts, hazards and priority zones.
Use only supplied evidence and tool results. Never invent facts.
If evidence is missing, put the uncertainty in unknowns.
Citizen reports are evidence, not truth.
Do not declare deaths, legal emergencies, medical diagnoses, or guaranteed rescue.

RULES FOR STRUCTURED OUTPUT (ImpactAssessment):
1. 'affected_population': Must be an INTEGER. Use 0 if unknown and list it in 'unknowns'.
2. 'affected_area_km2': Must be a FLOAT/NUMBER. Use 0.0 if unknown and list it in 'unknowns'.
3. 'vulnerable_people', 'hazards', 'infrastructure_impacts', 'evidence_ids', 'unknowns': Must be lists of strings. NEVER use null; use [] if empty.
4. 'priority_zones': Must be a list of STRINGS (e.g., ["Zone 16.52, 80.64"]). Do NOT use nested coordinate tuples or numbers.
5. 'severity': Must be a string ("low", "moderate", "high", or "critical").
"""

agent = make_agent(
    SYSTEM_PROMPT,
    tools=[get_open_meteo_weather, get_usgs_earthquakes],
    name="situation-impact-agent",
)

def run_situation_impact(payload: Dict[str, Any]) -> Dict[str, Any]:
    incident_id = payload.get("incident_id", "UNKNOWN")
    lat = payload.get("latitude")
    lon = payload.get("longitude")
    
    prompt = f"""Incident ID: {incident_id}
Disaster Type: {payload.get("disaster_type", "UNKNOWN")}
Location: {payload.get("location", "UNKNOWN")} (Lat: {lat}, Lon: {lon})
Reports/Evidence: {payload.get("reports", [])}

Assess situation and impact. Call weather or earthquake tools ONLY if useful coordinates exist."""
    
    try:
        result = agent(prompt, structured_output_model=ImpactAssessment)
        out = result.structured_output
        
        # Python-level Sanitization (Enforces 100% Pydantic Type Compliance)
        out.incident_id = incident_id
        if getattr(out, "affected_population", None) is None:
            out.affected_population = 0
        if getattr(out, "affected_area_km2", None) is None:
            out.affected_area_km2 = 0.0
        if getattr(out, "vulnerable_people", None) is None:
            out.vulnerable_people = []
        if getattr(out, "priority_zones", None) is None:
            out.priority_zones = []
        else:
            # Convert any accidental numeric tuples/lists into clean string entries
            out.priority_zones = [str(zone) for zone in out.priority_zones]
            
        if getattr(out, "hazards", None) is None:
            out.hazards = []
        if getattr(out, "infrastructure_impacts", None) is None:
            out.infrastructure_impacts = []
        if getattr(out, "evidence_ids", None) is None:
            out.evidence_ids = []
        if getattr(out, "unknowns", None) is None:
            out.unknowns = []
            
        return {
            "status": "SUCCESS",
            "agent": "situation_impact",
            "incident_id": incident_id,
            "assessment": out.model_dump(),
            "metrics": safe_metrics(result),
        }
    except Exception as e:
        # Zero-Crash Fallback Protocol
        fallback_assessment = {
            "incident_id": incident_id,
            "disaster_type": payload.get("disaster_type", "UNKNOWN"),
            "location": payload.get("location", "UNKNOWN"),
            "severity": "moderate",
            "affected_population": 0,
            "affected_area_km2": 0.0,
            "vulnerable_people": [],
            "priority_zones": [f"Coordinates: {lat},{lon}"] if lat and lon else [],
            "hazards": [],
            "infrastructure_impacts": [],
            "confidence": 0.5,
            "evidence_ids": [],
            "unknowns": ["affected_population unquantified", "affected_area_km2 unquantified"]
        }
        return {
            "status": "RECOVERED",
            "agent": "situation_impact",
            "incident_id": incident_id,
            "error": str(e),
            "assessment": fallback_assessment,
            "metrics": {}
        }

if __name__ == "__main__":
    print(run_situation_impact({
        "incident_id": "RK-1042",
        "disaster_type": "flood",
        "location": "Vijayawada",
        "latitude": 16.52,
        "longitude": 80.64,
        "reports": ["Water entered houses near a temple."]
    }))