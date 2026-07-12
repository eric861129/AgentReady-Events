# GitHub Actions Azure OIDC bootstrap

The production workflow authenticates to Azure with GitHub's OpenID Connect token. It does not create or store an Azure client secret.

Run `bash scripts/bootstrap-azure-oidc.sh` once from an authenticated Azure CLI and GitHub CLI session. The idempotent script:

1. registers the `Microsoft.App` resource provider;
2. creates `rg-agentready-events-prod` in East Asia;
3. creates or reuses the Entra application and service principal;
4. assigns Contributor only at the dedicated resource group scope;
5. creates a federated credential restricted to the GitHub `production` environment;
6. writes five non-secret identifiers to GitHub environment variables.

The source repository remains private. Identifier values are not printed by the script and must not appear in public screenshots or evidence.
