export const CONTAINER_SMOKE_CHECKS = [
  { path: "/health/live", status: 200, contains: '"status":"ok"' },
  { path: "/events", status: 200, contains: 'id="app"' },
  { path: "/events/evt-webmcp-intro", status: 200, contains: 'id="app"' },
  { path: "/api/does-not-exist", status: 404, contains: "API_ROUTE_NOT_FOUND" }
] as const;

export function containerNameFor(commit: string): string {
  if (!/^[0-9a-f]{12,40}$/.test(commit)) {
    throw new Error("Commit must be a 12–40 character lowercase SHA.");
  }
  return `agentready-events-smoke-${commit.slice(0, 12)}`;
}
