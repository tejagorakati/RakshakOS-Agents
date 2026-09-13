def parse_rakshak_for_ui(orchestrator_output: dict, incident_id: str) -> dict:
    """
    Transforms raw multi-agent telemetry into the exact JSON format 
    expected by the Streamlit Dual-UI without altering the frontend.
    """
    summary = orchestrator_output.get("summary", {})
    specialists = orchestrator_output.get("specialist_results", [])
    
    # Extract data safely with fallbacks
    impact_data = next((s.get("assessment", {}) for s in specialists if s.get("agent") == "situation_impact"), {})
    plan_data = next((s.get("plan", {}) for s in specialists if s.get("agent") == "response_planning"), {})
    resource_data = next((s.get("decision", {}) for s in specialists if s.get("agent") == "resource_management"), {})
    
    # Rebuild into the exact schema the Streamlit UI expects
    ui_state = {
        "incident_id": incident_id,
        "location": impact_data.get("location", "Unknown Zone"),
        "severity": impact_data.get("severity", "Moderate"),
        "affected_population": impact_data.get("affected_population", 0),
        "critical_infrastructure": impact_data.get("infrastructure_impacts", []),
        
        # Format assigned resources for the UI
        "internal_resources": [
            res.get("resource_id", "Unknown Unit") 
            for res in resource_data.get("assignments", [])
        ],
        "shortages": resource_data.get("shortages", []),
        
        # Populate the active mission board
        "active_mission": {
            "mission": plan_data.get("objective", "Awaiting objective calculation."),
            "location": impact_data.get("location", "Unknown Location"),
            "route": plan_data.get("route", "Route unverified."),
            "priority": plan_data.get("priority", "P2"),
            "reason": summary.get("safety_note", "No safety notes available.")
        },
        
        # Authority Boundary mapping
        "official_requests": []
    }
    
    # Map shortages to official authority requests
    for shortage in ui_state["shortages"]:
        ui_state["official_requests"].append({
            "request_id": f"REQ-EXT-{incident_id[-3:]}",
            "required": f"External {shortage} requested.",
            "reason": "Internal capacity exhausted. Human authority approval required.",
            "priority": "CRITICAL"
        })
        
    return ui_state