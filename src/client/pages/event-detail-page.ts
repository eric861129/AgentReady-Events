import type { EventDetail } from "../../shared/contracts";
import type { EventActions } from "../services/event-actions";
import type { AppState } from "../state/app-state";
import { createGetEventDetailsTool } from "../webmcp/tools/get-event-details";
import type { AnyProjectTool } from "../webmcp/registry";

function showDetail(root: HTMLElement, event: EventDetail, state: AppState) {
  state.selectEvent(event.id);
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

export async function renderEventDetailPage(root: HTMLElement, eventId: string, actions: EventActions, state: AppState): Promise<AnyProjectTool | undefined> {
  root.textContent = "載入活動中…";
  try {
    const event = await actions.loadDetails(eventId, { mode: "human" });
    showDetail(root, event, state);
    return createGetEventDetailsTool({
      load: (id) => actions.loadDetails(id, { mode: "agent" }),
      show: (detail) => showDetail(root, detail, state),
      getStateVersion: () => state.stateVersion()
    });
  } catch {
    root.textContent = "找不到公開活動。";
    return undefined;
  }
}
