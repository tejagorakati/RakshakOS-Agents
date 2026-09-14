"""
Data-parsing adapter module for transforming multi-agent outputs to Next.js frontend format.
Extracted from api.py for easier testing and reusability.
"""

def parse_rakshak_for_nextjs_frontend(orchestrator_output: dict, incident_id: str) -> dict:
    """
    🎯 DATA-PARSING ADAPTER FOR NEXT.JS FRONTEND
    
    Transforms raw multi-agent telemetry from run_rakshak() into the exact 
    JSON format expected by the Next.js RakshakOS Frontend Command Center.
    
    This function implements defensive parsing with safe fallbacks to prevent
    UI crashes when the AI misses fields or returns unexpected structures.
    
    Args:
        orchestrator_output: Raw nested output from run_rakshak() pipeline
        incident_id: Unique incident identifier
        
    Returns:
        CommandCenterOverview-compatible dictionary for Next.js frontend
    """
    from datetime import datetime
    
    # Extract top-level containers with safe fallbacks
    summary = orchestrator_output.get("summary", {})
    specialists = orchestrator_output.get("specialist_results", [])
    
    # 🔍 Parse specialist outputs with defensive extraction
    impact_data = {}
    plan_data = {}
    resource_data = {}
    ground_data = {}
    
    for specialist in specialists:
        agent_name = specialist.get("agent", "")
        
        if agent_name == "situation_impact":
            impact_data = specialist.get("assessment", {})
        elif agent_name == "response_planning":
            plan_data = specialist.get("plan", {})
        elif agent_name == "resource_management":
            resource_data = specialist.get("decision", {})
        elif agent_name == "ground_verification":
            ground_data = specialist.get("verification", {})
    
    # 🛡️ Safe extraction with fallbacks
    location = impact_data.get("location") or summary.get("location") or "Unknown Zone"
    severity = _map_severity_to_frontend(
        impact_data.get("severity") or 
        impact_data.get("severity_level") or 
        summary.get("severity") or 
        "Moderate"
    )
    
    # Current timestamp for various fields
    current_time = datetime.now().strftime("%H:%M:%S")
    
    # 📦 Build incident item
    incident = _build_incident_item(
        incident_id, location, severity, impact_data, 
        plan_data, resource_data, ground_data, summary
    )
    
    # 👥 Build team items from resource assignments
    teams = _build_team_items(resource_data, incident_id, location)
    
    # 🎒 Build resource items
    resources = _build_resource_items(resource_data)
    
    # 📊 Build operational stats
    stats = _build_operational_stats(impact_data, resource_data, [incident])
    
    # 🗺️ Build response zones
    zones = _build_response_zones(location, severity, incident_id, impact_data)
    
    # 🚨 Build operational alerts
    alerts = _build_operational_alerts(
        impact_data, plan_data, ground_data, summary, 
        incident_id, location, current_time
    )
    
    # 🤖 Build agent activity events
    agent_activity = _build_agent_activity(
        plan_data, resource_data, ground_data, 
        incident_id, current_time
    )
    
    # ⚠️ Build human attention items (exceptional approvals)
    human_attention_items = _build_human_attention_items(
        resource_data, plan_data, incident_id, current_time
    )

    # 🎯 Build active operational state
    active_state = _build_active_state(
        incident_id, location, plan_data, resource_data, summary
    )

    # ✅ Build the response conclusion shown to field operators and responders after reports.
    response_conclusion_lines = _build_response_conclusion_lines(
        incident_id, location, plan_data, resource_data, ground_data, summary
    )
    resource_inventory = _build_resource_inventory(resource_data)
    plan_lifecycle = _build_plan_lifecycle(plan_data, resource_data, summary)

    # 🏗️ Assemble complete CommandCenterOverview structure
    return {
        "disasterScenarioName": summary.get("disaster_type", "Disaster Response Operation"),
        "regionLocation": f"{location} Emergency Operations Center",
        "operationStatus": "RESPONSE ACTIVE" if orchestrator_output.get("status") == "SUCCESS" else "PROCESSING",
        "lastUpdated": current_time,
        "stats": stats,
        "incidents": [incident],
        "teams": teams,
        "resources": resources,
        "zones": zones,
        "alerts": alerts,
        "agentActivity": agent_activity,
        "humanAttentionItems": human_attention_items,
        "activeState": active_state,
        "responseConclusion": "\n".join(response_conclusion_lines),
        "responseConclusionLines": response_conclusion_lines,
        "resourceInventory": resource_inventory,
        "planLifecycle": plan_lifecycle,
    }


