import type { EventActions, SearchActionResult } from "../services/event-actions";
import {
  readSearchQuery,
  respondToAgentSubmission,
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME,
  type DeclarativeSubmitEvent
} from "../webmcp/declarative";

export function renderEventsPage(root: HTMLElement, actions: EventActions): void {
  root.innerHTML = `
    <h1>活動</h1>
    <form id="event-search" toolname="${SEARCH_EVENTS_TOOL_NAME}" tooldescription="${SEARCH_EVENTS_TOOL_DESCRIPTION}" toolautosubmit>
      <label for="query">關鍵字</label><input id="query" name="query" maxlength="100" toolparamdescription="公開活動標題或摘要中的關鍵字，最多 100 字。">
      <label for="location">地點</label><select id="location" name="location" toolparamdescription="活動地點代碼。"><option value="">不限</option><option value="taipei">台北</option><option value="kaohsiung">高雄</option><option value="online">線上</option></select>
      <label for="price">費用</label><select id="price" name="price" toolparamdescription="免費或付費。"><option value="">不限</option><option value="free">免費</option><option value="paid">付費</option></select>
      <label for="level">程度</label><select id="level" name="level" toolparamdescription="建議參加者程度。"><option value="">不限</option><option value="beginner">入門</option><option value="intermediate">中階</option><option value="advanced">進階</option></select>
      <button type="submit">搜尋活動</button>
    </form>
    <p id="search-status" role="status">尚未搜尋</p>
    <ol id="results" aria-label="活動搜尋結果"></ol>`;
  const form = root.querySelector<HTMLFormElement>("#event-search");
  const status = root.querySelector<HTMLElement>("#search-status");
  const list = root.querySelector<HTMLOListElement>("#results");

  const renderResult = (result: SearchActionResult, agentInvoked: boolean): void => {
    if (!("events" in result)) {
      list?.replaceChildren();
      if (status) status.textContent = result.message;
      return;
    }
    list?.replaceChildren(...result.events.map((event) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = event.title;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "查看詳情";
      button.dataset.eventId = event.id;
      item.append(title, document.createTextNode(` — ${event.summary} `), button);
      return item;
    }));
    if (status) status.textContent = `${agentInvoked ? "Agent 搜尋已完成：" : ""}找到 ${result.count} 場活動`;
  };

  form?.addEventListener("submit", (rawEvent) => {
    rawEvent.preventDefault();
    const submitEvent = rawEvent as Event & DeclarativeSubmitEvent;
    const query = readSearchQuery(new FormData(form));
    const result = actions.search(query, { mode: submitEvent.agentInvoked ? "agent" : "human" });
    const agentInvoked = respondToAgentSubmission(submitEvent, result);
    void result.then((value) => renderResult(value, agentInvoked));
  });

  list?.addEventListener("click", async (clickEvent) => {
    const button = (clickEvent.target as Element).closest<HTMLButtonElement>("button[data-event-id]");
    if (!button) return;
    location.assign(`/events/${button.dataset.eventId ?? ""}`);
  });
}
