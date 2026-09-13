from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ImpactAssessment(BaseModel):
    incident_id: str = Field(description="Unique incident ID string")
    disaster_type: str = Field(description="Type of disaster, e.g., flood, earthquake")
    location: str = Field(description="Geographic location name")
    severity: str = Field(description="Severity classification: low, moderate, high, critical")
    affected_population: int = Field(default=0, description="Integer count. Use 0 if unquantified.")
    affected_area_km2: float = Field(default=0.0, description="Float area size. Use 0.0 if unknown.")
    vulnerable_people: List[str] = Field(default_factory=list, description="List of vulnerable groups")
    priority_zones: List[str] = Field(default_factory=list, description="List of zone identifier strings")
    hazards: List[str] = Field(default_factory=list)
    infrastructure_impacts: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, description="Confidence score between 0.0 and 1.0")
    evidence_ids: List[str] = Field(default_factory=list)
    unknowns: List[str] = Field(default_factory=list, description="List of unquantified or missing fields")

class VerificationResult(BaseModel):
    incident_id: str
    verification_state: str = Field(description="VERIFIED, CORROBORATED, STALE, or UNVERIFIED")
    confidence: float = Field(default=0.0)
    corroborating_sources: List[str] = Field(default_factory=list)
    conflicting_sources: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    reason: str

class Assignment(BaseModel):
    resource_id: str
    resource_type: str
    capability: str
    destination: str
    priority: str
    eta_minutes: Optional[int] = None

class ResourceDecision(BaseModel):
    incident_id: str
    assignments: List[Assignment] = Field(default_factory=list)
    shortages: List[str] = Field(default_factory=list)
    external_assistance_required: bool = False
    rationale: str
    confidence: float = Field(default=0.0)

class ResponsePlan(BaseModel):
    incident_id: str
    plan_id: str
    version: int = 1
    objective: str
    priority: str
    assigned_resources: List[str] = Field(default_factory=list)
    route: str = Field(description="Route summary text, explicitly noting physical accessibility uncertainties")
    hazards: List[str] = Field(default_factory=list)
    contingency: str
    trigger_conditions: List[str] = Field(default_factory=list)
    external_support: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0)
    evidence_ids: List[str] = Field(default_factory=list)

class RakshakSummary(BaseModel):
    incident_id: str
    next_action: str
    status: str
    specialist_results: List[str] = Field(default_factory=list)
    plan_version: Optional[int] = None
    safety_note: str