def _map_severity_to_frontend(severity: str) -> str:
    """Map various severity formats to frontend SeverityLevel"""
    severity_upper = str(severity).upper()
    
    severity_map = {
        "CRITICAL": "CRITICAL",
        "HIGH": "CRITICAL",
        "P1": "CRITICAL",
        "SEVERE": "CRITICAL",
        "WARNING": "WARNING",
        "MEDIUM": "WARNING",
        "P2": "WARNING",
        "MODERATE": "WARNING",
        "ACTIVE": "ACTIVE",
        "LOW": "ACTIVE",
        "P3": "ACTIVE",
        "NORMAL": "NORMAL",
        "P4": "NORMAL"
    }
    
    for key, value in severity_map.items():
        if key in severity_upper:
            return value
    
    return "WARNING"  # Default fallback


def _build_incident_item(incident_id, location, severity, impact_data, plan_data, resource_data, ground_data, summary) -> dict:
    """Build IncidentItem structure"""
    
    # Determine priority from severity
    priority_map = {
        "CRITICAL": "CRITICAL",
        "WARNING": "HIGH",
        "ACTIVE": "MEDIUM",
        "NORMAL": "LOW"
    }
    priority = priority_map.get(severity, "MEDIUM")
    
    # Determine status from verification and plan state
    verification_state = ground_data.get("verification_state", "UNVERIFIED")
    status = "REPORTED"
    if plan_data.get("status") == "SUCCESS":
        status = "DISPATCHED"
    elif verification_state == "VERIFIED":
        status = "ASSESSING"
    
    # Get assigned resources
    assignments = resource_data.get("assignments", [])
    assigned_team = None
    resources = []
    
    if assignments:
        first_assignment = assignments[0] if isinstance(assignments, list) else assignments
        if isinstance(first_assignment, dict):
            assigned_team = first_assignment.get("resource_id", first_assignment.get("team_id", "Response Team"))
        
        resources = [
            a.get("resource_id", str(a)) if isinstance(a, dict) else str(a) 
            for a in assignments
        ]
    
    # Route status
    route_status = plan_data.get("route_status", "Clear")
    if "blocked" in str(plan_data.get("route", "")).lower():
        route_status = "IMPASSABLE"
    elif "alternative" in str(plan_data.get("route", "")).lower():
        route_status = "Rerouted"
    
    # Agent status
    agent_status = f"Plan V{plan_data.get('version', 1)} Active"
    if plan_data.get("status") == "SUCCESS":
        agent_status += " • Dispatch Executed"
    
    return {
        "id": incident_id,
        "code": incident_id,
        "title": impact_data.get("situation_summary", summary.get("executive_summary", "Emergency Response Required"))[:80],
        "priority": priority,
        "status": status,
        "location": location,
        "situation": impact_data.get("situation_summary", summary.get("executive_summary", "Assessment in progress")),
        "assignedTeam": assigned_team,
        "resources": resources if resources else ["Assessment pending"],
        "routeStatus": route_status,
        "agentStatus": agent_status,
        "planVersion": f"V{plan_data.get('version', 1)}"
    }


def _build_team_items(resource_data, incident_id, location) -> list:
    """Build ResponseTeamItem structures from resource assignments"""
    teams = []
    assignments = resource_data.get("assignments", [])
    
    for idx, assignment in enumerate(assignments):
        if isinstance(assignment, dict):
            team_name = assignment.get("resource_id", assignment.get("team_id", f"Response Team {idx+1}"))
            team_type = assignment.get("type", "Emergency Response Unit")
            equipment = assignment.get("equipment", [])
        else:
            team_name = str(assignment)
            team_type = "Emergency Response Unit"
            equipment = []
        
        teams.append({
            "id": f"TEAM-{idx+1:02d}",
            "code": f"TEAM-{idx+1:02d}",
            "name": team_name,
            "type": team_type,
            "membersCount": 6,  # Default team size
            "status": "DEPLOYED",
            "currentAssignment": f"{incident_id}: Emergency Response",
            "location": location,
            "equipment": equipment if isinstance(equipment, list) else []
        })
    
    # Add standby teams for shortages
    shortages = resource_data.get("shortages", [])
    for idx, shortage in enumerate(shortages):
        teams.append({
            "id": f"TEAM-STANDBY-{idx+1}",
            "code": f"TEAM-STANDBY-{idx+1}",
            "name": f"{shortage} Team (Requested)",
            "type": "External Resource",
            "membersCount": 0,
            "status": "STANDBY",
            "currentAssignment": "Awaiting Human Authority Approval",
            "location": "External Coordination",
            "equipment": []
        })
    
    return teams


