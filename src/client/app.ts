import { renderEventsPage } from "./pages/events-page";
import { renderEventDetailPage } from "./pages/event-detail-page";
import { eventDetailsRequest, searchEventsRequest } from "./api/client";
import { createEventActions } from "./services/event-actions";
import { AppState } from "./state/app-state";
import { registerToolAdapter } from "./webmcp/adapter";
import { WebMcpRegistry } from "./webmcp/registry";
import { parseRoute } from "./router";

const app = document.querySelector<HTMLElement>("#app");

const actions = createEventActions({ search: searchEventsRequest, loadDetails: eventDetailsRequest });
const state = new AppState();
const registry = new WebMcpRegistry(registerToolAdapter);

async function render() {
  if (!app) return;
  const route = parseRoute(location.pathname);
  if (route.kind === "event-detail") {
    const tool = await renderEventDetailPage(app, route.eventId, actions, state);
    await registry.sync(tool ? [tool] : []);
    return;
  }
  await registry.sync([]);
  if (route.kind === "events") {
    renderEventsPage(app, actions);
    return;
  }
  const heading = document.createElement("h1");
  heading.textContent = "AgentReady Events";
  const note = document.createElement("p");
  note.textContent = "產品功能從 Day 14 開始；Day 1–12 Labs 保留在獨立路徑。";
  const nav = document.createElement("nav");
  for (const [href, label] of [["/events", "活動"], ["/registrations", "我的報名"], ["/labs/day-02-actuation/index.html", "教學 Labs"]] as const) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    nav.append(link, document.createTextNode(" "));
  }
  app.replaceChildren(heading, note, nav);
}

window.addEventListener("beforeunload", () => void registry.disposeAll(), { once: true });
void render();
