import {
  readDeclarativeSearchInput,
  useAgentRespondWith,
  type AgentSubmitEvent
} from "../shared/declarative";
import { executeSearchEvents, type SearchEventsResult } from "../shared/search-tool";

const form = document.querySelector<HTMLFormElement>("#event-search");
const results = document.querySelector<HTMLOListElement>("#results");
const searchStatus = document.querySelector<HTMLElement>("#search-status");

function renderResult(result: SearchEventsResult, source: "human" | "agent"): void {
  if (!result.ok) {
    results?.replaceChildren();
    if (searchStatus) searchStatus.textContent = `${source === "agent" ? "E2 synthetic Agent submission" : "人類 fallback"}：${result.code} — ${result.message}`;
    return;
  }

  results?.replaceChildren(...result.events.map((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item.title;
    return listItem;
  }));
  if (searchStatus) {
    const label = source === "agent" ? "E2 synthetic Agent submission（非真實 Agent invocation）" : "人類 fallback 已完成";
    searchStatus.textContent = `${label}：${result.count} 場`;
  }
}

form?.addEventListener("submit", (rawEvent) => {
  rawEvent.preventDefault();
  const event = rawEvent as Event & AgentSubmitEvent;
  const result = executeSearchEvents(readDeclarativeSearchInput(new FormData(form)));
  const isAgentSubmission = useAgentRespondWith(event, result);
  void result.then((value) => renderResult(value, isAgentSubmission ? "agent" : "human"));
});
