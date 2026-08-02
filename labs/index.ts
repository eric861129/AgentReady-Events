export const SERIES_TITLE = "網站不只給人用：30 天打造 Agent-ready 的 WebMCP 網站";

export const SERIES_TOOL_NAMES = [
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
    note.textContent = "Day 4、7、11、12 使用獨立 Lab 驗證核心概念；AgentReady Events 從 Day 13 開始整合產品 Journey。";
    const list = document.createElement("ul");
    const labs = [
      ["/labs/day-04-playwright-locator/index.html", "Day 04 · Playwright Locator Lab"],
      ["/labs/day-07-semantic-form/index.html", "Day 07 · Semantic HTML Search"],
      ["/labs/day-11-declarative-tool/index.html", "Day 11 · Declarative Tool"],
      ["/labs/day-12-imperative-lifecycle/index.html", "Day 12 · Imperative Tool Lifecycle"]
    ] as const;
    for (const [href, label] of labs) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      item.append(link);
      list.append(item);
    }
    app.replaceChildren(title, note, list);
  }
}
