from strands import Agent
from strands.models.openai import OpenAIModel

model = OpenAIModel(
    model_id="openai.gpt-oss-120b",
    bedrock_mantle_config={
        "region": "us-east-1"
    }
)

agent = Agent(
    model=model
)

response = agent(
    "You are RakshakOS, an AI agent for disaster-response operations. "
    "Reply with exactly: RAKSHAKOS STRANDS SUCCESS"
)

print(response)