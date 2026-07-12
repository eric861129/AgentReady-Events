# Ephemeral Azure Eval app

`ca-agentready-events-eval` is the only permitted ephemeral Eval app. It reuses the production Container Apps Environment and the exact production image digest, while selecting one startup-only `EVAL_LAB` mode: `security`, `failure:temporary`, or `failure:expired`.

Preview is the default:

```bash
bash scripts/deploy-eval-app.sh --image "ghcr.io/eric861129/agentready-events@sha256:<digest>" --mode security
```

Add `--execute` only for the locked Azure Eval cases. The optional Eval Origin Trial token comes from `WEBMCP_ORIGIN_TRIAL_TOKEN_EVAL` and is never committed. The app retains the same HTTPS FQDN while modes are updated.

After all targeted cases, delete only the ephemeral app:

```bash
bash scripts/delete-eval-app.sh --confirm ca-agentready-events-eval
```

The cleanup script cannot delete the resource group or production app.
