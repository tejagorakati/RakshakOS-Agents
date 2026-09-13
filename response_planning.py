from typing import Dict, Any
from common import make_agent, safe_metrics
from schemas import ResponsePlan
from tools import route_osrm

agent = make_agent(
    """You are the RakshakOS Response Planning Agent.
Create versioned operational plans from verified evidence and controlled resources.
Conflicting/critical uncertainty, no resources, or known road blockage must block autonomous mission creation.
A routing API result is not proof that a road is physically open.
Never guarantee rescue or claim external agency dispatch.
RULES FOR STRUCTURED OUTPUT:
1. NEVER use null for list/array fields (e.g., hazards, trigger_conditions, external_support). Use [] if empty.
2. Output [] for 'assigned_resources' and 'evidence_ids' - the system will populate them with 100% accuracy.
3. State uncertainty explicitly in the route and contingency fields.""",
    name="response-planning-agent",
)

def safety_gate(payload):
    verification = payload.get("verification_state", "UNVERIFIED")
    if verification in {"CONFLICTING", "CRITICAL_UNCERTAIN"}:
        return {"allowed": False, "reason": "Critical/conflicting ground evidence."}
    if not payload.get("assigned_resources"):
        return {"allowed": False, "reason": "No controlled resources assigned."}
    if payload.get("road_blocked", False):
        return {"allowed": False, "reason": "Known road blockage."}
    return {"allowed": True, "reason": "Safety gate passed."}

def run_response_planning(payload: Dict[str, Any]):
    incident_id = payload.get("incident_id", "UNKNOWN")
    gate = safety_gate(payload)
    if not gate["allowed"]:
        return {"status": "BLOCKED", "agent": "response_planning", "incident_id": incident_id, "reason": gate["reason"]}

    route = {"status": "UNKNOWN"}
    if all(k in payload for k in ["start_lat", "start_lon", "end_lat", "end_lon"]):
        route = route_osrm(payload["start_lat"], payload["start_lon"], payload["end_lat"], payload["end_lon"])

    prompt = f"""Incident: {incident_id}
Situation: {payload.get("situation", {})}
Verification: {payload.get("verification_state")}
Route evidence: {route}
Create a versioned response plan. Explain the operational objective and contingencies."""
    
    try:
        result = agent(prompt, structured_output_model=ResponsePlan)
        out = result.structured_output
        
        # Overwriting fields with deterministic system data to guarantee accuracy
        out.incident_id = incident_id
        out.version = int(payload.get("plan_version", 1))
        out.assigned_resources = payload.get("assigned_resources", [])
        out.evidence_ids = payload.get("evidence_ids", [])
        
        # Failsafe: Ensure arrays are lists, never None
        if out.external_support is None:
            out.external_support = []
        if out.hazards is None:
            out.hazards = []
            
        out.confidence = min(float(out.confidence), 0.90)
        
        return {
            "status": "SUCCESS", 
            "agent": "response_planning", 
            "incident_id": incident_id, 
            "plan": out.model_dump(), 
            "route_evidence": route, 
            "metrics": safe_metrics(result)
        }
    except Exception as e:
        # Zero-Crash Fallback: Immediately return a safe, valid response plan if the AI drops
        fallback_plan = {
            "incident_id": incident_id,
            "plan_id": f"{incident_id}-P{int(payload.get('plan_version', 1))}",
            "version": int(payload.get("plan_version", 1)),
            "objective": "System fallback: Emergency response planning initialized. Proceed with extreme caution.",
            "priority": "HIGH",
            "assigned_resources": payload.get("assigned_resources", []),
            "route": "Route generated via fallback. Verify road physical status manually.",
            "hazards": ["Unverified hazards due to system fallback"],
            "contingency": "Await manual command override.",
            "trigger_conditions": [],
            "external_support": [],
            "confidence": 0.5,
            "evidence_ids": payload.get("evidence_ids", [])
        }
        return {
            "status": "RECOVERED", 
            "agent": "response_planning", 
            "incident_id": incident_id, 
            "error": str(e), 
            "plan": fallback_plan, 
            "route_evidence": route
        }

if __name__ == "__main__":
    print(run_response_planning({
        "incident_id": "RK-1042",
        "verification_state": "VERIFIED",
        "assigned_resources": ["RT-07", "BOAT-03"],
        "road_blocked": False,
        "start_lat": 16.52, "start_lon": 80.64,
        "end_lat": 16.53, "end_lon": 80.65,
        "situation": {"disaster_type": "flood", "severity": "HIGH"},
        "plan_version": 1,
    }))