import type { ProjectTool } from "./tool-types";

export type ProjectDiscoveredTool = {
  name: string;
  description: string;
  inputSchema: string;
  origin: string;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  window?: Window;
};

export type ProjectModelContext = EventTarget & {
  registerTool(tool: ProjectTool<object, unknown>, options?: { signal?: AbortSignal; exposedTo?: string[] }): Promise<void>;
  getTools?(options?: { fromOrigins?: string[] }): Promise<ProjectDiscoveredTool[]>;
  executeTool?(tool: ProjectDiscoveredTool, input: string, options?: { signal?: AbortSignal }): Promise<unknown | null>;
};

type ModelContextSource = { modelContext?: ProjectModelContext };

function contextFrom(source?: ModelContextSource): ProjectModelContext | undefined {
  if (source) return source.modelContext;
  if (typeof document === "undefined") return undefined;
  return (document as Document & ModelContextSource).modelContext;
}

export function getProjectModelContextCapabilities(source?: ModelContextSource): {
  registration: boolean;
  discovery: boolean;
  execution: boolean;
} {
  const modelContext = contextFrom(source);
  return {
    registration: typeof modelContext?.registerTool === "function",
    discovery: typeof modelContext?.getTools === "function",
    execution: typeof modelContext?.executeTool === "function"
  };
}

function validateSecureOrigins(origins: string[] | undefined, label: string): void {
  for (const value of origins ?? []) {
    const origin = new URL(value);
    const local = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
    if (origin.protocol !== "https:" && !local) throw new TypeError(`${label} 只接受 HTTPS secure origins。`);
  }
}

export async function registerProjectTool<TInput extends object, TResult>(
  tool: ProjectTool<TInput, TResult>,
  options: { exposedTo?: string[] } = {},
  source?: ModelContextSource
): Promise<AbortController | undefined> {
  const modelContext = contextFrom(source);
  if (!modelContext?.registerTool) return undefined;
  validateSecureOrigins(options.exposedTo, "exposedTo");
  const controller = new AbortController();
  const registrationOptions = options.exposedTo
    ? { signal: controller.signal, exposedTo: options.exposedTo }
    : { signal: controller.signal };
  await modelContext.registerTool(tool as ProjectTool<object, unknown>, registrationOptions);
  return controller;
}

export async function getProjectTools(
  options: { fromOrigins?: string[] } = {},
  source?: ModelContextSource
): Promise<ProjectDiscoveredTool[]> {
  validateSecureOrigins(options.fromOrigins, "fromOrigins");
  return contextFrom(source)?.getTools?.(options) ?? [];
}

export async function executeProjectTool(
  tool: ProjectDiscoveredTool,
  input: string,
  options: { signal?: AbortSignal } = {},
  source?: ModelContextSource
): Promise<unknown | null | undefined> {
  return contextFrom(source)?.executeTool?.(tool, input, options);
}

export function subscribeProjectToolChanges(
  listener: EventListener,
  source?: ModelContextSource
): () => void {
  const modelContext = contextFrom(source);
  if (!modelContext) return () => undefined;
  modelContext.addEventListener("toolchange", listener);
  return () => modelContext.removeEventListener("toolchange", listener);
}
