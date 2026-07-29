import type { EventDetail } from "../../shared/contracts";
import type { EventActions } from "../services/event-actions";
import type { AppState } from "../state/app-state";
import { createGetEventDetailsTool } from "../webmcp/tools/get-event-details";
import { createSaveEventTool } from "../webmcp/tools/save-event";
import type { AnyProjectTool } from "../webmcp/registry";
import { appendActivityTimeline } from "../ui/activity-timeline";

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
  const save = document.createElement("button");
  save.type = "button";
  save.id = "save-event";
  save.textContent = "收藏活動";
  const savedStatus = document.createElement("p");
  savedStatus.id = "saved-status";
  savedStatus.setAttribute("role", "status");
  root.replaceChildren(heading, summary, venue, save, savedStatus, back);
}

export async function renderEventDetailPage(root: HTMLElement, eventId: string, actions: EventActions, state: AppState): Promise<AnyProjectTool[]> {
  root.textContent = "載入活動中…";
  try {
    const event = await actions.loadDetails(eventId, { mode: "human" });
    const renderSaved = (result: { eventId: string; alreadySaved: boolean }) => {
      const status = root.querySelector<HTMLElement>("#saved-status");
      if (!status) return;
      status.textContent = result.alreadySaved ? "已收藏（沒有重複新增）" : "已收藏";
      const undo = document.createElement("button");
      undo.type = "button";
      undo.textContent = "Undo";
      undo.addEventListener("click", async () => {
        await actions.undoSavedEvent(result.eventId);
        status.textContent = "已移除收藏";
        undo.remove();
      });
      status.append(document.createTextNode(" "), undo);
    };
    const bindHumanSave = () => root.querySelector<HTMLButtonElement>("#save-event")?.addEventListener("click", async () => renderSaved(await actions.saveEvent(state.selectedEventId ?? "", { mode: "human" })));
    showDetail(root, event, state);
    bindHumanSave();
    const detailsTool = createGetEventDetailsTool({
      load: (id) => actions.loadDetails(id, { mode: "agent" }),
      show: (detail) => { showDetail(root, detail, state); bindHumanSave(); appendActivityTimeline(root); },
      getStateVersion: () => state.stateVersion(),
      getCurrentEventId: () => eventId
    });
    const saveTool = createSaveEventTool({ getCurrentEventId: () => state.selectedEventId, save: actions.saveEvent, show: renderSaved, getStateVersion: () => state.stateVersion() });
    return [detailsTool, saveTool];
  } catch {
    root.textContent = "找不到公開活動。";
    return [];
  }
}
