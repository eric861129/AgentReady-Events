export const AZURE_HTTP_CHECKS = [
  { path: "/health/live", status: 200, contains: '"status":"ok"' },
  { path: "/events", status: 200, contains: 'id="app"' },
  { path: "/events/evt-webmcp-intro", status: 200, contains: 'id="app"' },
  { path: "/api/does-not-exist", status: 404, contains: "API_ROUTE_NOT_FOUND" }
] as const;

export interface AzureSmokeOptions {
  url: string;
  digest: string;
}

export function parseAzureSmokeArgs(args: readonly string[]): AzureSmokeOptions {
  let rawUrl = "";
  let digest = "";
  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const value = args[index + 1];
    if (current === "--url" && value) {
      rawUrl = value;
      index += 1;
    } else if (current === "--digest" && value) {
      digest = value;
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${current}`);
    }
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("A valid Azure Container Apps URL is required.");
  }
  if (url.protocol !== "https:") throw new Error("The Azure smoke origin must use HTTPS.");
  if (!url.hostname.endsWith(".azurecontainerapps.io")) {
    throw new Error("The smoke origin must be an Azure Container Apps FQDN.");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("The smoke URL must contain only the deployment origin.");
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(digest)) throw new Error("An immutable image digest is required.");
  return { url: url.origin, digest };
}

export function validateDeployedImage(image: string, digest: string): void {
  if (image !== `ghcr.io/eric861129/agentready-events@${digest}`) {
    throw new Error("The deployed image does not match the expected public immutable digest.");
  }
}
