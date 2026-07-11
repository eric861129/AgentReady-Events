export const SEARCH_TOOL_NAME = "search_events";
export const SEARCH_TOOL_DESCRIPTION = "依關鍵字、地點、費用與程度搜尋目前公開活動，並更新使用者可見的活動列表。";

export function readDeclarativeIdentity(form: HTMLFormElement): { name: string; description: string } {
  return {
    name: form.getAttribute("toolname") ?? "",
    description: form.getAttribute("tooldescription") ?? ""
  };
}
