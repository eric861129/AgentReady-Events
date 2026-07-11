import { renderEventsPage } from "./pages/events-page";

const app = document.querySelector<HTMLElement>("#app");

if (app && location.pathname === "/events") {
  renderEventsPage(app);
} else if (app) {
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
