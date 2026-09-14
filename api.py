"""
FastAPI Backend for RakshakOS Multi-Agent System
Serves on localhost:8000 and provides data-parsing adapter for Next.js Frontend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import hashlib
import hmac
import secrets
import sqlite3
import json
import re
import xml.etree.ElementTree as ET
from urllib.parse import quote_plus
from pathlib import Path
import requests
from rakshak import run_rakshak
from adapter import parse_rakshak_for_nextjs_frontend

app = FastAPI(title="RakshakOS API", version="1.0.0")
DATABASE_PATH = Path(__file__).with_name("rakshakos.db")

# Enable CORS for Next.js frontend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8501",  # Keep Streamlit support
        "http://127.0.0.1:8501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class IncidentRequest(BaseModel):
    """Request model for incident processing"""
    event_type: str = "INCIDENT_CREATED"
    incident_id: str
    disaster_type: str
    location: str
    latitude: float
    longitude: float
    start_lat: Optional[float] = None
    start_lon: Optional[float] = None
    end_lat: Optional[float] = None
    end_lon: Optional[float] = None
    priority: str = "P2"
    requirements: List[str] = Field(default_factory=list)
    reports: List[Dict[str, Any]] = Field(default_factory=list)
    road_blocked: bool = False
    evidence_ids: List[str] = Field(default_factory=list)
    plan_version: int = 1


class RegistrationRequest(BaseModel):
    role: str
    email: str
    password: str
    profile: Dict[str, Any] = Field(default_factory=dict)


class LoginRequest(BaseModel):
    email: str
    password: str


class SituationReportRequest(BaseModel):
    category: str
    location: str
    description: str
    source_type: str = "volunteer"


class IntelligenceRequest(BaseModel):
    query: str
    location: str = "Unknown Zone"
    disaster_type: str = "disaster"
    report_text: str = ""
    source_url: Optional[str] = None
    incident_id: Optional[str] = None
    latitude: float = 0.0
    longitude: float = 0.0


class ApprovalRequestCreate(BaseModel):
    """Volunteer submits a resource approval request for an incident."""
    requester_id: str
    item: str
    details: str = ""


class ApprovalDecision(BaseModel):
    """Official approves or rejects a pending approval request."""
    official_id: str
    decision: str  # "approved" | "rejected"


class TeamMemberRequest(BaseModel):
    name: str
    email: str
    mobile: str = ""
    skills: List[str] = Field(default_factory=list)


class TeamInviteRequest(BaseModel):
    email: str
    message: str = "You have been invited to join a RakshakOS response team."


class SessionMessageRequest(BaseModel):
    sender: str = "RakshakOS Agent"
    message: str


def _db() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _init_db() -> None:
    with _db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                profile_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS incidents (
                incident_id TEXT PRIMARY KEY,
                event_json TEXT NOT NULL,
                output_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS team_members (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                mobile TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS team_invites (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS incident_messages (
                id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS incident_sessions (
                incident_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                closed_at TEXT
            );
            CREATE TABLE IF NOT EXISTS approval_requests (
                id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                requester_id TEXT NOT NULL,
                item TEXT NOT NULL,
                details TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                decided_at TEXT,
                official_id TEXT
            );
            """
        )


