# Immutable Azure rollback

Rollback accepts only the public AgentReady Events GHCR image in `@sha256:<64 lowercase hex>` form. Tags and `latest` are rejected.

Preview the exact scoped update without changing production:

```bash
bash scripts/rollback-azure.sh --image "ghcr.io/eric861129/agentready-events@sha256:<digest>" --dry-run
```

After selecting a previously verified digest, add `--execute`. The script updates only `ca-agentready-events` in `rg-agentready-events-prod`, resolves its HTTPS FQDN, and runs the complete Azure smoke suite. It never deletes the app, environment, or resource group.

Using the current successful digest for a rehearsal validates command construction without creating another revision. Evidence must label that result `dry-run-validated`, not `rollback-executed`.
