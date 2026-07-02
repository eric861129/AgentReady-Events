import type {
  GetEventDetailsResponse,
  SearchEventsQuery,
  SearchEventsResponse,
  ToolResult
} from "../../../packages/contracts/src/index";
import { fetchEventDetails, fetchEvents } from "./api";
import {
  GET_EVENT_DETAILS_TOOL_NAME,
  createGetEventDetailsTool
} from "./tools/getEventDetailsTool";
import { createWebMcpAdapter } from "./webmcpAdapter";
import {
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME,
  buildDeclarativeFieldSchema,
  detectWebMcpSupport
} from "./webmcp";
import "./styles.css";

type DeclarativeSubmitEvent = SubmitEvent & {
  agentInvoked?: boolean;
  respondWith?: (response: Promise<ToolResult<SearchEventsResponse>>) => void;
};

type ToolLifecycleEvent = Event & {
  toolName?: string;
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("找不到 #app 掛載點。");
}

const root = app;

const state = {
  events: undefined as SearchEventsResponse | undefined,
  selectedEvent: undefined as GetEventDetailsResponse | undefined,
  query: {} as SearchEventsQuery,
  loading: false,
  detailLoading: false,
  detailError: "",
  eventDetailsToolStatus: "pending" as "pending" | "registered" | "unsupported" | "failed",
  message: "準備好探索近期開發者活動。",
  error: ""
};

const webMcpAdapter = createWebMcpAdapter();
let eventDetailsRegistration: { dispose(): void } | undefined;
let eventDetailsRegistrationAttempted = false;

render();
void runSearch(readQueryFromUrl(), { updateUrl: false });

