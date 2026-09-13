import os

from strands import Agent
from strands.models.openai import OpenAIModel
from strands.hooks import BeforeToolCallEvent

MODEL_ID = os.getenv(
    "MANTLE_MODEL_ID",
    "openai.gpt-oss-120b"
)

AWS_REGION = os.getenv(
    "AWS_REGION",
    "us-east-1"
)

# 1. ZERO-LATENCY SANITIZATION HOOK
def sanitize_tool_payloads(event: BeforeToolCallEvent) -> None:
    """
    Intercepts and cleans model output before it triggers a Pydantic crash.
    This eliminates the 3-5 second retry loops entirely.
    """
    if getattr(event, "tool_use", None) is None or "input" not in event.tool_use:
        return
        
    input_params = event.tool_use["input"]
    
    for key, value in list(input_params.items()):
        # Convert 'null' to an empty list to satisfy Pydantic array schemas
        if value is None:
            input_params[key] = []
        # Convert nested tuples to standard lists
        elif isinstance(value, tuple):
            input_params[key] = list(value)

def make_model():
    # Restored your original OpenAI proxy model setup
    return OpenAIModel(
        model_id=MODEL_ID,
        bedrock_mantle_config={
            "region": AWS_REGION
        },
        
    )

def make_agent(
    system_prompt,
    tools=None,
    name="rakshak-agent"
):
    agent = Agent(
        model=make_model(),
        system_prompt=system_prompt,
        tools=tools or [],
        name=name
    )
    
    # Attach the high-speed hook to every agent
    agent.add_hook(sanitize_tool_payloads)
    
    return agent

def safe_metrics(result):
    try:
        return result.metrics.get_summary()
    except Exception:
        return {}