export const SEARCH_EVENTS_TOOL_NAME = "search_events";

export const SEARCH_EVENTS_TOOL_DESCRIPTION =
  "依關鍵字、日期、地點、費用、類別與難度搜尋目前公開活動，並更新活動列表。使用者想找活動或縮小活動範圍時使用。";

export function detectWebMcpSupport(): Record<string, boolean> {
  const documentWithModelContext = document as Document & {
    modelContext?: unknown;
  };

  const modelContext = documentWithModelContext.modelContext as {
    registerTool?: unknown;
    getTools?: unknown;
    executeTool?: unknown;
  } | undefined;

  return {
    secureContext: window.isSecureContext,
    documentModelContext: "modelContext" in documentWithModelContext,
    registerTool: typeof modelContext?.registerTool === "function",
    getTools: typeof modelContext?.getTools === "function",
    executeTool: typeof modelContext?.executeTool === "function"
  };
}
