#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP=rg-agentready-events-prod
LOCATION=eastasia
APP_NAME=github-agentready-events-production
REPOSITORY=eric861129/AgentReady-Events
FEDERATED_CREDENTIAL_NAME=github-agentready-events-production

az account show --output none
gh auth status
az provider register --namespace Microsoft.App --wait
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags project=agentready-events costCenter=ithome-2026 \
  --output none

APP_ID=$(az ad app list --display-name "$APP_NAME" --query '[0].appId' -o tsv)
if [[ -z "$APP_ID" ]]; then
  APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
fi

APP_OBJECT_ID=$(az ad app show --id "$APP_ID" --query id -o tsv)
SP_OBJECT_ID=$(az ad sp list --filter "appId eq '$APP_ID'" --query '[0].id' -o tsv)
if [[ -z "$SP_OBJECT_ID" ]]; then
  SP_OBJECT_ID=$(az ad sp create --id "$APP_ID" --query id -o tsv)
fi

RG_SCOPE=$(az group show --name "$RESOURCE_GROUP" --query id -o tsv)
az role assignment create \
  --assignee-object-id "$SP_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role Contributor \
  --scope "$RG_SCOPE" \
  --output none

if ! az ad app federated-credential list \
  --id "$APP_OBJECT_ID" \
  --query "[?name=='$FEDERATED_CREDENTIAL_NAME'] | [0].name" \
  -o tsv | grep -qx "$FEDERATED_CREDENTIAL_NAME"; then
  az ad app federated-credential create \
    --id "$APP_OBJECT_ID" \
    --parameters infra/github-federated-credential.json \
    --output none
fi

TENANT_ID=$(az account show --query tenantId -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
gh api --method PUT "repos/$REPOSITORY/environments/production" --silent
gh variable set AZURE_CLIENT_ID --env production --body "$APP_ID"
gh variable set AZURE_TENANT_ID --env production --body "$TENANT_ID"
gh variable set AZURE_SUBSCRIPTION_ID --env production --body "$SUBSCRIPTION_ID"
gh variable set AZURE_RESOURCE_GROUP --env production --body "$RESOURCE_GROUP"
gh variable set AZURE_LOCATION --env production --body "$LOCATION"

printf 'Azure OIDC bootstrap completed without client credentials.\n'
