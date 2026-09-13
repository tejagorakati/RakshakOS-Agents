import json
from typing import Dict, Any
from common import make_agent, safe_metrics
from schemas import ResourceDecision

RESOURCE_DB = [
    {"id": "RT-07", "type": "rescue_team", "capability": "water_rescue", "available": True, "location": "Vijayawada"},
    {"id": "AMB-02", "type": "ambulance", "capability": "medical_transport", "available": True, "location": "Vijayawada"},
    {"id": "BOAT-03", "type": "boat", "capability": "water_rescue", "available": True, "location": "Vijayawada"},
    {"id": "MED-11", "type": "medical_kit", "capability": "first_aid", "available": True, "location": "Vijayawada"},
]

def rule_based_allocate(payload):
    requirements = payload.get("requirements", [])
    available = [r.copy() for r in RESOURCE_DB if r["available"]]
    assignments, shortages = [], []
    for req in requirements:
        text = str(req).lower()
        match = None
        if "boat" in text or "water" in text or "rescue" in text:
            match = next((r for r in available if r["capability"] == "water_rescue"), None)
        elif "ambulance" in text or "transport" in text:
            match = next((r for r in available if r["capability"] == "medical_transport"), None)
        elif "medical" in text or "first aid" in text:
            match = next((r for r in available if r["capability"] == "first_aid"), None)
        if match:
            assignments.append(match)
            available.remove(match)
        else:
            shortages.append(req)
    return {"assignments": assignments, "shortages": shortages, "external_assistance_required": bool(shortages)}

agent = make_agent(
    """You are the RakshakOS Resource Management Agent.
Match requirements to real controlled resources. Never invent availability.
External support is only an assistance request; never claim dispatch or acceptance.
RULES FOR STRUCTURED OUTPUT:
1. Focus ONLY on writing a clear, concise 'rationale' explaining the allocation.
2. For 'assignments' and 'shortages', output empty arrays: []
3. We will populate the complex arrays programmatically after you generate the rationale.""",
    name="resource-management-agent",
)

def run_resource_management(payload: Dict[str, Any]):
    incident_id = payload.get("incident_id", "UNKNOWN")
    allocation = rule_based_allocate(payload)
    
    # Passing the pre-calculated allocation as a clean JSON string
    prompt = f"""Incident: {incident_id}
Requirements: {payload.get("requirements", [])}
Deterministic allocation (Already calculated): {json.dumps(allocation)}
Explain the allocation and shortages in the 'rationale' field."""
    
    try:
        result = agent(prompt, structured_output_model=ResourceDecision)
        out = result.structured_output
        
        # We seamlessly overwrite the empty arrays the LLM provided with our 100% accurate Python data
        out.assignments = [
            {
                "resource_id": r["id"],
                "resource_type": r["type"],
                "capability": r["capability"],
                "destination": payload.get("location", "UNKNOWN"),
                "priority": payload.get("priority", "P2"),
            }
            for r in allocation["assignments"]
        ]
        out.shortages = allocation["shortages"]
        out.external_assistance_required = allocation["external_assistance_required"]
        out.confidence = 0.95 if not allocation["shortages"] else 0.85
        
        return {
            "status": "SUCCESS", 
            "agent": "resource_management", 
            "incident_id": incident_id, 
            "decision": out.model_dump(), 
            "metrics": safe_metrics(result)
        }
    except Exception as e:
        # Zero-Crash Fallback: Since the heavy lifting is done in Python, if the LLM goes down,
        # we can completely construct the final payload without it!
        fallback_decision = {
            "incident_id": incident_id,
            "assignments": [
                {
                    "resource_id": r["id"],
                    "resource_type": r["type"],
                    "capability": r["capability"],
                    "destination": payload.get("location", "UNKNOWN"),
                    "priority": payload.get("priority", "P2"),
                }
                for r in allocation["assignments"]
            ],
            "shortages": allocation["shortages"],
            "external_assistance_required": allocation["external_assistance_required"],
            "rationale": "System fallback: Resources allocated deterministically based on requirements.",
            "confidence": 0.95 if not allocation["shortages"] else 0.85
        }
        
        return {
            "status": "RECOVERED", 
            "agent": "resource_management", 
            "incident_id": incident_id, 
            "error": str(e), 
            "decision": fallback_decision
        }

if __name__ == "__main__":
    print(run_resource_management({"incident_id": "RK-1042", "location": "Vijayawada", "priority": "P1", "requirements": ["boat", "medical transport"]}))