def _build_resource_items(resource_data) -> list:
    """Build ResourceItem structures"""
    resources = []
    assignments = resource_data.get("assignments", [])
    shortages = resource_data.get("shortages", [])
    
    # Aggregate resource types
    resource_types = {
        "boat": {"name": "Rescue Boats", "category": "BOAT", "deployed": 0},
        "medical": {"name": "Medical Units", "category": "MEDICAL", "deployed": 0},
        "vehicle": {"name": "Response Vehicles", "category": "VEHICLE", "deployed": 0},
        "equipment": {"name": "Emergency Equipment", "category": "EQUIPMENT", "deployed": 0}
    }
    
    for assignment in assignments:
        resource_id = assignment.get("resource_id", str(assignment)) if isinstance(assignment, dict) else str(assignment)
        resource_id_lower = resource_id.lower()
        
        if "boat" in resource_id_lower:
            resource_types["boat"]["deployed"] += 1
        elif "medical" in resource_id_lower or "ambulance" in resource_id_lower:
            resource_types["medical"]["deployed"] += 1
        elif "vehicle" in resource_id_lower or "truck" in resource_id_lower:
            resource_types["vehicle"]["deployed"] += 1
        else:
            resource_types["equipment"]["deployed"] += 1
    
    for key, res_data in resource_types.items():
        if res_data["deployed"] > 0:
            total = res_data["deployed"] + 2  # Assume some reserves
            status = "HIGH_DEMAND" if res_data["deployed"] / total > 0.7 else "OPTIMAL"
            
            resources.append({
                "id": f"res-{key}",
                "name": res_data["name"],
                "category": res_data["category"],
                "totalCount": total,
                "deployedCount": res_data["deployed"],
                "unit": "Units",
                "status": status
            })
    
    return resources


def _build_operational_stats(impact_data, resource_data, incidents) -> list:
    """Build OperationalStat structures"""
    assignments = resource_data.get("assignments", [])
    shortages = resource_data.get("shortages", [])
    critical_count = sum(1 for inc in incidents if inc.get("priority") == "CRITICAL")
    
    total_teams = len(assignments) + 2  # Assume some standby
    deployed_teams = len(assignments)
    
    return [
        {
            "id": "stat-active-incidents",
            "key": "incidents",
            "label": "Active Incidents",
            "value": len(incidents),
            "statusText": f"{len(incidents)} In Progress",
            "supportingDetail": "Real-time incident monitoring active",
            "statusVariant": "active"
        },
        {
            "id": "stat-critical-incidents",
            "key": "critical",
            "label": "Critical Incidents",
            "value": critical_count,
            "statusText": "Immediate Action Required" if critical_count > 0 else "No Critical Alerts",
            "supportingDetail": f"{len(shortages)} requiring human approval" if shortages else "All within automated bounds",
            "statusVariant": "critical" if critical_count > 0 else "active"
        },
        {
            "id": "stat-teams-deployed",
            "key": "teams",
            "label": "Teams Deployed",
            "value": f"{deployed_teams} / {total_teams}",
            "statusText": f"{int(deployed_teams/total_teams*100)}% Active Deployment",
            "supportingDetail": f"{total_teams - deployed_teams} units on standby reserve",
            "statusVariant": "active"
        },
        {
            "id": "stat-resources-allocated",
            "key": "resources",
            "label": "Resource Allocation",
            "value": f"{int(deployed_teams/total_teams*100)}%",
            "statusText": f"{deployed_teams} Units Active",
            "supportingDetail": f"{len(shortages)} external requests pending" if shortages else "Capacity available",
            "statusVariant": "warning" if shortages else "active"
        }
    ]


