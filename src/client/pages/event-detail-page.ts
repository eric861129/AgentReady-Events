import type { EventDetail } from "../../shared/contracts";
import { eventDetailsRequest } from "../api/client";
import { registerToolAdapter } from "../webmcp/adapter";
import { createGetEventDetailsTool } from "../webmcp/tools/get-event-details";

let stateVersion = 0;

function showDetail(root: HTMLElement, event: EventDetail) {
  stateVersion += 1;
  const heading = document.createElement("h1");
  heading.textContent = event.title;
  const summary = document.createElement("p");
  summary.textContent = event.summary;
  const venue = document.createElement("p");
  venue.textContent = `${event.venue} · 剩餘 ${event.remainingCapacity} 名`;
  const back = document.createElement("a");
  back.href = "/events";
  back.textContent = "回活動列表";
  root.replaceChildren(heading, summary, venue, back);
}

export async function renderEventDetailPage(root: HTMLElement, eventId: string): Promise<void> {
  root.textContent = "載入活動中…";
  try {
    const event = await eventDetailsRequest(eventId);
    showDetail(root, event);
    const tool = createGetEventDetailsTool({ load: eventDetailsRequest, show: (detail) => showDetail(root, detail), getStateVersion: () => stateVersion });
    const controller = await registerToolAdapter(tool);
    if (controller) window.addEventListener("beforeunload", () => controller.abort(), { once: true });
  } catch {
    root.textContent = "找不到公開活動。";
  }
}