function render(): void {
  const route = window.location.hash === "#/diagnostics" ? "diagnostics" : "home";
  root.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#/" aria-label="AgentReady Events 首頁">
        <span class="brand-mark" aria-hidden="true">A</span>
        <span>AgentReady Events</span>
      </a>
      <nav class="site-nav" aria-label="主要導覽">
        <a href="#/" ${route === "home" ? "aria-current=\"page\"" : ""}>活動探索</a>
        <a href="#featured">精選活動</a>
        <a href="#saved">我的收藏</a>
        <a href="#/diagnostics" ${route === "diagnostics" ? "aria-current=\"page\"" : ""}>WebMCP 狀態</a>
      </nav>
    </header>
    <main>
      ${route === "diagnostics" ? diagnosticsTemplate() : homeTemplate()}
    </main>
  `;

  bindHandlers();
}

function homeTemplate(): string {
  return `
    <section class="hero">
      <div class="hero-copy">
        <h1>找下一場值得參加的開發者活動</h1>
        <p>搜尋前端、後端、AI、DevOps、安全與資料主題活動。Day 7 先讓表單對人類可用，再準備讓 WebMCP 讀懂這個既有流程。</p>
        ${searchFormTemplate()}
      </div>
      <figure class="hero-media">
        <img src="/assets/hero-events.png" alt="開發者活動會場與交流場景" />
      </figure>
    </section>
    <section class="status-row" aria-live="polite">
      <div>
        <strong>${escapeHtml(state.loading ? "搜尋中" : "目前狀態")}</strong>
        <span>${escapeHtml(state.error || state.message)}</span>
      </div>
      <a href="#/diagnostics">查看 WebMCP 診斷</a>
    </section>
    <section id="events" class="content-grid" aria-labelledby="events-title">
      <div class="section-heading">
        <h2 id="events-title">活動搜尋結果</h2>
        <p>${state.events ? `找到 ${state.events.total} 場活動，顯示 ${state.events.returned} 場。` : "載入近期活動中。"}</p>
      </div>
      <div class="event-list">
        ${eventCardsTemplate(state.events?.events ?? [])}
      </div>
    </section>
    ${eventDetailTemplate()}
    <section id="featured" class="featured-band" aria-labelledby="featured-title">
      <div class="section-heading">
        <h2 id="featured-title">精選活動</h2>
        <p>保留給文章截圖的固定資料，涵蓋搜尋前、搜尋後與篩選狀態。</p>
      </div>
      <div class="featured-list">
        ${eventCardsTemplate((state.events?.events ?? []).filter((event) => event.featured).slice(0, 4))}
      </div>
    </section>
    <section id="saved" class="saved-note" aria-labelledby="saved-title">
      <h2 id="saved-title">我的收藏</h2>
      <p>收藏與登入流程保留給後續週次；本週只建立入口與型別擴充點，不把收藏寫入做成 WebMCP Tool。</p>
    </section>
  `;
}

function searchFormTemplate(): string {
  const query = state.query;

  return `
    <form id="search-form" class="search-panel" action="/api/events" method="get"
      toolname="${SEARCH_EVENTS_TOOL_NAME}"
      tooldescription="${SEARCH_EVENTS_TOOL_DESCRIPTION}"
      toolautosubmit>
      <div class="field field-wide">
        <label for="query">關鍵字</label>
        <input id="query" name="query" type="search" value="${escapeAttribute(query.query ?? "")}"
          placeholder="例如：前端、AI、台北"
          toolparamdescription="活動標題、摘要、場地或主題關鍵字。" />
      </div>
      <div class="field">
        <label for="start_date">開始日期</label>
        <input id="start_date" name="start_date" type="date" value="${escapeAttribute(query.start_date ?? "")}"
          toolparamdescription="活動開始日期下限，格式為 YYYY-MM-DD。" />
      </div>
      <div class="field">
        <label for="end_date">結束日期</label>
        <input id="end_date" name="end_date" type="date" value="${escapeAttribute(query.end_date ?? "")}"
          toolparamdescription="活動開始日期上限，格式為 YYYY-MM-DD。" />
      </div>
      ${selectTemplate("location", "地點", query.location, [
        ["all", "所有地點"],
        ["taipei", "台北"],
        ["new_taipei", "新北"],
        ["taichung", "台中"],
        ["kaohsiung", "高雄"],
        ["online", "線上"]
      ], "活動舉辦地點。")}
      ${selectTemplate("price", "費用", query.price, [
        ["all", "不限費用"],
        ["free", "免費"],
        ["paid", "付費"]
      ], "活動費用類型。")}
      ${selectTemplate("category", "主題", query.category, [
        ["all", "所有主題"],
        ["frontend", "Frontend"],
        ["backend", "Backend"],
        ["ai", "AI"],
        ["devops", "DevOps"],
        ["security", "Security"],
        ["data", "Data"]
      ], "活動技術主題分類。")}
      ${selectTemplate("level", "難度", query.level, [
        ["all", "不限難度"],
        ["beginner", "入門"],
        ["intermediate", "中階"],
        ["advanced", "進階"]
      ], "活動適合的技術程度。")}
      <button class="primary-action" type="submit">搜尋活動</button>
    </form>
  `;
}

function diagnosticsTemplate(): string {
  const support = detectWebMcpSupport();
  const form = document.createElement("form");
  form.innerHTML = searchFormTemplate();
  const schema = buildDeclarativeFieldSchema(form.querySelector("form") ?? form);

  return `
    <section class="diagnostics">
      <div class="section-heading">
        <h1>WebMCP 狀態</h1>
        <p>Day 8 開始讓既有搜尋表單成為 Declarative Tool，先固定 Tool 名稱與用途描述。</p>
      </div>
      <div class="diagnostics-grid">
        ${diagnosticCard("Secure Context", support.secureContext)}
        ${diagnosticCard("document.modelContext", support.documentModelContext)}
        ${diagnosticCard("registerTool()", support.registerTool)}
        ${diagnosticCard("getTools()", support.getTools)}
        ${diagnosticCard("executeTool()", support.executeTool)}
      </div>
      <section class="schema-view" aria-labelledby="tool-title">
        <h2 id="tool-title">Declarative Tool Snapshot</h2>
        <dl>
          <div><dt>toolname</dt><dd>${SEARCH_EVENTS_TOOL_NAME}</dd></div>
          <div><dt>tooldescription</dt><dd>${SEARCH_EVENTS_TOOL_DESCRIPTION}</dd></div>
          <div><dt>toolautosubmit</dt><dd>enabled</dd></div>
          <div><dt>imperative tool</dt><dd>${GET_EVENT_DETAILS_TOOL_NAME}: ${state.eventDetailsToolStatus}</dd></div>
        </dl>
        <h2>Field Schema Snapshot</h2>
        <pre>${escapeHtml(JSON.stringify(schema, null, 2))}</pre>
      </section>
    </section>
  `;
}

function eventDetailTemplate(): string {
  if (state.detailLoading) {
    return `
      <section class="detail-panel" aria-live="polite" aria-labelledby="event-detail-title">
        <h2 id="event-detail-title">活動詳情</h2>
        <p>正在載入活動詳情。</p>
      </section>
    `;
  }

  if (state.detailError) {
    return `
      <section class="detail-panel is-error" aria-live="polite" aria-labelledby="event-detail-title">
        <h2 id="event-detail-title">活動詳情</h2>
        <p>${escapeHtml(state.detailError)}</p>
      </section>
    `;
  }

  if (!state.selectedEvent) {
    return `
      <section class="detail-panel" aria-live="polite" aria-labelledby="event-detail-title">
        <h2 id="event-detail-title">活動詳情</h2>
        <p>從活動列表選一場活動，或由 <code>${GET_EVENT_DETAILS_TOOL_NAME}</code> 更新這裡。</p>
      </section>
    `;
  }

  const event = state.selectedEvent;
  return `
    <section class="detail-panel" aria-live="polite" aria-labelledby="event-detail-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Event ID：${escapeHtml(event.id)}</p>
          <h2 id="event-detail-title">${escapeHtml(event.title)}</h2>
        </div>
        <span class="detail-state">${event.registrationState === "open" ? "報名開放中" : "報名已截止"}</span>
      </div>
      <p>${escapeHtml(event.summary)}</p>
      <dl class="detail-facts">
        <div><dt>時間</dt><dd>${formatDateTime(event.startsAt)} - ${formatDateTime(event.endsAt)}</dd></div>
        <div><dt>地點</dt><dd>${escapeHtml(event.locationLabel)}，${escapeHtml(event.venue)}</dd></div>
        <div><dt>費用</dt><dd>${escapeHtml(event.priceLabel)}</dd></div>
        <div><dt>難度</dt><dd>${escapeHtml(event.levelLabel)}</dd></div>
        <div><dt>剩餘名額</dt><dd>${event.remainingCapacity} 位</dd></div>
        <div><dt>報名期限</dt><dd>${formatDateTime(event.registrationDeadline)}</dd></div>
      </dl>
    </section>
  `;
}

function eventCardsTemplate(events: SearchEventsResponse["events"]): string {
  if (state.loading && events.length === 0) {
    return `<p class="empty-state">正在載入活動。</p>`;
  }

  if (events.length === 0) {
    return `<p class="empty-state">目前沒有符合條件的活動，請調整搜尋條件。</p>`;
  }

  return events.map((event) => `
    <article class="event-card">
      <div class="event-meta">
        <span>${escapeHtml(event.categoryLabel)}</span>
        <span>${escapeHtml(event.levelLabel)}</span>
        <span>${escapeHtml(event.priceLabel)}</span>
      </div>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.summary)}</p>
      <dl class="event-facts">
        <div><dt>時間</dt><dd>${formatDateTime(event.startsAt)}</dd></div>
        <div><dt>地點</dt><dd>${escapeHtml(event.locationLabel)}・${escapeHtml(event.venue)}</dd></div>
        <div><dt>名額</dt><dd>剩餘 ${event.remainingCapacity} 位</dd></div>
      </dl>
      <div class="event-actions">
        <button type="button" class="detail-action" data-event-detail-id="${escapeAttribute(event.id)}" aria-label="查看 ${escapeAttribute(event.title)}">查看詳情</button>
        <button type="button" disabled>登入後收藏</button>
      </div>
    </article>
  `).join("");
}

function selectTemplate(
  name: keyof SearchEventsQuery,
  label: string,
  selected: string | undefined,
  options: Array<[string, string]>,
  description: string
): string {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" toolparamdescription="${description}">
        ${options.map(([value, text]) => `
          <option value="${value}" ${selected === value ? "selected" : ""}>${text}</option>
        `).join("")}
      </select>
    </div>
  `;
}

