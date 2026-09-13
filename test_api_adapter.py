"""
Test script to verify the API adapter transforms data correctly
"""
import json
from adapter import parse_rakshak_for_nextjs_frontend

# Sample raw output from run_rakshak()
sample_raw_output = {
    "status": "SUCCESS",
    "agent": "rakshak",
    "incident_id": "RK-TEST-001",
    "summary": {
        "incident_id": "RK-TEST-001",
        "executive_summary": "Flood emergency in Vijayawada requires immediate boat rescue operations",
        "overall_status": "RESPONSE_ACTIVE",
        "critical_alerts": [
            "14 residential units submerged",
            "Elderly residents stranded on upper floors"
        ],
        "disaster_type": "Flood Response",
        "priority": "P1"
    },
    "specialist_results": [
        {
            "agent": "situation_impact",
            "status": "SUCCESS",
            "assessment": {
                "location": "North Canal, Vijayawada",
                "severity": "CRITICAL",
                "affected_population": 56,
                "infrastructure_impacts": [
                    "Bridge 2 submerged under 1.4m water",
                    "Power substation #3 offline",
                    "Main arterial road impassable"
                ],
                "water_level": "1.8m overflow",
                "situation_summary": "Rising floodwaters threaten residential complex with elderly residents trapped"
            }
        },
        {
            "agent": "ground_verification",
            "status": "SUCCESS",
            "verification": {
                "verification_state": "VERIFIED",
                "verified_reports": 2,
                "confidence_level": "HIGH"
            }
        },
        {
            "agent": "resource_management",
            "status": "SUCCESS",
            "decision": {
                "assignments": [
                    {
                        "resource_id": "NDRF Rescue Team Alpha",
                        "type": "Water Rescue Unit",
                        "equipment": ["2 Inflatable Rescue Boats", "Life Jackets (30)", "Rope Launchers"]
                    },
                    {
                        "resource_id": "Medical Response Team 01",
                        "type": "Emergency Paramedic Unit",
                        "equipment": ["Amphibious Ambulance", "Trauma Kit"]
                    }
                ],
                "shortages": [
                    "Heavy Dewatering Pump",
                    "Additional Rescue Boats"
                ]
            }
        },
        {
            "agent": "response_planning",
            "status": "SUCCESS",
            "plan": {
                "version": 2,
                "objective": "Execute immediate water rescue for 56 trapped residents via alternative route",
                "route": "Alternative Route B via Eastern Peripheral Highway (Bridge 2 submerged)",
                "priority": "P1",
                "status": "SUCCESS"
            }
        }
    ],
    "metrics": {
        "total_tokens": 1500,
        "execution_time_ms": 2400
    }
}

def test_adapter():
    """Test the adapter transformation"""
    print("=" * 80)
    print("TESTING API ADAPTER TRANSFORMATION")
    print("=" * 80)
    
    try:
        # Run the adapter
        transformed_data = parse_rakshak_for_nextjs_frontend(
            sample_raw_output, 
            "RK-TEST-001"
        )
        
        print("\n✅ Transformation successful!\n")
        
        # Validate key fields exist
        required_fields = [
            "disasterScenarioName",
            "regionLocation",
            "operationStatus",
            "lastUpdated",
            "stats",
            "incidents",
            "teams",
            "resources",
            "zones",
            "alerts",
            "agentActivity",
            "humanAttentionItems",
            "activeState"
        ]
        
        print("📋 Validating required fields...")
        for field in required_fields:
            if field in transformed_data:
                value = transformed_data[field]
                if isinstance(value, list):
                    print(f"   ✓ {field}: {len(value)} items")
                elif isinstance(value, dict):
                    print(f"   ✓ {field}: {len(value)} keys")
                else:
                    print(f"   ✓ {field}: {value}")
            else:
                print(f"   ✗ {field}: MISSING")
        
        print("\n" + "=" * 80)
        print("DETAILED OUTPUT")
        print("=" * 80)
        print(json.dumps(transformed_data, indent=2))
        
        # Specific validations
        print("\n" + "=" * 80)
        print("CRITICAL VALIDATIONS")
        print("=" * 80)
        
        assert len(transformed_data["incidents"]) > 0, "No incidents generated"
        print("✓ Incidents generated:", len(transformed_data["incidents"]))
        
        assert len(transformed_data["teams"]) > 0, "No teams generated"
        print("✓ Teams generated:", len(transformed_data["teams"]))
        
        assert len(transformed_data["stats"]) == 4, "Expected 4 stat cards"
        print("✓ Stats cards:", len(transformed_data["stats"]))
        
        assert len(transformed_data["alerts"]) > 0, "No alerts generated"
        print("✓ Alerts generated:", len(transformed_data["alerts"]))
        
        assert len(transformed_data["humanAttentionItems"]) > 0, "No human attention items for shortages"
        print("✓ Human attention items:", len(transformed_data["humanAttentionItems"]))
        
        assert transformed_data["activeState"]["incidentCode"] == "RK-TEST-001"
        print("✓ Active state incident code matches")
        
        print("\n" + "=" * 80)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Transformation failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_adapter()
    exit(0 if success else 1)
