export type LabEvent = {
  id: string;
  title: string;
  summary: string;
  location: "taipei" | "kaohsiung" | "online";
  price: "free" | "paid";
  level: "beginner" | "intermediate" | "advanced";
};

export type LabSearchQuery = Partial<Pick<LabEvent, "location" | "price" | "level">> & {
  query?: string;
};

export const LAB_EVENTS: LabEvent[] = [
  {
    id: "evt-webmcp-intro",
    title: "WebMCP 入門工作坊",
    summary: "從語意表單開始，讓網站主動介紹能力。",
    location: "taipei",
    price: "free",
    level: "beginner"
  },
  {
    id: "evt-agent-testing",
    title: "Agent 測試實戰",
    summary: "用固定案例檢驗 Tool 選擇、參數與失敗復原。",
    location: "online",
    price: "paid",
    level: "advanced"
  },
  {
    id: "evt-semantic-html",
    title: "語意 HTML 不老派",
    summary: "用 label、name 與原生控制項建立穩定介面。",
    location: "kaohsiung",
    price: "free",
    level: "intermediate"
  }
];

export function searchLabEvents(events: LabEvent[], query: LabSearchQuery): LabEvent[] {
  const keyword = query.query?.trim().toLocaleLowerCase("zh-Hant") ?? "";
  return events.filter((event) => {
    if (keyword && !`${event.title} ${event.summary}`.toLocaleLowerCase("zh-Hant").includes(keyword)) return false;
    if (query.location && event.location !== query.location) return false;
    if (query.price && event.price !== query.price) return false;
    if (query.level && event.level !== query.level) return false;
    return true;
  });
}
