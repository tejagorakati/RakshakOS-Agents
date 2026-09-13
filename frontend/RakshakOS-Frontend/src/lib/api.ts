const API_BASE = "http://localhost:8000";

export async function processIncident(payload: any) {
  const response = await fetch(
    `${API_BASE}/process_incident`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to process incident");
  }

  return response.json();
}

export async function getIncidentBrief(
  incidentId: string
) {
  const response = await fetch(
    `${API_BASE}/incidents/${incidentId}/brief`
  );

  if (!response.ok) {
    throw new Error("Failed to load incident");
  }

  return response.json();
}

export async function submitReport(
  incidentId: string,
  report: any
) {
  const response = await fetch(
    `${API_BASE}/incidents/${incidentId}/reports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit report");
  }

  return response.json();
}