# Azure deployment source

- Target release: `v3-p0-release`
- Target source commit: `9897bf506986ac45c7037ec6173b7ce8745ed2b9`
- Deployment status: pending
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Target image: `ghcr.io/eric861129/agentready-events`
- Azure deployment always uses an immutable manifest digest.
- After deployment, record the workflow run, image digest, Azure revision and
  public `/health/version` response in `docs/version-evidence-ledger.md`.
