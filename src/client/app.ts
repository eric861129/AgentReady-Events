import { renderEventsPage } from "./pages/events-page";
import { renderEventDetailPage } from "./pages/event-detail-page";
import { renderRegistrationPage } from "./pages/registration-page";
import { renderRegistrationsPage } from "./pages/registrations-page";
import { eventDetailsRequest, saveEventRequest, searchEventsRequest, undoSavedEventRequest } from "./api/client";
import { createEventActions } from "./services/event-actions";
import { AppState } from "./state/app-state";
import { registerToolAdapter } from "./webmcp/adapter";
import { WebMcpRegistry } from "./webmcp/registry";
import { parseRoute } from "./router";
import { appendActivityTimeline } from "./ui/activity-timeline";
import "./styles.css";

const app = document.querySelector<HTMLElement>("#app");

const actions = createEventActions({ search: searchEventsRequest, loadDetails: eventDetailsRequest, save: saveEventRequest, undoSave: undoSavedEventRequest });
const state = new AppState();
const registry = new WebMcpRegistry(registerToolAdapter);

function updateRuntimeStatus() {
  const detected = "modelContext" in document;
  const status = document.querySelector<HTMLElement>("#webmcp-capability-status");
  if (status) {
    status.dataset.capability = detected ? "detected" : "unavailable";
    status.lastChild!.textContent = ` WebMCP capability: ${detected ? "detected" : "unavailable"}`;
  }
  for (const value of document.querySelectorAll<HTMLElement>("[data-browser-capability]")) {
    value.textContent = `Browser capability：${detected ? "detected" : "unavailable"}`;
  }
}

function updateShell(route: ReturnType<typeof parseRoute>) {
  const activeRoute = route.kind === "events" || route.kind === "event-detail" || route.kind === "registration"
    ? "events"
    : route.kind === "registrations"
      ? "registrations"
      : undefined;

  for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-nav-route]")) {
    if (link.dataset.navRoute === activeRoute) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function renderHome(root: HTMLElement) {
  root.innerHTML = `
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow"><span>Agent-ready WebMCP 實驗網站</span><span>E2 VERIFIED</span><span>E4 TEST TARGET</span></p>
        <h1 id="home-title">把下一場值得參加的活動，交給人類與 Agent 一起找到</h1>
        <p class="hero-lead">這不是只會展示成功畫面的 Demo。我們從人類可用的 UI 出發，讓網站公開五個語意清楚的 Tool，並保留報名與取消的最後決定權給你。</p>
        <div class="hero-actions">
          <a class="button button-primary" href="/events">開始探索活動</a>
          <a class="button button-secondary" href="/registrations">查看我的報名</a>
        </div>
        <ul class="proof-list" aria-label="網站能力摘要">
          <li><strong>5 個正式 Tool</strong><span>只公開 Agent 真正需要的能力</span></li>
          <li><strong>3 條可信任 Journey</strong><span>搜尋收藏、準備報名、準備取消</span></li>
          <li><strong>E0–E5 證據分級</strong><span>不把單元測試說成真實 Agent 成功</span></li>
        </ul>
      </div>
      <aside class="hero-console" aria-label="WebMCP 能力預覽">
        <div class="console-header">
          <span>WebMCP tool catalog</span>
          <span class="console-live">SOURCE CONTRACT</span>
        </div>
        <ol>
          <li><span class="tool-index">01</span><code>search_events</code><span class="risk risk-read">READ</span></li>
          <li><span class="tool-index">02</span><code>get_event_details</code><span class="risk risk-read">READ</span></li>
          <li><span class="tool-index">03</span><code>save_event</code><span class="risk risk-write">WRITE</span></li>
          <li><span class="tool-index">04</span><code>prepare_event_registration</code><span class="risk risk-stop">HUMAN</span></li>
          <li><span class="tool-index">05</span><code>prepare_registration_cancellation</code><span class="risk risk-stop">HUMAN</span></li>
        </ol>
        <p>高風險操作停在可見的確認畫面；Agent 不替你按下最後一個按鈕。</p>
        <div class="runtime-coordinate-list" aria-label="目前驗證座標">
          <p>Source contract：5 Tools</p>
          <p data-browser-capability>Browser capability：checking</p>
          <p>Agent invocation：current revision pending</p>
        </div>
      </aside>
    </section>
    <section class="journey-section" aria-labelledby="journey-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">TRUSTED JOURNEYS</p>
          <h2 id="journey-title">網站能力不是 Tool 數量，而是整條路徑能不能被信任</h2>
        </div>
        <p>UI 與 Tool 共用同一套商業邏輯。人類操作、Agent 呼叫與伺服器結果，都會留下最小且可查核的紀錄。</p>
      </div>
      <div class="journey-grid">
        <article>
          <span class="journey-number">J1</span>
          <h3>搜尋 → 詳情 → 收藏</h3>
          <p>從公開條件找到活動，用 opaque ID 進入詳情，再完成可復原的低風險收藏。</p>
          <span class="evidence-chip">E2 verified · E4 current revision pending</span>
        </article>
        <article>
          <span class="journey-number">J2</span>
          <h3>準備報名 → 人類送出</h3>
          <p>Agent 可以填好欄位，但真正建立報名的 POST 只會在人類確認後發生。</p>
          <span class="evidence-chip">Human confirmation</span>
        </article>
        <article>
          <span class="journey-number">J3</span>
          <h3>準備取消 → 後果確認</h3>
          <p>先顯示要取消哪一筆、會造成什麼影響，再把最後決定留在可存取的 dialog。</p>
          <span class="evidence-chip">Zero mutation before confirm</span>
        </article>
      </div>
    </section>`;
}

async function render() {
  if (!app) return;
  updateRuntimeStatus();
  const route = parseRoute(location.pathname);
  updateShell(route);
  if (route.kind === "event-detail") {
    const tools = await renderEventDetailPage(app, route.eventId, actions, state);
    await registry.sync(tools);
    appendActivityTimeline(app);
    return;
  }
  if (route.kind === "registration") {
    await registry.sync([]);
    await renderRegistrationPage(app, route.eventId);
    appendActivityTimeline(app);
    return;
  }
  if (route.kind === "registrations") {
    const tools = await renderRegistrationsPage(app);
    await registry.sync(tools);
    appendActivityTimeline(app);
    return;
  }
  await registry.sync([]);
  if (route.kind === "events") {
    renderEventsPage(app, actions);
    appendActivityTimeline(app);
    return;
  }
  renderHome(app);
  updateRuntimeStatus();
  appendActivityTimeline(app);
}

window.addEventListener("beforeunload", () => void registry.disposeAll(), { once: true });
window.addEventListener("activity-recorded", () => { if (app) appendActivityTimeline(app); });
void render();
