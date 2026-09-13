from common import make_agent

print("Testing Strands + Amazon Bedrock + OpenAI GPT OSS...")
print("Authentication uses your normal AWS credentials; no third-party API key.")

agent = make_agent(
    "You are a connectivity test agent. Reply with exactly the requested phrase.",
    name="model-test-agent",
)

result = agent("Reply with exactly: RAKSHAKOS OPEN SOURCE BEDROCK SUCCESS")
print("\nRESULT:")
print(result)
