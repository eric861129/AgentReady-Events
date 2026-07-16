export {};

type SearchEvent = {
  id: string;
  title: string;
  summary: string;
};

type SearchResult = {
  ok: true;
  count: number;
  events: SearchEvent[];
};

type AgentSubmitEvent = Event & {
  agentInvoked?: boolean;
  respondWith?: (result: Promise<SearchResult>) => void;
};

const EVENTS: SearchEvent[] = [
  {
    id: "evt-webmcp-intro",
    title: "WebMCP 入門工作坊",
    summary: "從語意表單開始，讓網站主動介紹能力。"
  },
  {
    id: "evt-browser-testing",
    title: "Browser Automation 測試實戰",
    summary: "使用 Locator 重播網站操作流程。"
  }
];

const params = new URLSearchParams(location.search);
const renamed = params.get("variant") === "renamed";
const form = document.querySelector<HTMLFormElement>("#search-form");
const button = form?.querySelector<HTMLButtonElement>("button");
const status = document.querySelector<HTMLElement>("#status");
const results = document.querySelector<HTMLOListElement>("#results");
const variantName = document.querySelector<HTMLElement>("#variant-name");
const variantDetail = document.querySelector<HTMLElement>("#variant-detail");

if (button) {
  button.textContent = renamed ? "探索場次" : "搜尋活動";
  if (renamed) {
    button.dataset.action = "explore-events";
    const wrapper = document.createElement("div");
    wrapper.className = "action-shell";
    button.replaceWith(wrapper);
    wrapper.append(button);
  }
}

if (renamed) {
  if (variantName) variantName.textContent = "改版後介面";
  if (variantDetail) variantDetail.textContent = "按鈕名稱：探索場次；新增 action-shell 包裝";
}

function executeSearchEvents(keyword: string): Promise<SearchResult> {
  const normalized = keyword.trim().toLocaleLowerCase("zh-Hant");
  const events = EVENTS.filter((event) =>
    `${event.title} ${event.summary}`.toLocaleLowerCase("zh-Hant").includes(normalized)
  );
  return Promise.resolve({ ok: true, count: events.length, events });
}

function renderResult(result: SearchResult, source: "human" | "agent") {
  results?.replaceChildren(...result.events.map((event) => {
    const item = document.createElement("li");
    item.textContent = event.title;
    return item;
  }));

  if (status) {
    status.textContent = source === "agent"
      ? `E2 synthetic Agent submission（非真實 Agent invocation）：${result.count} 場`
      : `人類操作已完成：${result.count} 場`;
  }
}

form?.addEventListener("submit", (rawEvent) => {
  rawEvent.preventDefault();
  const event = rawEvent as AgentSubmitEvent;
  const keyword = String(new FormData(form).get("keyword") ?? "");
  const result = executeSearchEvents(keyword);
  const agentInvoked = event.agentInvoked === true;

  if (agentInvoked) event.respondWith?.(result);
  void result.then((value) => renderResult(value, agentInvoked ? "agent" : "human"));
});
