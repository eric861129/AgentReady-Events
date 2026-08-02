# Azure deployment source

- Current release: fixed 20-case validation revision
- Source commit: `4b1324f46255ddf5f80628c84a564d37fa6addb3`
- Deployment status: E3 verified; current-revision Inspector rerun pending; no new E4 or E5 claim
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Image: `ghcr.io/eric861129/agentready-events@sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052`
- Azure revision: `ca-agentready-events--0000007`
- Workflow run: `30733952974`
- Public URL: `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`
- Public `/health/version`: commit and revision match this record.
- Deployment smoke completes all three Journeys, verifies session isolation and rejects forged Agent finalization.
- The controlled current-session expiry fixture is enabled for `RECOVERY-02` on this validation revision only.
- No Inspector trace has yet been saved for this exact revision; historical E4 traces are not transferred to it.
