#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP=rg-agentready-events-prod
APP_NAME=ca-agentready-events
MODE=dry-run
IMAGE_REF=
IMAGE_PATTERN='^ghcr\.io/eric861129/agentready-events@sha256:[0-9a-f]{64}$'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      IMAGE_REF=${2:-}
      shift 2
      ;;
    --execute)
      MODE=execute
      shift
      ;;
    --dry-run)
      MODE=dry-run
      shift
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 2
      ;;
  esac
done

if [[ ! "$IMAGE_REF" =~ $IMAGE_PATTERN ]]; then
  printf 'Rollback image must be the exact public GHCR manifest digest.\n' >&2
  exit 2
fi

if [[ "$MODE" == dry-run ]]; then
  printf 'az containerapp update --resource-group %q --name %q --image %q\n' \
    "$RESOURCE_GROUP" "$APP_NAME" "$IMAGE_REF"
  printf 'Dry run only; production was not changed.\n'
  exit 0
fi

az containerapp update --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --image "$IMAGE_REF" --output none
FQDN=$(az containerapp show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --query properties.configuration.ingress.fqdn \
  -o tsv)
DIGEST=${IMAGE_REF##*@}
npm run smoke:azure -- --url "https://$FQDN" --digest "$DIGEST"
