# RakshakOS Agents — Open-Source Bedrock Edition

Clean restart using Strands Agents + Amazon Bedrock + OpenAI GPT OSS 20B.

No Anthropic API key, OpenAI API key, xAI key, or Bedrock API key is required by this project.
It uses your normal AWS credentials through Bedrock Runtime.

IMPORTANT: GPT OSS is open-source/open-weight, but Amazon Bedrock is still a paid AWS service unless your account has credits/free usage covering it.

## Setup

```powershell
cd E:\RakshakOs\Agents
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
aws sts get-caller-identity
python test_model.py
```

Default model:
`openai.gpt-oss-20b-1:0`

Default region:
`us-east-1`

If your account does not allow that model, run:

```powershell
aws bedrock list-foundation-models --region us-east-1 --by-provider OpenAI
```

Then send me the output and we will select an available open model.

## Agents

- `rakshak.py` — central orchestrator
- `situation_impact.py`
- `ground_verification.py`
- `resource_management.py`
- `response_planning.py`

Shared:
- `common.py` — Bedrock/Strands model setup
- `schemas.py` — Pydantic schemas
- `tools.py` — deterministic external data tools
- `test_model.py` — first model test
- `main.py` — end-to-end demo

Run:

```powershell
python test_model.py
python situation_impact.py
python main.py
```
