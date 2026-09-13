from rakshak import run_rakshak

if __name__ == "__main__":
    event = {
        "event_type": "INCIDENT_CREATED",
        "incident_id": "RK-TEST-001",
        "disaster_type": "flood",
        "location": "Vijayawada",
        "latitude": 16.52,
        "longitude": 80.64,
        "start_lat": 16.52,
        "start_lon": 80.64,
        "end_lat": 16.53,
        "end_lon": 80.65,
        "priority": "P1",
        "requirements": ["boat", "medical transport"],
        "reports": [
            {"source_type": "citizen", "claim": "water entered houses and an elderly person needs help", "stale": False},
            {"source_type": "rescue_team", "claim": "flooded road near temple", "stale": False},
        ],
    }
    print(run_rakshak(event))
