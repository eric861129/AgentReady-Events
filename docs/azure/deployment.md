# Azure production deployment

Production is deployed to `ca-agentready-events` in the dedicated `rg-agentready-events-prod` resource group. The primary region is East Asia; Japan East is used only after a recorded capacity failure.

The manually triggered GitHub Actions workflow builds and verifies the requested commit, publishes a SHA tag, resolves its manifest digest, authenticates to Azure through OIDC, runs a restricted Bicep what-if, and deploys only `ghcr.io/eric861129/agentready-events@sha256:<digest>`.

`enable_evaluation_fixtures` defaults to `false`. Turn it on only for the fixed validation revision that runs `RECOVERY-02`; it exposes the CSRF-protected endpoint that expires only the caller's current Demo session. A normal production deployment must leave the switch off.

`npm run smoke:azure -- --url "https://<fqdn>" --digest "sha256:<digest>"` verifies the deployed image configuration, bounded cold start, HTTP routes, two-session isolation, forged Agent finalization rejection, and all three browser Journeys. It writes a sanitized result to `evidence/latest/azure-smoke.json`.

The Container Apps environment omits `appLogsConfiguration`, which is Azure's ARM representation for no configured log destination. No Log Analytics workspace is created.
