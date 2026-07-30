import type { EventSummary } from "../../shared/contracts";
import type { EventActions, SearchActionResult } from "../services/event-actions";
import {
  readSearchQuery,
  respondToAgentSubmission,
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME,
  type DeclarativeSubmitEvent
} from "../webmcp/declarative";

const locationLabels = {
  taipei: "台北",
  kaohsiung: "高雄",
  online: "線上",
} as const;

const priceLabels = {
  free: "免費",
  paid: "付費",
} as const;

const levelLabels = {
  beginner: "入門",
  intermediate: "中階",
  advanced: "進階",
} as const;

function eventDateParts(value: string) {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat("zh-TW", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("zh-TW", { day: "2-digit" }).format(date),
    full: new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

function createEventCard(event: EventSummary) {
  const item = document.createElement("li");
  item.className = "event-card";
  item.dataset.eventId = event.id;

  const dateParts = eventDateParts(event.startsAt);
  const date = document.createElement("time");
  date.className = "event-date";
  date.dateTime = event.startsAt;
  date.setAttribute("aria-label", dateParts.full);
  const month = document.createElement("span");
  month.textContent = dateParts.month;
  const day = document.createElement("strong");
  day.textContent = dateParts.day;
  date.append(month, day);

  const content = document.createElement("div");
  content.className = "event-card-content";
  const badges = document.createElement("p");
  badges.className = "event-badges";
  for (const label of [
    locationLabels[event.location],
    priceLabels[event.price],
    levelLabels[event.level],
  ]) {
    const badge = document.createElement("span");
    badge.textContent = label;
    badges.append(badge);
  }
  const title = document.createElement("h3");
  title.textContent = event.title;
  const summary = document.createElement("p");
  summary.className = "event-summary";
  summary.textContent = event.summary;
  const identifier = document.createElement("code");
  identifier.className = "event-id";
  identifier.textContent = event.id;
  content.append(badges, title, summary, identifier);

  const actionsContainer = document.createElement("div");
  actionsContainer.className = "event-card-actions";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-secondary";
  button.textContent = "查看詳情";
  button.dataset.eventId = event.id;
  actionsContainer.append(button);

  item.append(date, content, actionsContainer);
  return item;
}

export function renderEventsPage(root: HTMLElement, actions: EventActions): void {
  root.innerHTML = `
    <section class="page-intro events-intro" aria-labelledby="events-title">
      <div>
        <p class="eyebrow">HUMAN-FIRST SEARCH <span>E2 UI</span><span>E4 READY</span></p>
        <h1 id="events-title">探索下一場值得參加的活動</h1>
        <p>先讓人類能找，再讓 Agent 能懂。你在畫面上使用的條件，也會成為 <code>search_events</code> 的穩定語意輸入。</p>
      </div>
      <aside class="page-intro-note">
        <strong>同一份搜尋契約</strong>
        <span>UI 表單與 WebMCP Tool 共用欄位、驗證與結果格式。</span>
      </aside>
    </section>
    <section class="filter-panel" aria-labelledby="filter-title">
      <div class="filter-heading">
        <div>
          <p class="eyebrow">SEARCH FILTERS</p>
          <h2 id="filter-title">設定活動條件</h2>
        </div>
        <p><code>search_events</code> · read-only</p>
      </div>
      <form id="event-search" toolname="${SEARCH_EVENTS_TOOL_NAME}" tooldescription="${SEARCH_EVENTS_TOOL_DESCRIPTION}" toolautosubmit>
        <div class="filter-grid">
          <div class="field field-query">
            <label for="query">關鍵字</label>
            <input id="query" name="query" type="search" maxlength="100" placeholder="例如：WebMCP、Agent、語意 HTML" toolparamdescription="公開活動標題或摘要中的關鍵字，最多 100 字。">
          </div>
          <div class="field">
            <label for="location">地點</label>
            <select id="location" name="location" toolparamdescription="活動地點代碼。"><option value="">不限地點</option><option value="taipei">台北</option><option value="kaohsiung">高雄</option><option value="online">線上</option></select>
          </div>
          <div class="field">
            <label for="price">費用</label>
            <select id="price" name="price" toolparamdescription="免費或付費。"><option value="">不限費用</option><option value="free">免費</option><option value="paid">付費</option></select>
          </div>
          <div class="field">
            <label for="level">程度</label>
            <select id="level" name="level" toolparamdescription="建議參加者程度。"><option value="">不限程度</option><option value="beginner">入門</option><option value="intermediate">中階</option><option value="advanced">進階</option></select>
          </div>
        </div>
        <div class="filter-actions">
          <button type="submit">搜尋活動</button>
          <span>按 Enter 也能搜尋；不支援 WebMCP 時仍可正常使用。</span>
        </div>
      </form>
    </section>
    <section class="results-section" aria-labelledby="results-title">
      <div class="results-heading">
        <div>
          <p class="eyebrow">PUBLIC EVENTS</p>
          <h2 id="results-title">搜尋結果</h2>
        </div>
        <p id="search-status" role="status">設定條件後，搜尋結果會顯示在這裡。</p>
      </div>
      <ol id="results" class="event-grid" aria-label="活動搜尋結果">
        <li class="empty-state" aria-hidden="true">
          <span>01</span>
          <strong>從一個清楚的需求開始</strong>
          <p>試試「台北＋免費＋入門」，找出 WebMCP 入門工作坊。</p>
        </li>
      </ol>
    </section>`;
  const form = root.querySelector<HTMLFormElement>("#event-search");
  const status = root.querySelector<HTMLElement>("#search-status");
  const list = root.querySelector<HTMLOListElement>("#results");

  const renderResult = (result: SearchActionResult, agentInvoked: boolean): void => {
    if (!("events" in result)) {
      list?.replaceChildren();
      if (status) status.textContent = result.message;
      return;
    }
    list?.replaceChildren(...result.events.map(createEventCard));
    if (result.count === 0 && list) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "目前沒有符合條件的公開活動，請調整條件再試一次。";
      list.append(empty);
    }
    if (status) status.textContent = `${agentInvoked ? "Agent 搜尋已完成 · " : ""}找到 ${result.count} 場活動`;
  };

  form?.addEventListener("submit", (rawEvent) => {
    rawEvent.preventDefault();
    form.setAttribute("aria-busy", "true");
    const submitEvent = rawEvent as Event & DeclarativeSubmitEvent;
    const query = readSearchQuery(new FormData(form));
    const result = actions.search(query, { mode: submitEvent.agentInvoked ? "agent" : "human" });
    const agentInvoked = respondToAgentSubmission(submitEvent, result);
    void result
      .then((value) => renderResult(value, agentInvoked))
      .finally(() => form.removeAttribute("aria-busy"));
  });

  list?.addEventListener("click", async (clickEvent) => {
    const button = (clickEvent.target as Element).closest<HTMLButtonElement>("button[data-event-id]");
    if (!button) return;
    location.assign(`/events/${button.dataset.eventId ?? ""}`);
  });
}
