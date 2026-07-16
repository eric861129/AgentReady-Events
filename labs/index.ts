import "./styles.css";

export const SERIES_TITLE = "網站不只給人用：30 天打造 Agent-ready 的 WebMCP 網站";
export const DAY_ONE_HEADING = "AgentReady Events：Day 1 基線";
export const DAY_ONE_STATUS = "尚未進行 Agent discovery";

export const V3_TOOL_NAMES = [
  "search_events",
  "get_event_details",
  "save_event",
  "prepare_event_registration",
  "prepare_registration_cancellation"
] as const;

const CAPABILITY_LABELS = [
  ["search_events", "搜尋活動"],
  ["get_event_details", "查看活動詳情"],
  ["save_event", "收藏活動"],
  ["prepare_event_registration", "準備報名資料"],
  ["prepare_registration_cancellation", "準備取消報名"]
] as const;

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");
  if (app) {
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "2026 iThome 鐵人賽範例專案";

    const title = document.createElement("h1");
    title.textContent = DAY_ONE_HEADING;

    const introduction = document.createElement("p");
    introduction.className = "introduction";
    introduction.textContent = "今天先確認專案能安裝、啟動、測試與建置。後續文章會從這個基線逐步加入 Browser Automation 與 WebMCP。";

    const boundary = document.createElement("section");
    boundary.className = "boundary";
    boundary.setAttribute("aria-labelledby", "day-one-boundary");

    const boundaryTitle = document.createElement("h2");
    boundaryTitle.id = "day-one-boundary";
    boundaryTitle.textContent = "今天的證據邊界";

    const status = document.createElement("p");
    status.className = "status";
    status.textContent = DAY_ONE_STATUS;

    const boundaryCopy = document.createElement("p");
    boundaryCopy.textContent = "這五個名稱先固定系列範圍；Day 1 沒有註冊 Tool，也不把一般頁面啟動寫成 Agent 呼叫成功。";

    boundary.append(boundaryTitle, status, boundaryCopy);

    const roadmap = document.createElement("section");
    roadmap.setAttribute("aria-labelledby", "capability-roadmap");

    const roadmapTitle = document.createElement("h2");
    roadmapTitle.id = "capability-roadmap";
    roadmapTitle.textContent = "後續會完成的五項網站能力";

    const capabilityList = document.createElement("ul");
    capabilityList.setAttribute("aria-label", "後續會完成的五項網站能力");

    for (const [name, label] of CAPABILITY_LABELS) {
      const item = document.createElement("li");
      const code = document.createElement("code");
      const description = document.createElement("span");
      code.textContent = name;
      description.textContent = label;
      item.append(code, description);
      capabilityList.append(item);
    }

    roadmap.append(roadmapTitle, capabilityList);

    const seriesNote = document.createElement("p");
    seriesNote.className = "series-note";
    seriesNote.textContent = `${SERIES_TITLE}｜Day 1–12 使用隔離 Lab，正式產品從 Day 13 開始。`;

    const dayTwoLink = document.createElement("a");
    dayTwoLink.className = "day-link";
    dayTwoLink.href = "/labs/day-02-actuation/index.html";
    dayTwoLink.textContent = "進入 Day 2 Actuation Failure Lab";

    app.replaceChildren(eyebrow, title, introduction, boundary, roadmap, dayTwoLink, seriesNote);
  }
}