function bindHandlers(): void {
  window.addEventListener("hashchange", render, { once: true });
  void ensureEventDetailsToolRegistered();

  const form = document.querySelector<HTMLFormElement>("#search-form");
  if (form) {
    form.addEventListener("submit", handleSearchSubmit);
    form.addEventListener("toolactivated", handleToolActivated);
    form.addEventListener("toolcancel", handleToolCancel);
  }

  document.querySelectorAll<HTMLButtonElement>("[data-event-detail-id]").forEach((button) => {
    button.addEventListener("click", handleEventDetailClick);
  });
}

function handleEventDetailClick(event: MouseEvent): void {
  const button = event.currentTarget as HTMLButtonElement;
  const eventId = button.dataset.eventDetailId;
  if (!eventId) {
    return;
  }

  void openEventDetails(eventId).catch(() => undefined);
}

function handleSearchSubmit(event: SubmitEvent): void {
  event.preventDefault();
  const declarativeEvent = event as DeclarativeSubmitEvent;
  const form = event.currentTarget as HTMLFormElement;
  const query = readQueryFromForm(form);

  const task = runSearch(query, { updateUrl: true, agentInvoked: Boolean(declarativeEvent.agentInvoked) })
    .then((response) => ({
      ok: true,
      message: `已更新活動列表，共找到 ${response.total} 場活動。`,
      data: response
    }))
    .catch((error: unknown) => ({
      ok: false,
      message: error instanceof Error ? error.message : "搜尋活動時發生錯誤。"
    }));

  declarativeEvent.respondWith?.(task);
}

