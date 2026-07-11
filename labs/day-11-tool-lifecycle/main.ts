import { ToolRegistry } from "../shared/tool-registry";
import type { ProjectTool } from "../shared/tool-types";

let registerCalls = 0;
const registry = new ToolRegistry(async () => {
  registerCalls += 1;
  return new AbortController();
});

const detailsTool: ProjectTool<object, unknown> = {
  name: "get_event_details",
  description: "Day 11 lifecycle demonstration",
  inputSchema: {},
  execute: async () => ({ ok: true })
};

async function render() {
  const route = new URL(location.href).searchParams.get("route") === "about" ? "about" : "list";
  await registry.sync(route === "list" ? [detailsTool] : []);
  const title = document.querySelector<HTMLElement>("#route-title");
  const active = document.querySelector<HTMLElement>("#active");
  const calls = document.querySelector<HTMLElement>("#calls");
  if (title) title.textContent = route === "list" ? "活動列表" : "關於本站";
  if (active) active.textContent = `Active project Tools: ${registry.names().join(", ") || "none"}`;
  if (calls) calls.textContent = `Register calls: ${registerCalls}`;
}

document.addEventListener("click", (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-route]");
  if (!link) return;
  event.preventDefault();
  history.pushState({}, "", link.href);
  void render();
});
window.addEventListener("popstate", () => void render());
window.addEventListener("beforeunload", () => void registry.disposeAll(), { once: true });
void render();