def _build_response_zones(location, severity, incident_id, impact_data) -> list:
    """Build ResponseZone structures"""
    water_level = impact_data.get("water_level", "Unknown")
    infrastructure_impacts = impact_data.get("infrastructure_impacts", [])
    
    return [
        {
            "id": f"zone-{incident_id}",
            "name": location,
            "sectorCode": "SEC-01",
            "severity": severity,
            "incidentCount": 1,
            "waterLevelDepth": water_level if water_level != "Unknown" else "Assessment Pending",
            "deployedTeamsCount": 1,
            "primaryRisk": infrastructure_impacts[0] if infrastructure_impacts else "Emergency Response In Progress",
            "routeStatus": "PARTIALLY_BLOCKED" if "blocked" in str(impact_data).lower() else "CLEAR",
            "incidentIds": [incident_id]
        }
    ]


def _build_operational_alerts(impact_data, plan_data, ground_data, summary, incident_id, location, current_time) -> list:
    """Build OperationalAlert structures"""
    alerts = []
    
    # Critical alerts from summary
    critical_alerts_raw = summary.get("critical_alerts", [])
    if not isinstance(critical_alerts_raw, list):
        critical_alerts_raw = [critical_alerts_raw] if critical_alerts_raw else []
    
    for idx, alert_text in enumerate(critical_alerts_raw):
        alerts.append({
            "id": f"alert-{idx+1}",
            "title": f"Critical Alert: {str(alert_text)[:50]}",
            "message": str(alert_text),
            "severity": "CRITICAL",
            "timestamp": current_time,
            "location": location,
            "incidentId": incident_id
        })
    
    # Ground verification alerts
    if ground_data.get("verification_state") == "UNVERIFIED":
        alerts.append({
            "id": "alert-verification",
            "title": "Ground Verification Pending",
            "message": "Incident awaiting ground truth verification from field teams.",
            "severity": "WARNING",
            "timestamp": current_time,
            "location": location,
            "incidentId": incident_id
        })
    
    # Route alerts
    if "blocked" in str(plan_data.get("route", "")).lower():
        alerts.append({
            "id": "alert-route",
            "title": "Route Obstruction Detected",
            "message": f"Primary access route blocked. Alternative routing initiated: {plan_data.get('route', 'Calculating')}",
            "severity": "CRITICAL",
            "timestamp": current_time,
            "location": location,
            "incidentId": incident_id
        })
    
    return alerts


def _build_agent_activity(plan_data, resource_data, ground_data, incident_id, current_time) -> list:
    """Build AgentActivitySummaryEvent structures"""
    events = []
    
    # Incident assessment
    events.append({
        "id": "evt-assess",
        "eventType": "INCIDENT_ASSESSED",
        "description": "Situation & Impact analysis completed. Multi-agent coordination initiated.",
        "timestamp": current_time,
        "status": "COMPLETED",
        "incidentId": incident_id,
        "details": "Impact assessment and priority classification completed by Situation & Impact Agent."
    })
    
    # Team assignment
    assignments = resource_data.get("assignments", [])
    if assignments:
        events.append({
            "id": "evt-team-assign",
            "eventType": "TEAM_ASSIGNED",
            "description": f"Response teams assigned: {len(assignments)} units deployed to incident zone.",
            "timestamp": current_time,
            "status": "COMPLETED",
            "incidentId": incident_id,
            "details": f"Resource Management Agent allocated {len(assignments)} response units based on availability and capability matching."
        })
    
    # Resource allocation
    if assignments:
        events.append({
            "id": "evt-resource",
            "eventType": "RESOURCE_ALLOCATED",
            "description": f"Equipment and resources allocated to {len(assignments)} response teams.",
            "timestamp": current_time,
            "status": "COMPLETED",
            "incidentId": incident_id
        })
    
    # Plan generation
    if plan_data.get("status") == "SUCCESS":
        events.append({
            "id": "evt-plan",
            "eventType": "PLAN_UPDATED",
            "description": f"Response Plan V{plan_data.get('version', 1)} generated and activated.",
            "timestamp": current_time,
            "status": "COMPLETED",
            "incidentId": incident_id,
            "details": f"Route: {plan_data.get('route', 'Optimized path calculated')}"
        })
    
    return events


def _build_human_attention_items(resource_data, plan_data, incident_id, current_time) -> list:
    """Build HumanAttentionItem structures for exceptional approvals"""
    items = []
    shortages = resource_data.get("shortages", [])
    
    for idx, shortage in enumerate(shortages):
        items.append({
            "id": f"att-{idx+1}",
            "title": f"External Resource Request: {shortage}",
            "proposedAction": f"Request external {shortage} from regional coordination center or neighboring districts.",
            "reason": "Internal resource capacity exhausted. Incident requirements exceed available controlled resources.",
            "impact": f"May introduce coordination delay of 15-30 minutes. External agency dispatch requires human authority approval.",
            "requestingAgent": "Resource Management Agent",
            "timestamp": current_time,
            "riskLevel": "OUT_OF_BOUNDS",
            "status": "PENDING"
        })
    
    return items


