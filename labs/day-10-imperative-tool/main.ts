import { readDeclarativeSearchInput } from "../shared/declarative";
import { registerProjectTool } from "../shared/model-context-adapter";
import { executeSearchEvents, type SearchEventsResult } from "../shared/search-tool";
import { createSearchEventsLabTool } from "./tool";

const form = document.querySelector<HTMLFormElement>("#search-controls");
const resultsRegion = document.querySelector<HTMLOListElement>("#results");
const statusRegion = document.querySelector<HTMLElement>("#status");
const resultRegion = document.querySelector<HTMLElement>("#result");
const schemaRegion = document.querySelector<HTMLElement>("#schema");

function render(result: SearchEventsResult): void {
  if (!result.ok) {
    resultsRegion?.replaceChildren();
    if (statusRegion) statusRegion.textContent = `${result.code}：${result.message}`;
    return;
  }
  resultsRegion?.replaceChildren(...result.events.map((event) => {
    const item = document.createElement("li");
    item.textContent = event.title;
    return item;
  }));
  if (statusRegion) statusRegion.textContent = `找到 ${result.count} 場活動`;
}

const tool = createSearchEventsLabTool(executeSearchEvents, render);

if (schemaRegion) schemaRegion.textContent = JSON.stringify(tool.inputSchema, null, 2);

document.querySelector("#execute")?.addEventListener("click", async () => {
  if (!form) return;
  const started = performance.now();
  const result = await tool.execute(readDeclarativeSearchInput(new FormData(form)));
  if (resultRegion) {
    resultRegion.textContent = JSON.stringify({
      ...result,
      evidenceLevel: "E2",
      sourceType: "local_project_execution",
      durationMs: Math.round(performance.now() - started)
    }, null, 2);
  }
});

void registerProjectTool(tool).then((controller) => {
  if (controller) window.addEventListener("beforeunload", () => controller.abort(), { once: true });
});
