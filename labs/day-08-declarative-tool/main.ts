import { LAB_EVENTS, searchLabEvents, type LabEvent, type LabSearchQuery } from "../shared/events";

const form = document.querySelector<HTMLFormElement>("#event-search");
const results = document.querySelector<HTMLOListElement>("#results");
const searchStatus = document.querySelector<HTMLElement>("#search-status");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "").trim();
  const query: LabSearchQuery = {};
  if (value("query")) query.query = value("query");
  if (value("location")) query.location = value("location") as LabEvent["location"];
  if (value("price")) query.price = value("price") as LabEvent["price"];
  if (value("level")) query.level = value("level") as LabEvent["level"];
  const matches = searchLabEvents(LAB_EVENTS, query);
  results?.replaceChildren(...matches.map((item) => {
    const li = document.createElement("li");
    li.textContent = item.title;
    return li;
  }));
  if (searchStatus) searchStatus.textContent = `人類 fallback 已完成：${matches.length} 場`;
});