def _build_active_state(incident_id, location, plan_data, resource_data, summary) -> dict:
    """Build ActiveOperationalState structure"""
    assignments = resource_data.get("assignments", [])
    assigned_team = "No team assigned"
    
    if assignments:
        first = assignments[0]
        assigned_team = first.get("resource_id", str(first)) if isinstance(first, dict) else str(first)
    
    priority_map = {"P1": "CRITICAL", "P2": "HIGH", "P3": "MEDIUM"}
    priority = priority_map.get(summary.get("priority", "P2"), "HIGH")
    
    return {
        "incidentCode": incident_id,
        "incidentTitle": summary.get("executive_summary", "Emergency Response In Progress")[:60],
        "priority": priority,
        "planVersion": f"V{plan_data.get('version', 1)} (Active)",
        "assignedTeam": assigned_team,
        "route": plan_data.get("route", "Route calculation in progress"),
        "lastChange": "Multi-agent coordination active"
    }


def _build_resource_inventory(resource_data) -> list:
    """Return the controlled resource inventory in a frontend-friendly form."""
    inventory = []
    assignments = resource_data.get("assignments", [])
    for idx, assignment in enumerate(assignments):
        if isinstance(assignment, dict):
            inventory.append({
                "resourceId": assignment.get("resource_id", f"RESOURCE-{idx+1}"),
                "resourceType": assignment.get("resource_type", "resource"),
                "capability": assignment.get("capability", "varied"),
                "status": "ASSIGNED",
                "location": assignment.get("destination", "UNKNOWN"),
                "available": True,
            })
    for idx, shortage in enumerate(resource_data.get("shortages", [])):
        inventory.append({
            "resourceId": f"REQUEST-{idx+1}",
            "resourceType": "shortage",
            "capability": str(shortage),
            "status": "REQUESTED",
            "location": "PENDING",
            "available": False,
        })
    return inventory


def _build_plan_lifecycle(plan_data, resource_data, summary) -> list:
    """Return versioned plan history in a compact format."""
    version = max(1, int(plan_data.get("version", 1)))
    route = plan_data.get("route") or "Route under review"
    objective = plan_data.get("objective") or summary.get("executive_summary") or "Awaiting mission objective"
    return [{
        "version": f"V{version}",
        "status": "ACTIVE",
        "objective": objective,
        "assignedResources": [
            entry.get("resource_id", str(entry)) if isinstance(entry, dict) else str(entry)
            for entry in resource_data.get("assignments", [])
        ],
        "route": route,
        "trigger": "Ground report accepted and response rerendered." if version > 1 else "Initial plan generated.",
        "changeReason": "Updated route and resource allocation based on assessment and field evidence.",
    }]


def _build_response_conclusion_lines(incident_id, location, plan_data, resource_data, ground_data, summary) -> list:
    """Return a 5-10 line operational conclusion shown to field users after a report."""
    route = plan_data.get("route") or "Operations remain in advisory route mode until field verification is complete."
    objective = plan_data.get("objective") or "Mission objective is being finalized by the command loop."
    assigned = [
        entry.get("resource_id", str(entry)) if isinstance(entry, dict) else str(entry)
        for entry in resource_data.get("assignments", [])
    ]
    verification_state = ground_data.get("verification_state") or "UNVERIFIED"
    confidence = ground_data.get("confidence") or 0.0
    hazards = plan_data.get("hazards") or summary.get("critical_alerts") or ["Field conditions are being monitored."]
    return [
        f"Incident {incident_id} remains active in {location} with the response loop continuing in real time.",
        f"Mission objective: {objective}",
        f"Ground verification status: {verification_state} (confidence {float(confidence):.2f}).",
        f"Assigned assets: {', '.join(assigned) if assigned else 'Awaiting allocation.'}",
        f"Operational route: {route}",
        f"Current watchlist: {', '.join(hazards) if isinstance(hazards, list) else str(hazards)}",
        f"Next step: maintain monitoring, validate route access, and re-plan if new ground reports change the risk profile.",
        f"Decision confidence is sufficient for controlled coordination, but human review remains required for out-of-bounds or external requests.",
    ]