function handleToolActivated(event: Event): void {
  const toolEvent = event as ToolLifecycleEvent;
  state.message = `${toolEvent.toolName ?? SEARCH_EVENTS_TOOL_NAME} 已啟動，正在更新搜尋條件。`;
  state.error = "";
  render();
}

function handleToolCancel(): void {
  state.message = "Agent 已取消本次搜尋，畫面保留目前結果。";
  state.error = "";
  render();
}

async function runSearch(
  query: SearchEventsQuery,
  options: { updateUrl: boolean; agentInvoked?: boolean } = { updateUrl: false }
): Promise<SearchEventsResponse> {
  state.loading = true;
  state.query = query;
  state.error = "";
  state.message = options.agentInvoked ? "Agent 正在協助搜尋活動。" : "正在搜尋活動。";
  render();

  try {
    const response = await fetchEvents(query);
    state.events = response;
    state.message = `已找到 ${response.total} 場活動。`;
    if (options.updateUrl) {
      updateUrl(query);
    }
    return response;
  } catch (error) {
    state.error = error instanceof Error ? error.message : "搜尋活動時發生錯誤。";
    throw error;
  } finally {
    state.loading = false;
    render();
  }
}

async function openEventDetails(eventId: string): Promise<GetEventDetailsResponse> {
  state.detailLoading = true;
  state.detailError = "";
  state.message = `正在取得 ${eventId} 的活動詳情。`;
  render();

  try {
    const detail = await fetchEventDetails(eventId);
    showEventDetails(detail);
    return detail;
  } catch (error) {
    state.detailError = error instanceof Error ? error.message : "取得活動詳情時發生錯誤。";
    state.message = state.detailError;
    throw error;
  } finally {
    state.detailLoading = false;
    render();
  }
}

function showEventDetails(detail: GetEventDetailsResponse): void {
  state.selectedEvent = detail;
  state.detailError = "";
  state.message = `已更新 ${detail.title} 的活動詳情。`;
  render();
}

async function ensureEventDetailsToolRegistered(): Promise<void> {
  if (eventDetailsRegistrationAttempted || eventDetailsRegistration) {
    return;
  }

  eventDetailsRegistrationAttempted = true;

  if (!webMcpAdapter.isSupported()) {
    state.eventDetailsToolStatus = "unsupported";
    render();
    return;
  }

  const tool = createGetEventDetailsTool({
    loadEventDetails: fetchEventDetails,
    showEventDetails
  });

  try {
    eventDetailsRegistration = await webMcpAdapter.registerTool(tool);
    state.eventDetailsToolStatus = "registered";
    render();
  } catch {
    state.eventDetailsToolStatus = "failed";
    render();
  }
}

function readQueryFromForm(form: HTMLFormElement): SearchEventsQuery {
  const formData = new FormData(form);
  return compactQuery({
    query: formData.get("query")?.toString(),
    start_date: formData.get("start_date")?.toString(),
    end_date: formData.get("end_date")?.toString(),
    location: formData.get("location")?.toString() as SearchEventsQuery["location"],
    price: formData.get("price")?.toString() as SearchEventsQuery["price"],
    category: formData.get("category")?.toString() as SearchEventsQuery["category"],
    level: formData.get("level")?.toString() as SearchEventsQuery["level"]
  });
}

function readQueryFromUrl(): SearchEventsQuery {
  const params = new URLSearchParams(window.location.search);
  return compactQuery({
    query: params.get("query") ?? undefined,
    start_date: params.get("start_date") ?? undefined,
    end_date: params.get("end_date") ?? undefined,
    location: params.get("location") as SearchEventsQuery["location"] | undefined,
    price: params.get("price") as SearchEventsQuery["price"] | undefined,
    category: params.get("category") as SearchEventsQuery["category"] | undefined,
    level: params.get("level") as SearchEventsQuery["level"] | undefined
  });
}

function compactQuery(query: SearchEventsQuery): SearchEventsQuery {
  return Object.fromEntries(
    Object.entries(query)
      .map(([key, value]) => [key, value?.trim()])
      .filter(([, value]) => value && value !== "all")
  ) as SearchEventsQuery;
}

function updateUrl(query: SearchEventsQuery): void {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const nextUrl = params.toString() ? `?${params.toString()}${window.location.hash || "#/"}` : `${window.location.pathname}${window.location.hash || "#/"}`;
  window.history.replaceState(null, "", nextUrl);
}

function diagnosticCard(label: string, enabled: boolean): string {
  return `
    <article class="diagnostic-card ${enabled ? "is-ok" : "is-muted"}">
      <span>${enabled ? "可用" : "未偵測"}</span>
      <h2>${label}</h2>
    </article>
  `;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
