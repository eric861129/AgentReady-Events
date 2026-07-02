export interface ProjectWebMcpTool<TInput extends object = Record<string, unknown>, TResult = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute(input: TInput): Promise<TResult>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
}

interface ProjectModelContext {
  registerTool<TInput extends object, TResult>(
    tool: ProjectWebMcpTool<TInput, TResult>,
    options?: { signal?: AbortSignal }
  ): Promise<unknown>;
}

type DocumentWithModelContext = Document & {
  modelContext?: ProjectModelContext;
};

export interface WebMcpAdapter {
  isSupported(): boolean;
  registerTool<TInput extends object, TResult>(
    tool: ProjectWebMcpTool<TInput, TResult>
  ): Promise<{ name: string; dispose(): void }>;
}

export function createWebMcpAdapter(documentRef: Document = document): WebMcpAdapter {
  const documentWithModelContext = documentRef as DocumentWithModelContext;

  return {
    isSupported() {
      return typeof documentWithModelContext.modelContext?.registerTool === "function";
    },

    async registerTool(tool) {
      const registerTool = documentWithModelContext.modelContext?.registerTool;
      if (typeof registerTool !== "function") {
        throw new Error("目前瀏覽器未提供 WebMCP Imperative API。");
      }

      const controller = new AbortController();
      await registerTool.call(documentWithModelContext.modelContext, tool, {
        signal: controller.signal
      });

      return {
        name: tool.name,
        dispose() {
          controller.abort();
        }
      };
    }
  };
}
