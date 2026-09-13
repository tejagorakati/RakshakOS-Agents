import os

from strands import Agent
from strands.models.openai import OpenAIModel


MODEL_ID = os.getenv(
    "MANTLE_MODEL_ID",
    "openai.gpt-oss-120b",
)

REGION = os.getenv(
    "AWS_REGION",
    "us-east-1",
)


def make_model():

    return OpenAIModel(
        model_id=MODEL_ID,
        bedrock_mantle_config={
            "region": REGION
        }
    )


def make_agent(
    system_prompt,
    tools=None,
    name="rakshak-agent"
):

    return Agent(
        model=make_model(),
        system_prompt=system_prompt,
        tools=tools or [],
        name=name,
    )


def safe_metrics(result):

    try:
        return result.metrics.get_summary()
    except Exception:
        return {}