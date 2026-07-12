#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP=rg-agentready-events-prod
DEPLOYMENT_NAME=agentready-events-eval
MODE=preview
IMAGE_REF=
EVAL_LAB=
IMAGE_PATTERN='^ghcr\.io/eric861129/agentready-events@sha256:[0-9a-f]{64}$'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      IMAGE_REF=${2:-}
      shift 2
      ;;
    --mode)
      EVAL_LAB=${2:-}
      shift 2
      ;;
    --execute)
      MODE=execute
      shift
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 2
      ;;
  esac
done

if [[ ! "$IMAGE_REF" =~ $IMAGE_PATTERN ]]; then
  printf 'Eval image must be an immutable AgentReady Events GHCR digest.\n' >&2
  exit 2
fi

case "$EVAL_LAB" in
  security|failure:temporary|failure:expired) ;;
  *)
    printf 'Eval mode must be security, failure:temporary, or failure:expired.\n' >&2
    exit 2
    ;;
esac

ORIGIN_TRIAL_TOKEN=${WEBMCP_ORIGIN_TRIAL_TOKEN_EVAL:-}
az deployment group what-if \
  --name "$DEPLOYMENT_NAME-preview" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/eval.bicep \
  --parameters imageRef="$IMAGE_REF" mode="$EVAL_LAB" originTrialToken="$ORIGIN_TRIAL_TOKEN" \
  --no-pretty-print \
  --result-format ResourceIdOnly \
  --output none

if [[ "$MODE" == preview ]]; then
  printf 'Eval app preview passed; no Azure resource was changed.\n'
  exit 0
fi

az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/eval.bicep \
  --parameters imageRef="$IMAGE_REF" mode="$EVAL_LAB" originTrialToken="$ORIGIN_TRIAL_TOKEN" \
  --output none

FQDN=$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.fqdn.value -o tsv)
REVISION=$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.revisionName.value -o tsv)
printf 'Eval FQDN: https://%s\nEval revision: %s\n' "$FQDN" "$REVISION"
