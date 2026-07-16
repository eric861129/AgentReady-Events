import type {
  BrowserModelContext,
  DiscoveredTool,
  ModelContextDiscoveryOptions,
  ModelContextExecuteOptions,
  ProjectTool
} from "./types";

export type { BrowserModelContext } from "./types";

type ModelContextSource = { modelContext?: BrowserModelContext };

function contextFrom(source?: ModelContextSource): BrowserModelContext | undefined {
  if (source) return source.modelContext;
  if (typeof document === "undefined") return undefined;
  return (document as Document & ModelContextSource).modelContext;
}

function validateSecureOrigins(origins: string[] | undefined, label: string): void {
  for (const value of origins ?? []) {
    const origin = new URL(value);
    const local = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
    if (origin.protocol !== "https:" && !local) throw new TypeError(`${label} 只接受 HTTPS secure origins。`);
  }
}

export async function registerToolAdapter<TInput extends object, TResult>(
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

export async function getToolsAdapter(
  options: ModelContextDiscoveryOptions = {},
  source?: ModelContextSource
): Promise<DiscoveredTool[]> {
  validateSecureOrigins(options.fromOrigins, "fromOrigins");
  return contextFrom(source)?.getTools?.(options) ?? [];
}

export async function executeToolAdapter(
  tool: DiscoveredTool,
  input: string,
  options: ModelContextExecuteOptions = {},
  source?: ModelContextSource
): Promise<unknown | null | undefined> {
  return contextFrom(source)?.executeTool?.(tool, input, options);
}

export function subscribeToolChanges(listener: EventListener, source?: ModelContextSource): () => void {
  const modelContext = contextFrom(source);
  if (!modelContext) return () => undefined;
  modelContext.addEventListener("toolchange", listener);
  return () => modelContext.removeEventListener("toolchange", listener);
}
