from typing import Dict, Any, List
from common import make_agent, safe_metrics
from schemas import VerificationResult

SOURCE_RELIABILITY = {
    "authority": 0.97, 
    "rescue_team": 0.94, 
    "sensor": 0.92,
    "traffic": 0.90, 
    "citizen": 0.65, 
    "news": 0.55,
}

def deterministic_verification(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculates ground truth verification deterministically without LLM delay."""
    if not reports:
        return {
            "state": "UNVERIFIED", 
            "confidence": 0.0, 
            "sources": [], 
            "conflicts": [], 
            "reason": "No ground evidence."
        }
    
    fresh = [r for r in reports if not r.get("stale", False)]
    sources = {r.get("source_type", "unknown") for r in fresh}
    text = " ".join(str(r.get("claim", "")).lower() for r in fresh)
    
    problem = any(x in text for x in ["blocked", "flooded", "collapsed", "trapped"])
    clear = any(x in text for x in ["clear", "open", "passable"])
    
    if problem and clear:
        state = "CONFLICTING"
    elif len(sources & {"authority", "rescue_team", "sensor"}) >= 2:
        state = "VERIFIED"
    elif len(sources) >= 2:
        state = "CORROBORATED"
    elif not fresh:
        state = "STALE"
    else:
        state = "UNVERIFIED"
        
    confidence = min(
        0.99, 
        max([SOURCE_RELIABILITY.get(s, 0.5) for s in sources], default=0.0) + 0.05 * max(0, len(sources) - 1)
    )
    
    return {
        "state": state,
        "confidence": round(confidence, 2),
        "sources": sorted(sources),
        "conflicts": ["problem-vs-clear"] if state == "CONFLICTING" else [],
        "reason": f"Deterministic verification from {len(fresh)} fresh report(s).",
    }

agent = make_agent(
    """You are the RakshakOS Ground Verification Agent.
Your job is to generate a structured VerificationResult.
RULES FOR STRUCTURED OUTPUT:
1. NEVER use null for list fields like 'evidence_ids', 'corroborating_sources', or 'conflicting_sources'. Use [] if empty.
2. The deterministic state supplied by the system is authoritative. Do not alter it.""",
    name="ground-verification-agent",
)

def run_ground_verification(payload: Dict[str, Any]) -> Dict[str, Any]:
    incident_id = payload.get("incident_id", "UNKNOWN")
    reports = payload.get("reports", [])
    decision = deterministic_verification(reports)
    
    evidence_ids = [str(r.get("id")) for r in reports if r.get("id")]
    
    prompt = f"""Incident: {incident_id}
Reports: {reports}
Deterministic calculation: {decision}
Extract evidence_ids: {evidence_ids}
Generate the final VerificationResult without modifying the deterministic state."""

    try:
        result = agent(prompt, structured_output_model=VerificationResult)
        out = result.structured_output
        
        # Override fields with deterministic ground truth values
        out.incident_id = incident_id
        out.verification_state = decision["state"]
        out.confidence = decision["confidence"]
        out.corroborating_sources = decision["sources"]
        out.conflicting_sources = decision["conflicts"]
        out.reason = decision["reason"]
        
        if hasattr(out, "evidence_ids") and not out.evidence_ids:
            out.evidence_ids = evidence_ids
            
        return {
            "status": "SUCCESS", 
            "agent": "ground_verification", 
            "incident_id": incident_id, 
            "verification": out.model_dump(), 
            "metrics": safe_metrics(result)
        }
    except Exception as e:
        # Pass incident_id to fallback constructor to satisfy Pydantic validation
        fallback_out = VerificationResult(
            incident_id=incident_id,
            verification_state=decision["state"],
            confidence=decision["confidence"],
            corroborating_sources=decision["sources"],
            conflicting_sources=decision["conflicts"],
            reason=decision["reason"],
            evidence_ids=evidence_ids
        )
        return {
            "status": "RECOVERED", 
            "agent": "ground_verification", 
            "incident_id": incident_id, 
            "error": str(e), 
            "verification": fallback_out.model_dump(),
            "metrics": {}
        }

if __name__ == "__main__":
    print(run_ground_verification({
        "incident_id": "RK-1042",
        "reports": [
            {"id": "EV-01", "source_type": "citizen", "claim": "water entered houses", "stale": False},
            {"id": "EV-02", "source_type": "rescue_team", "claim": "flooded road", "stale": False},
        ],
    }))