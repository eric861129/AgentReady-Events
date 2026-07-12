# Azure cost boundary

AgentReady Events uses Azure Container Apps Consumption with one production app that can scale to zero. The checked-in infrastructure fixes the app at 0.25 vCPU, 0.5 GiB memory, zero minimum replicas, and one maximum replica.

The resource group intentionally excludes Azure Container Registry, Log Analytics, virtual networks, databases, Dapr, dedicated workload profiles, custom domains, and fixed non-zero replicas. The image is a public immutable GHCR digest.

Before deployment, automation reads the subscription billing currency. The approved monthly budget is USD 1 for USD subscriptions or TWD 30 for TWD subscriptions. Any other currency stops deployment instead of guessing an exchange rate. Alerts fire at 50%, 80%, and 100% of actual spend and are filtered to `rg-agentready-events-prod`.

The Consumption free grant reduces expected cost but is not treated as a guarantee of a zero invoice. Azure usage and the budget remain the source of truth.
