import type { ProjectTool } from "./tool-types";

type BrowserModelContext = {
  registerTool(tool: ProjectTool<object, unknown>, options?: { signal?: AbortSignal }): Promise<void>;
};

export async function registerProjectTool<TInput extends object, TResult>(
  tool: ProjectTool<TInput, TResult>
): Promise<AbortController | undefined> {
  const modelContext = (document as Document & { modelContext?: BrowserModelContext }).modelContext;
  if (!modelContext?.registerTool) return undefined;
  const controller = new AbortController();
  await modelContext.registerTool(tool as ProjectTool<object, unknown>, { signal: controller.signal });
  return controller;
}
