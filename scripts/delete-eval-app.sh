#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" || "${2:-}" != "ca-agentready-events-eval" || $# -ne 2 ]]; then
  printf 'Usage: %s --confirm ca-agentready-events-eval\n' "$0" >&2
  exit 2
fi

az containerapp delete --name ca-agentready-events-eval --resource-group rg-agentready-events-prod --yes
