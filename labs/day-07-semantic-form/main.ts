import { LAB_EVENTS, searchLabEvents, type LabEvent, type LabSearchQuery } from "../shared/events";

const form = document.querySelector<HTMLFormElement>("#event-search");
const results = document.querySelector<HTMLOListElement>("#results");
const searchStatus = document.querySelector<HTMLElement>("#search-status");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const read = (name: string) => String(data.get(name) ?? "").trim();
  const query: LabSearchQuery = {};
  const keyword = read("query");
  const location = read("location");
  const price = read("price");
  const level = read("level");
  if (keyword) query.query = keyword;
  if (location) query.location = location as LabEvent["location"];
  if (price) query.price = price as LabEvent["price"];
  if (level) query.level = level as LabEvent["level"];
  const matches = searchLabEvents(LAB_EVENTS, query);
  results?.replaceChildren(...matches.map((item) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = item.title;
    li.append(strong, document.createTextNode(` — ${item.summary}`));
    return li;
  }));
  if (searchStatus) searchStatus.textContent = `找到 ${matches.length} 場活動`;
});
