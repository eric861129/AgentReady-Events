export type ToolAnnotations = { readOnlyHint?: boolean; untrustedContentHint?: boolean };

export type ProjectTool<TInput extends object, TResult> = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: ToolAnnotations;
  execute(input: TInput, options?: { signal?: AbortSignal }): Promise<TResult>;
};

export type DiscoveredTool = {
  name: string;
  description: string;
  inputSchema: string;
  origin: string;
  annotations?: ToolAnnotations;
  window?: Window;
};

export type ModelContextRegisterOptions = { signal?: AbortSignal; exposedTo?: string[] };
export type ModelContextDiscoveryOptions = { fromOrigins?: string[] };
export type ModelContextExecuteOptions = { signal?: AbortSignal };

export type BrowserModelContext = EventTarget & {
  registerTool(tool: ProjectTool<object, unknown>, options?: ModelContextRegisterOptions): Promise<void>;
  getTools?(options?: ModelContextDiscoveryOptions): Promise<DiscoveredTool[]>;
  executeTool?(tool: DiscoveredTool, input: string, options?: ModelContextExecuteOptions): Promise<unknown | null>;
};
