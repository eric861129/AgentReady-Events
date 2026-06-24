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
