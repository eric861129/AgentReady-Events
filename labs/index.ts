export const SERIES_TITLE = "網站不只給人用：30 天打造 Agent-ready 的 WebMCP 網站";

export const V3_TOOL_NAMES = [
  "search_events",
  "get_event_details",
  "save_event",
  "prepare_event_registration",
  "prepare_registration_cancellation"
] as const;

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");
  if (app) {
    const title = document.createElement("h1");
    title.textContent = SERIES_TITLE;
    const note = document.createElement("p");
    note.textContent = "Day 1–12 使用獨立 Labs；正式 AgentReady Events 從 Day 13 開始。";
    const list = document.createElement("ul");
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "/labs/day-02-actuation/index.html";
    link.textContent = "Day 02 · Actuation Failure Lab";
    item.append(link);
    list.append(item);
    app.replaceChildren(title, note, list);
  }
}
