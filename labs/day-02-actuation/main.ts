import {
  readDeclarativeSearchInput,
  useAgentRespondWith,
  type AgentSubmitEvent
} from "../shared/declarative";
import { executeSearchEvents, type SearchEventsResult } from "../shared/search-tool";

const params = new URLSearchParams(location.search);
const renamed = params.get("variant") === "renamed";
const form = document.querySelector<HTMLFormElement>("#search-form");
const button = form?.querySelector<HTMLButtonElement>("button");
const status = document.querySelector<HTMLElement>("#status");
const results = document.querySelector<HTMLOListElement>("#results");
const evidenceBoard = document.querySelector<HTMLElement>("#evidence-board");
const domAfter = document.querySelector<HTMLElement>("#dom-after");

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

if (params.get("evidence") === "1" && evidenceBoard) {
  evidenceBoard.hidden = false;
  if (domAfter && button) domAfter.textContent = (button.parentElement ?? button).outerHTML;
}

function renderResult(result: SearchEventsResult, source: "human" | "agent") {
  if (!result.ok) {
    results?.replaceChildren();
    if (status) status.textContent = `${result.code}：${result.message}`;
    return;
  }
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
  const event = rawEvent as Event & AgentSubmitEvent;
  const result = executeSearchEvents(readDeclarativeSearchInput(new FormData(form)));
  const agentInvoked = useAgentRespondWith(event, result);
  void result.then((value) => renderResult(value, agentInvoked ? "agent" : "human"));
});