def _password_hash(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"{salt.hex()}${digest.hex()}"


def _password_matches(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, digest_hex = stored_hash.split("$", 1)
        expected = _password_hash(password, bytes.fromhex(salt_hex)).split("$", 1)[1]
        return hmac.compare_digest(expected, digest_hex)
    except (ValueError, TypeError):
        return False


def _save_incident(event: Dict[str, Any], output: Dict[str, Any]) -> None:
    import json
    with _db() as connection:
        connection.execute(
            "INSERT OR REPLACE INTO incidents VALUES (?, ?, ?, ?)",
            (event["incident_id"], json.dumps(event), json.dumps(output), datetime.now(timezone.utc).isoformat()),
        )


def _load_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    with _db() as connection:
        row = connection.execute("SELECT event_json FROM incidents WHERE incident_id = ?", (incident_id,)).fetchone()
    return json.loads(row["event_json"]) if row else None


def _load_incident_output(incident_id: str) -> Optional[Dict[str, Any]]:
    with _db() as connection:
        row = connection.execute("SELECT output_json FROM incidents WHERE incident_id = ?", (incident_id,)).fetchone()
    return json.loads(row["output_json"]) if row else None


def _plan_from_output(output: Dict[str, Any]) -> Dict[str, Any]:
    for item in output.get("specialist_results", []):
        if isinstance(item, dict) and item.get("agent") == "response_planning":
            return item.get("plan") or {}
    return {}


def _build_mission_brief(incident_id: str, event: Dict[str, Any], output: Dict[str, Any]) -> Dict[str, Any]:
    plan = _plan_from_output(output)
    resources = []
    impact = {}
    for item in output.get("specialist_results", []):
        if not isinstance(item, dict):
            continue
        if item.get("agent") == "resource_management":
            resources = (item.get("decision") or {}).get("assignments", [])
        if item.get("agent") == "situation_impact":
            impact = item.get("assessment") or {}
    route_evidence = next((item.get("route_evidence", {}) for item in output.get("specialist_results", []) if isinstance(item, dict) and item.get("agent") == "response_planning"), {})
    route_summary = plan.get("route") or "Route not verified. Confirm physical access before departure."
    transport = []
    for resource in resources:
        if isinstance(resource, dict):
            transport.append(resource.get("capability") or resource.get("resource_type") or resource.get("resource_id", "Assigned unit"))
    if not transport:
        transport = ["Use the safest available vehicle or boat matched to local hazards; confirm with the team lead."]
    shortages = next((item.get("decision", {}).get("shortages", []) for item in output.get("specialist_results", []) if isinstance(item, dict) and item.get("agent") == "resource_management"), [])
    external_support = plan.get("external_support") or shortages or []
    return {
        "incident_id": incident_id,
        "session_status": "OPEN",
        "plan_version": plan.get("version", event.get("plan_version", 1)),
        "priority": plan.get("priority") or event.get("priority", "P2"),
        "importance": impact.get("severity") or "Assessment pending",
        "destination": impact.get("location") or event.get("location") or "Unknown destination",
        "objective": plan.get("objective") or "Await verified mission objective.",
        "route": {
            "summary": route_summary,
            "start": {"latitude": event.get("start_lat", event.get("latitude", 0)), "longitude": event.get("start_lon", event.get("longitude", 0))},
            "destination": {"latitude": event.get("end_lat", event.get("latitude", 0)), "longitude": event.get("end_lon", event.get("longitude", 0))},
            "distance_km": route_evidence.get("distance_km"),
            "duration_minutes": route_evidence.get("duration_minutes"),
            "physical_access_note": "Navigation data is advisory. Team lead must confirm road, bridge, water depth, and safe entry on arrival.",
        },
        "transport_modes": transport,
        "assigned_resources": resources,
        "hazards": plan.get("hazards") or impact.get("hazards") or ["Hazards pending field verification"],
        "external_force_required": external_support,
        "contingency": plan.get("contingency") or "Pause and report if access, weather, or responder safety changes.",
        "next_actions": plan.get("trigger_conditions") or ["Team lead confirms route and reports arrival status."],
    }


def _save_session_message(incident_id: str, sender: str, message: str) -> None:
    with _db() as connection:
        connection.execute("INSERT INTO incident_messages VALUES (?, ?, ?, ?, ?)", (f"MSG-{secrets.token_hex(5).upper()}", incident_id, sender, message, datetime.now(timezone.utc).isoformat()))


_init_db()


def _clean_web_text(html: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()[:12000]


def _run_intelligence_loop(request: IntelligenceRequest, content: str, source: str) -> Dict[str, Any]:
    incident_id = request.incident_id or f"INTEL-{secrets.token_hex(5).upper()}"
    event = {
        "event_type": "EXTERNAL_INTELLIGENCE",
        "incident_id": incident_id,
        "disaster_type": request.disaster_type,
        "location": request.location,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "start_lat": request.latitude,
        "start_lon": request.longitude,
        "end_lat": request.latitude,
        "end_lon": request.longitude,
        "priority": "P2",
        "requirements": [],
        "reports": [{
            "source_type": source,
            "claim": f"{request.query}: {content[:9000]}",
            "stale": False,
        }],
        "evidence_ids": [source],
        "plan_version": 1,
    }
    output = run_rakshak(event)
    _save_incident(event, output)
    return {
        "status": "success",
        "incident_id": incident_id,
        "source": source,
        "data": parse_rakshak_for_nextjs_frontend(output, incident_id),
        "streamlit_data": parse_rakshak_for_ui(output, incident_id),
        "raw_output": output,
    }


def _as_dict(value: Any) -> Dict[str, Any]:
    """Return dictionaries only, keeping malformed agent output harmless."""
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> List[Any]:
    """Return lists only, keeping UI iteration safe when an agent omits data."""
    return value if isinstance(value, list) else []


def _specialist_data(specialists: Any, agent_name: str, result_key: str) -> Dict[str, Any]:
    """Find one specialist result without assuming the pipeline completed fully."""
    for specialist in _as_list(specialists):
        specialist = _as_dict(specialist)
        if specialist.get("agent") == agent_name:
            return _as_dict(specialist.get(result_key))
    return {}


def parse_rakshak_for_ui(orchestrator_output: Any, incident_id: str) -> Dict[str, Any]:
    """Flatten run_rakshak output into the unchanged Streamlit UI contract."""
    output = _as_dict(orchestrator_output)
    summary = _as_dict(output.get("summary"))
    specialists = output.get("specialist_results", [])
    impact = _specialist_data(specialists, "situation_impact", "assessment")
    plan = _specialist_data(specialists, "response_planning", "plan")
    resources = _specialist_data(specialists, "resource_management", "decision")

    resolved_incident_id = str(incident_id or output.get("incident_id") or "UNKNOWN-INCIDENT")
    location = str(impact.get("location") or summary.get("location") or "Unknown Zone")
    severity = str(impact.get("severity") or summary.get("severity") or "Moderate")
    infrastructure = [str(item) for item in _as_list(impact.get("infrastructure_impacts"))]
    shortages = [str(item) for item in _as_list(resources.get("shortages"))]

    internal_resources: List[str] = []
    for assignment in _as_list(resources.get("assignments")):
        if isinstance(assignment, dict):
            resource_id = assignment.get("resource_id") or assignment.get("team_id")
            internal_resources.append(str(resource_id or "Unknown Unit"))
        elif assignment is not None:
            internal_resources.append(str(assignment))

    request_suffix = resolved_incident_id[-3:]
    official_requests = [
        {
            "request_id": f"REQ-EXT-{request_suffix}",
            "required": f"External {shortage} requested.",
            "reason": "Internal capacity exhausted. Human authority approval required.",
            "priority": "CRITICAL",
        }
        for shortage in shortages
    ]

    return {
        "incident_id": resolved_incident_id,
        "location": location,
        "severity": severity,
        "affected_population": impact.get("affected_population", 0) or 0,
        "critical_infrastructure": infrastructure,
        "internal_resources": internal_resources,
        "shortages": shortages,
        "active_mission": {
            "mission": str(plan.get("objective") or "Awaiting objective calculation."),
            "location": location,
            "route": str(plan.get("route") or "Route unverified."),
            "priority": str(plan.get("priority") or summary.get("priority") or "P2"),
            "reason": str(summary.get("safety_note") or "No safety notes available."),
        },
        "official_requests": official_requests,
    }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "RakshakOS API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.post("/auth/register")
async def register(request: RegistrationRequest) -> dict:
    """Create an individual, NGO coordinator, or team profile."""
    import json
    email = request.email.strip().lower()
    if request.role not in {"individual", "ngo_coordinator", "team_member"}:
        raise HTTPException(status_code=400, detail="Unsupported registration role")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email is required")

    user_id = f"USR-{secrets.token_hex(5).upper()}"
    try:
        with _db() as connection:
            connection.execute(
                "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, email, request.role, _password_hash(request.password), json.dumps(request.profile), datetime.now(timezone.utc).isoformat()),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    return {"status": "success", "user": {"id": user_id, "email": email, "role": request.role, "profile": request.profile}}


@app.post("/auth/login")
async def login(request: LoginRequest) -> dict:
    """Authenticate a registered responder using the stored password hash."""
    import json
    with _db() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (request.email.strip().lower(),)).fetchone()
    if not row or not _password_matches(request.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "status": "success",
        "user": {
            "id": row["id"],
            "email": row["email"],
            "role": row["role"],
            "profile": json.loads(row["profile_json"]),
        },
    }


@app.get("/ngo/{owner_id}/members")
async def list_team_members(owner_id: str) -> dict:
    with _db() as connection:
        rows = connection.execute("SELECT * FROM team_members WHERE owner_id = ? ORDER BY created_at DESC", (owner_id,)).fetchall()
    return {"status": "success", "members": [
        {"id": row["id"], "name": row["name"], "email": row["email"], "mobile": row["mobile"], "skills": json.loads(row["skills_json"])}
        for row in rows
    ]}


@app.post("/ngo/{owner_id}/members")
async def add_team_member(owner_id: str, request: TeamMemberRequest) -> dict:
    member_id = f"TEAM-{secrets.token_hex(5).upper()}"
    with _db() as connection:
        connection.execute(
            "INSERT INTO team_members VALUES (?, ?, ?, ?, ?, ?, ?)",
            (member_id, owner_id, request.name.strip(), request.email.strip().lower(), request.mobile.strip(), json.dumps(request.skills), datetime.now(timezone.utc).isoformat()),
        )
    return {"status": "success", "member": {"id": member_id, **request.model_dump()}}


@app.post("/ngo/{owner_id}/invites")
async def invite_team_member(owner_id: str, request: TeamInviteRequest) -> dict:
    invite_id = f"INV-{secrets.token_hex(5).upper()}"
    with _db() as connection:
        connection.execute(
            "INSERT INTO team_invites VALUES (?, ?, ?, ?, ?, ?)",
            (invite_id, owner_id, request.email.strip().lower(), request.message.strip(), "PENDING", datetime.now(timezone.utc).isoformat()),
        )
    return {"status": "success", "invite": {"id": invite_id, "email": request.email.strip().lower(), "status": "PENDING"}, "delivery": "queued"}


@app.post("/intelligence/search")
async def search_active_disasters(request: IntelligenceRequest) -> dict:
    """Search current public news through GDELT without requiring an API key."""
    query = request.query.strip() or f"{request.disaster_type} {request.location}"
    url = "https://api.gdeltproject.org/api/v2/doc/doc"
    articles = []
    try:
        response = requests.get(url, params={"query": query, "mode": "artlist", "format": "json", "maxrecords": 10, "sort": "HybridRel"}, timeout=12)
        response.raise_for_status()
        payload = response.json()
        articles = [{
            "title": item.get("title", "Untitled report"),
            "url": item.get("url", ""),
            "source": item.get("domain", "Unknown source"),
            "published": item.get("seendate", ""),
        } for item in payload.get("articles", [])]
    except (requests.RequestException, ValueError):
        # Keep the public search useful when GDELT is temporarily unavailable.
        rss = requests.get("https://news.google.com/rss/search", params={"q": query}, timeout=12)
        if rss.ok:
            root = ET.fromstring(rss.content)
            articles = [{
                "title": item.findtext("title", "Untitled report"),
                "url": item.findtext("link", ""),
                "source": "Google News RSS",
                "published": item.findtext("pubDate", ""),
            } for item in root.findall("./channel/item")[:10]]
    return {"status": "success", "query": query, "articles": articles, "provider": "GDELT" if articles and articles[0].get("source") != "Google News RSS" else "Google News RSS"}


@app.post("/intelligence/ingest")
async def ingest_intelligence(request: IntelligenceRequest) -> dict:
    """Send typed/uploaded text or a public article URL into the agent loop."""
    content = request.report_text.strip()
    source = "user_report"
    if request.source_url:
        try:
            response = requests.get(request.source_url, timeout=12, headers={"User-Agent": "RakshakOS/1.0"})
            response.raise_for_status()
            content = _clean_web_text(response.text)
            source = request.source_url
        except requests.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Could not read source URL: {exc}")
    if not content:
        raise HTTPException(status_code=400, detail="Add report text or a public source URL")
    return _run_intelligence_loop(request, content, source)


@app.post("/incidents/{incident_id}/approvals")
async def create_approval_request(incident_id: str, request: ApprovalRequestCreate) -> dict:
    """Volunteer creates a resource approval request for an active incident."""
    if not incident_id.strip():
        raise HTTPException(status_code=400, detail="incident_id is required")
    if not request.item.strip():
        raise HTTPException(status_code=400, detail="item is required")
    if not request.requester_id.strip():
        raise HTTPException(status_code=400, detail="requester_id is required")

    approval_id = f"APR-{secrets.token_hex(5).upper()}"
    now = datetime.now(timezone.utc).isoformat()
    with _db() as connection:
        connection.execute(
            "INSERT INTO approval_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                approval_id,
                incident_id.strip(),
                request.requester_id.strip(),
                request.item.strip(),
                request.details.strip(),
                "pending",
                now,
                None,
                None,
            ),
        )
    return {
        "status": "success",
        "approval_request": {
            "id": approval_id,
            "incident_id": incident_id.strip(),
            "requester_id": request.requester_id.strip(),
            "item": request.item.strip(),
            "details": request.details.strip(),
            "status": "pending",
            "created_at": now,
            "decided_at": None,
            "official_id": None,
        },
    }


@app.get("/incidents/{incident_id}/approvals")
async def list_approval_requests(incident_id: str) -> dict:
    """Official retrieves all approval requests for a given incident."""
    with _db() as connection:
        rows = connection.execute(
            "SELECT * FROM approval_requests WHERE incident_id = ? ORDER BY created_at DESC",
            (incident_id,),
        ).fetchall()
    return {
        "status": "success",
        "approval_requests": [
            {
                "id": row["id"],
                "incident_id": row["incident_id"],
                "requester_id": row["requester_id"],
                "item": row["item"],
                "details": row["details"],
                "status": row["status"],
                "created_at": row["created_at"],
                "decided_at": row["decided_at"],
                "official_id": row["official_id"],
            }
            for row in rows
        ],
    }


@app.post("/approvals/{request_id}/decide")
async def decide_approval_request(request_id: str, request: ApprovalDecision) -> dict:
    """Official approves or rejects a pending approval request."""
    if request.decision not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="decision must be 'approved' or 'rejected'")

    with _db() as connection:
        row = connection.execute(
            "SELECT * FROM approval_requests WHERE id = ?", (request_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Approval request not found")
        if row["status"] != "pending":
            raise HTTPException(
                status_code=409,
                detail=f"Request is already '{row['status']}' and cannot be changed",
            )
        now = datetime.now(timezone.utc).isoformat()
        connection.execute(
            "UPDATE approval_requests SET status = ?, decided_at = ?, official_id = ? WHERE id = ?",
            (request.decision, now, request.official_id.strip(), request_id),
        )
    return {
        "status": "success",
        "approval_request": {
            "id": request_id,
            "incident_id": row["incident_id"],
            "requester_id": row["requester_id"],
            "item": row["item"],
            "details": row["details"],
            "status": request.decision,
            "created_at": row["created_at"],
            "decided_at": now,
            "official_id": request.official_id.strip(),
        },
    }


@app.get("/approvals/{request_id}")
async def get_approval_request(request_id: str) -> dict:
    """Volunteer polls the current status of their approval request."""
    with _db() as connection:
        row = connection.execute(
            "SELECT * FROM approval_requests WHERE id = ?", (request_id,)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return {
        "status": "success",
        "approval_request": {
            "id": row["id"],
            "incident_id": row["incident_id"],
            "requester_id": row["requester_id"],
            "item": row["item"],
            "details": row["details"],
            "status": row["status"],
            "created_at": row["created_at"],
            "decided_at": row["decided_at"],
            "official_id": row["official_id"],
        },
    }


@app.post("/process_incident")
async def process_incident(request: IncidentRequest) -> dict:
    """
    Main endpoint for processing disaster incidents through the multi-agent pipeline.
    
    Returns data in the exact format expected by Next.js Frontend Command Center
    """
    try:
        # Convert request to event dictionary
        event = request.model_dump()
        
        # Set default coordinates if not provided
        if event.get("start_lat") is None:
            event["start_lat"] = event["latitude"]
        if event.get("start_lon") is None:
            event["start_lon"] = event["longitude"]
        if event.get("end_lat") is None:
            event["end_lat"] = event["latitude"]
        if event.get("end_lon") is None:
            event["end_lon"] = event["longitude"]
        
        # Run the multi-agent pipeline
        raw_output = run_rakshak(event)
        _save_incident(event, raw_output)
        _save_session_message(request.incident_id, "RakshakOS Agent", "Initial incident assessment and response plan created.")
        
        # Transform raw output into Next.js frontend-compatible format
        command_center_data = parse_rakshak_for_nextjs_frontend(raw_output, request.incident_id)
        
        return {
            "status": "success",
            "data": command_center_data,
            "streamlit_data": parse_rakshak_for_ui(raw_output, request.incident_id),
            "raw_output": raw_output  # Include raw output for debugging
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Pipeline processing failed",
                "message": str(e),
                "incident_id": request.incident_id
            }
        )


@app.post("/incidents/{incident_id}/reports")
async def submit_situation_report(incident_id: str, request: SituationReportRequest) -> dict:
    """Append field telemetry and rerun the pipeline with the next plan version."""
    event = _load_incident(incident_id)
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found. Process an incident before sending reports.")
    if not request.description.strip() or not request.location.strip():
        raise HTTPException(status_code=400, detail="Location and description are required")

    event["reports"] = event.get("reports", []) + [{
        "source_type": request.source_type,
        "claim": f"{request.category}: {request.description.strip()}",
        "location": request.location.strip(),
        "stale": False,
    }]
    event["plan_version"] = int(event.get("plan_version", 1)) + 1
    raw_output = run_rakshak(event)
    _save_incident(event, raw_output)
    _save_session_message(incident_id, "Field Report", f"{request.category}: {request.description} at {request.location}")
    _save_session_message(incident_id, "RakshakOS Agent", f"Plan re-evaluated. Active plan version is {event['plan_version']}.")
    return {
        "status": "success",
        "incident_id": incident_id,
        "plan_version": event["plan_version"],
        "data": parse_rakshak_for_nextjs_frontend(raw_output, incident_id),
        "streamlit_data": parse_rakshak_for_ui(raw_output, incident_id),
        "raw_output": raw_output,
    }


@app.get("/incidents/{incident_id}/brief")
async def get_incident_brief(incident_id: str) -> dict:
    event = _load_incident(incident_id)
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
    with _db() as connection:
        session = connection.execute("SELECT status FROM incident_sessions WHERE incident_id = ?", (incident_id,)).fetchone()
    output = _load_incident_output(incident_id) or {}
    brief = _build_mission_brief(incident_id, event, output)
    brief["session_status"] = session["status"] if session else "OPEN"
    return {"status": "success", "brief": brief}


@app.get("/incidents/{incident_id}/messages")
async def get_incident_messages(incident_id: str) -> dict:
    with _db() as connection:
        rows = connection.execute("SELECT id, sender, message, created_at FROM incident_messages WHERE incident_id = ? ORDER BY created_at ASC", (incident_id,)).fetchall()
    return {"status": "success", "messages": [dict(row) for row in rows]}


@app.post("/incidents/{incident_id}/messages")
async def add_incident_message(incident_id: str, request: SessionMessageRequest) -> dict:
    if not _load_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    _save_session_message(incident_id, request.sender, request.message.strip())
    return {"status": "success"}


@app.post("/incidents/{incident_id}/close")
async def close_incident_session(incident_id: str) -> dict:
    if not _load_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
    with _db() as connection:
        connection.execute("INSERT OR REPLACE INTO incident_sessions VALUES (?, ?, ?)", (incident_id, "CLOSED", datetime.now(timezone.utc).isoformat()))
    _save_session_message(incident_id, "System", "This response session was closed by an authorized user.")
    return {"status": "success", "incident_id": incident_id, "session_status": "CLOSED"}


@app.get("/incident/{incident_id}")
async def get_incident(incident_id: str) -> dict:
    """
    Retrieve processed incident data by ID (requires storage implementation)
    """
    # This is a placeholder - implement storage if needed
    return {
        "status": "not_implemented",
        "message": "Incident storage not yet implemented",
        "incident_id": incident_id
    }


@app.post("/test_adapter")
async def test_adapter(raw_data: Dict[str, Any]) -> dict:
    """
    Test endpoint to verify the data-parsing adapter with custom raw output.
    Useful for debugging UI integration issues.
    """
    try:
        incident_id = raw_data.get("incident_id", "TEST-001")
        command_center_data = parse_rakshak_for_nextjs_frontend(raw_data, incident_id)
        
        return {
            "status": "success",
            "data": command_center_data,
            "streamlit_data": parse_rakshak_for_ui(raw_data, incident_id),
            "note": "This is test data - no actual processing occurred"
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Adapter test failed",
                "message": str(e)
            }
        )


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RakshakOS FastAPI Backend on http://localhost:8000")
    print("📊 Data-parsing adapter ready for Next.js Frontend on http://localhost:3000")
    print("🔗 Endpoints available:")
    print("   - POST /process_incident - Process new incidents")
    print("   - POST /test_adapter - Test data transformation")
    print("   - GET / - Health check")
    uvicorn.run(app, host="0.0.0.0", port=8000)
