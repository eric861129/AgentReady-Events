export {};

const params = new URLSearchParams(location.search);
const renamed = params.get("variant") === "renamed";
const form = document.querySelector<HTMLFormElement>("#search-form");
const button = form?.querySelector<HTMLButtonElement>("button");
const status = document.querySelector<HTMLElement>("#status");

if (button) button.textContent = renamed ? "探索場次" : "搜尋活動";

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (status) status.textContent = "已搜尋：WebMCP";
});
