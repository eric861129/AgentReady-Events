import { LAB_EVENTS } from "../shared/events";
import { registerProjectTool } from "../shared/model-context-adapter";
import { createEventDetailsLabTool, type EventDetails } from "./tool";

const detailRegion = document.querySelector<HTMLElement>("#detail");
const resultRegion = document.querySelector<HTMLElement>("#result");
const schemaRegion = document.querySelector<HTMLElement>("#schema");
const eventId = document.querySelector<HTMLInputElement>("#event-id");

const show = (detail: EventDetails) => {
  const heading = document.createElement("h2");
  heading.textContent = detail.title;
  const summary = document.createElement("p");
  summary.textContent = detail.summary ?? "沒有公開摘要";
  detailRegion?.replaceChildren(heading, summary);
};

const tool = createEventDetailsLabTool(
  async (id) => LAB_EVENTS.find((event) => event.id === id),
  show
);

if (schemaRegion) schemaRegion.textContent = JSON.stringify(tool.inputSchema, null, 2);

document.querySelector("#execute")?.addEventListener("click", async () => {
  const started = performance.now();
  const result = await tool.execute({ event_id: eventId?.value ?? "" });
  if (resultRegion) resultRegion.textContent = JSON.stringify({ ...result, durationMs: Math.round(performance.now() - started) }, null, 2);
});

void registerProjectTool(tool).then((controller) => {
  if (controller) window.addEventListener("beforeunload", () => controller.abort(), { once: true });
});
