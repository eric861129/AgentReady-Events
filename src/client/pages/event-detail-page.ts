import type { EventDetail } from "../../shared/contracts";
import type { EventActions } from "../services/event-actions";
import type { AppState } from "../state/app-state";
import { createGetEventDetailsTool } from "../webmcp/tools/get-event-details";
import { createSaveEventTool } from "../webmcp/tools/save-event";
import type { AnyProjectTool } from "../webmcp/registry";
import { appendActivityTimeline } from "../ui/activity-timeline";

const detailLabels = {
  location: {
    taipei: "台北",
    kaohsiung: "高雄",
    online: "線上",
  },
  price: {
    free: "免費",
    paid: "付費",
  },
  level: {
    beginner: "入門",
    intermediate: "中階",
    advanced: "進階",
  },
} as const;

function formatEventDate(value: string) {
  const date = new Date(value);
  return {
    date: `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`,
    time: new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

function definitionTerm(label: string, value: string) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  wrapper.append(term, description);
  return wrapper;
}

function showDetail(root: HTMLElement, event: EventDetail, state: AppState) {
  state.selectEvent(event.id);
  const page = document.createElement("section");
  page.className = "detail-page";

  const back = document.createElement("a");
  back.className = "back-link";
  back.href = "/events";
  back.textContent = "← 回活動列表";

  const layout = document.createElement("div");
  layout.className = "detail-layout";

  const content = document.createElement("article");
  content.className = "detail-content";
  const badgeRow = document.createElement("p");
  badgeRow.className = "event-badges";
  for (const label of [
    event.state === "open" ? "開放報名" : event.state === "full" ? "名額已滿" : "報名截止",
    detailLabels.price[event.price],
    detailLabels.level[event.level],
  ]) {
    const badge = document.createElement("span");
    badge.textContent = label;
    badgeRow.append(badge);
  }
  const heading = document.createElement("h1");
  heading.textContent = event.title;
  const summary = document.createElement("p");
  summary.className = "detail-summary";
  summary.textContent = event.summary;

  const startsAt = formatEventDate(event.startsAt);
  const endsAt = formatEventDate(event.endsAt);
  const facts = document.createElement("dl");
  facts.className = "event-facts";
  facts.append(
    definitionTerm("活動日期", startsAt.date),
    definitionTerm("活動時間", `${startsAt.time} – ${endsAt.time}`),
    definitionTerm("活動地點", `${event.venue}（${detailLabels.location[event.location]}）`),
    definitionTerm("剩餘名額", `剩餘 ${event.remainingCapacity} 名`),
  );

  const actionRow = document.createElement("div");
  actionRow.className = "detail-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.id = "save-event";
  save.className = "button button-secondary";
  save.textContent = "收藏活動";
  actionRow.append(save);
  if (event.state === "open" && event.remainingCapacity > 0) {
    const registration = document.createElement("a");
    registration.className = "button button-primary";
    registration.href = `/events/${event.id}/register`;
    registration.textContent = "前往報名";
    actionRow.append(registration);
  } else {
    const unavailable = document.createElement("span");
    unavailable.className = "registration-unavailable";
    unavailable.textContent = event.state === "full" ? "目前名額已滿" : "目前無法報名";
    actionRow.append(unavailable);
  }
  const savedStatus = document.createElement("p");
  savedStatus.id = "saved-status";
  savedStatus.className = "saved-status";
  savedStatus.setAttribute("role", "status");

  content.append(badgeRow, heading, summary, facts, actionRow, savedStatus);

  const toolPanel = document.createElement("aside");
  toolPanel.className = "detail-tool-panel";
  const toolLabel = document.createElement("p");
  toolLabel.className = "eyebrow";
  toolLabel.textContent = "ROUTE-AWARE TOOL CONTEXT";
  const toolHeading = document.createElement("h2");
  toolHeading.textContent = "目前頁面公開 2 個 Tool";
  const explanation = document.createElement("p");
  explanation.textContent = "Agent 不需要猜測目前活動 ID；Tool 會從這個詳情 route 取得正確情境。";
  const tools = document.createElement("ul");
  for (const [name, risk] of [
    ["get_event_details", "READ"],
    ["save_event", "WRITE"],
  ] as const) {
    const item = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = name;
    const badge = document.createElement("span");
    badge.className = `risk ${risk === "READ" ? "risk-read" : "risk-write"}`;
    badge.textContent = risk;
    item.append(code, badge);
    tools.append(item);
  }
  const boundary = document.createElement("p");
  boundary.className = "tool-boundary";
  boundary.textContent = "收藏可復原；報名不屬於這兩個 Tool，必須進入可見表單並由人類送出。";
  toolPanel.append(toolLabel, toolHeading, explanation, tools, boundary);

  layout.append(content, toolPanel);
  page.append(back, layout);
  root.replaceChildren(page);
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
