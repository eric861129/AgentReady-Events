import { executeSearchEvents, type SearchEventsResult } from "../shared/search-tool";

const params = new URLSearchParams(location.search);
const variant = params.get("variant");
const wrapped = variant === "wrapped";
const renamed = variant === "renamed";
const form = document.querySelector<HTMLFormElement>("#search-form");
const button = form?.querySelector<HTMLButtonElement>("button");
const status = document.querySelector<HTMLElement>("#status");
const results = document.querySelector<HTMLOListElement>("#results");
const evidenceBoard = document.querySelector<HTMLElement>("#evidence-board");
const domAfter = document.querySelector<HTMLElement>("#dom-after");
const variantName = document.querySelector<HTMLElement>("#variant-name");
const variantDetail = document.querySelector<HTMLElement>("#variant-detail");

if (button) {
  button.textContent = renamed ? "探索場次" : "搜尋活動";
  if (wrapped) {
    const wrapper = document.createElement("div");
    wrapper.className = "action-shell";
    button.replaceWith(wrapper);
    wrapper.append(button);
  }
}

if (variantName && variantDetail) {
  if (wrapped) {
    variantName.textContent = "DOM 包裝版";
    variantDetail.textContent = "按鈕名稱不變，但外層新增 action-shell。";
  } else if (renamed) {
    variantName.textContent = "文案改名版";
    variantDetail.textContent = "DOM 結構不變，按鈕名稱改成「探索場次」。";
  }
}

if (params.get("evidence") === "1" && evidenceBoard) {
  evidenceBoard.hidden = false;
  if (domAfter && button) domAfter.textContent = (button.parentElement ?? button).outerHTML;
}

function renderResult(result: SearchEventsResult) {
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
    status.textContent = `人類操作已完成：${result.count} 場`;
  }
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = String(new FormData(form).get("keyword") ?? "");
  void executeSearchEvents({ keyword }).then(renderResult);
});
