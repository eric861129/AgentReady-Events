import {
  executeProjectTool,
  getProjectModelContextCapabilities,
  getProjectTools,
  registerProjectTool,
  subscribeProjectToolChanges,
  type ProjectDiscoveredTool
} from "../shared/model-context-adapter";
import { ToolRegistry } from "../shared/tool-registry";
import type { ProjectTool } from "../shared/tool-types";

let registerCalls = 0;
let discoveredTools: ProjectDiscoveredTool[] = [];

const registry = new ToolRegistry(async (tool) => {
  const controller = await registerProjectTool(tool);
  if (controller) registerCalls += 1;
  return controller;
});

const detailsTool: ProjectTool<Record<string, unknown>, unknown> = {
  name: "get_event_details",
  description: "依不透明活動 ID 取得目前公開活動的詳細資訊。",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["event_id"],
    properties: { event_id: { type: "string", description: "活動搜尋結果提供的不透明 ID。" } }
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: async (input) => ({ ok: true, eventId: input.event_id ?? null })
};

async function refreshDiscovery(): Promise<void> {
  discoveredTools = await getProjectTools();
  const discovered = document.querySelector<HTMLElement>("#discovered");
  if (discovered) discovered.textContent = `Discovered Tools: ${discoveredTools.map((tool) => tool.name).join(", ") || "none"}`;
}

async function render(): Promise<void> {
  const route = new URL(location.href).searchParams.get("route") === "about" ? "about" : "list";
  await registry.sync(route === "list" ? [detailsTool] : []);
  const title = document.querySelector<HTMLElement>("#route-title");
  const active = document.querySelector<HTMLElement>("#active");
  const calls = document.querySelector<HTMLElement>("#calls");
  const runtime = document.querySelector<HTMLElement>("#runtime");
  const capabilities = getProjectModelContextCapabilities();
  if (title) title.textContent = route === "list" ? "活動列表" : "關於本站";
  if (active) active.textContent = `Active project Tools: ${registry.names().join(", ") || "none"}`;
  if (calls) calls.textContent = `Register calls: ${registerCalls}`;
  if (runtime) runtime.textContent = `Runtime surface — register: ${capabilities.registration}, getTools: ${capabilities.discovery}, executeTool: ${capabilities.execution}`;
  await refreshDiscovery();
}

document.addEventListener("click", (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-route]");
  if (!link) return;
  event.preventDefault();
  history.pushState({}, "", link.href);
  void render();
});

document.querySelector("#execute-discovered")?.addEventListener("click", async () => {
  const output = document.querySelector<HTMLElement>("#execution-result");
  const tool = discoveredTools.find((candidate) => candidate.name === detailsTool.name);
  if (!tool) {
    if (output) output.textContent = "目前沒有可執行的已發現 Tool。";
    return;
  }
  const controller = new AbortController();
  const result = await executeProjectTool(tool, JSON.stringify({ event_id: "evt-webmcp-intro" }), { signal: controller.signal });
  if (output) output.textContent = JSON.stringify({ evidenceLevel: "E2", result }, null, 2);
});

const unsubscribe = subscribeProjectToolChanges(() => void refreshDiscovery());
window.addEventListener("popstate", () => void render());
window.addEventListener("beforeunload", () => {
  unsubscribe();
  void registry.disposeAll();
}, { once: true });
void render();
