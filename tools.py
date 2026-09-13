import uuid
from datetime import datetime, timezone
from typing import Any, Dict
import requests
from strands import tool

def _now():
    return datetime.now(timezone.utc).isoformat()

@tool
def get_open_meteo_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """Get current weather. Weather is risk evidence, not proof of damage."""
    try:
        r = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,precipitation,rain,wind_speed_10m",
            },
            timeout=15,
        )
        r.raise_for_status()
        return {
            "status": "SUCCESS",
            "source": "Open-Meteo",
            "source_type": "weather",
            "observed_at": _now(),
            "observation": r.json().get("current", {}),
        }
    except Exception as e:
        return {"status": "ERROR", "source": "Open-Meteo", "error": str(e)}

@tool
def get_usgs_earthquakes(latitude: float, longitude: float, radius_km: float = 300) -> Dict[str, Any]:
    """Get recent USGS earthquake events near a coordinate."""
    try:
        r = requests.get(
            "https://earthquake.usgs.gov/fdsnws/event/1/query",
            params={
                "format": "geojson",
                "latitude": latitude,
                "longitude": longitude,
                "maxradiuskm": radius_km,
                "limit": 20,
                "orderby": "time",
            },
            timeout=15,
        )
        r.raise_for_status()
        events = []
        for f in r.json().get("features", []):
            p = f.get("properties", {})
            c = f.get("geometry", {}).get("coordinates", [])
            events.append({
                "id": f.get("id"),
                "time": p.get("time"),
                "magnitude": p.get("mag"),
                "place": p.get("place"),
                "longitude": c[0] if len(c) > 0 else None,
                "latitude": c[1] if len(c) > 1 else None,
            })
        return {"status": "SUCCESS", "source": "USGS", "events": events}
    except Exception as e:
        return {"status": "ERROR", "source": "USGS", "error": str(e)}

@tool
def route_osrm(start_lat: float, start_lon: float, end_lat: float, end_lon: float) -> Dict[str, Any]:
    """Get a development route. Route availability is NOT proof that a road is open."""
    try:
        url = f"https://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
        r = requests.get(url, params={"overview": "false"}, timeout=15)
        r.raise_for_status()
        routes = r.json().get("routes", [])
        if not routes:
            return {"status": "NO_ROUTE", "source": "OSRM"}
        return {
            "status": "SUCCESS",
            "source": "OSRM",
            "distance_km": routes[0]["distance"] / 1000,
            "duration_minutes": routes[0]["duration"] / 60,
        }
    except Exception as e:
        return {"status": "ERROR", "source": "OSRM", "error": str(e)}

def make_evidence(source, source_type, claim, observation, reliability, incident_id):
    now = _now()
    return {
        "evidence_id": f"{source}-{uuid.uuid4().hex[:10]}",
        "incident_id": incident_id,
        "source": source,
        "source_type": source_type,
        "observed_at": now,
        "received_at": now,
        "claim": claim,
        "observation": observation,
        "reliability_score": reliability,
        "verification_state": "UNVERIFIED",
        "confidence": reliability,
    }
