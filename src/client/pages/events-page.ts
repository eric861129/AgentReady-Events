import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "../../shared/contracts";
import { eventDetailsRequest, searchEventsRequest } from "../api/client";

export function renderEventsPage(root: HTMLElement): void {
  root.innerHTML = `
    <h1>活動</h1>
    <form id="event-search">
      <label for="query">關鍵字</label><input id="query" name="query" maxlength="100">
      <label for="location">地點</label><select id="location" name="location"><option value="">不限</option><option value="taipei">台北</option><option value="kaohsiung">高雄</option><option value="online">線上</option></select>
      <label for="price">費用</label><select id="price" name="price"><option value="">不限</option><option value="free">免費</option><option value="paid">付費</option></select>
      <label for="level">程度</label><select id="level" name="level"><option value="">不限</option><option value="beginner">入門</option><option value="intermediate">中階</option><option value="advanced">進階</option></select>
      <button type="submit">搜尋活動</button>
    </form>
    <p id="search-status" role="status">尚未搜尋</p>
    <ol id="results" aria-label="活動搜尋結果"></ol>
    <section id="event-detail" aria-live="polite"></section>`;
  const form = root.querySelector<HTMLFormElement>("#event-search");
  const status = root.querySelector<HTMLElement>("#search-status");
  const list = root.querySelector<HTMLOListElement>("#results");
  const detail = root.querySelector<HTMLElement>("#event-detail");
  form?.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();
    const query: SearchEventsQuery = {
      ...(get("query") ? { query: get("query") } : {}),
      ...(get("location") ? { location: get("location") as EventLocation } : {}),
      ...(get("price") ? { price: get("price") as EventPrice } : {}),
      ...(get("level") ? { level: get("level") as EventLevel } : {})
    };
    try {
      const response = await searchEventsRequest(query);
      list?.replaceChildren(...response.events.map((event) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = event.title;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "查看詳情";
        button.dataset.eventId = event.id;
        item.append(title, document.createTextNode(` — ${event.summary} `), button);
        return item;
      }));
      if (status) status.textContent = `找到 ${response.events.length} 場活動`;
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : "搜尋失敗。";
    }
  });
  list?.addEventListener("click", async (clickEvent) => {
    const button = (clickEvent.target as Element).closest<HTMLButtonElement>("button[data-event-id]");
    if (!button || !detail) return;
    const event = await eventDetailsRequest(button.dataset.eventId ?? "");
    const heading = document.createElement("h2");
    heading.textContent = event.title;
    const text = document.createElement("p");
    text.textContent = `${event.venue} · 剩餘 ${event.remainingCapacity} 名`;
    detail.replaceChildren(heading, text);
  });
}
