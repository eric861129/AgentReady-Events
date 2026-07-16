import {
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME,
  type SearchEventsResult
} from "./search-tool";

export const SEARCH_TOOL_NAME = SEARCH_EVENTS_TOOL_NAME;
export const SEARCH_TOOL_DESCRIPTION = SEARCH_EVENTS_TOOL_DESCRIPTION;

export type AgentSubmitEvent = {
  agentInvoked?: boolean;
  respondWith?: (result: Promise<SearchEventsResult>) => void;
};

export function readDeclarativeIdentity(form: HTMLFormElement): { name: string; description: string } {
  return {
    name: form.getAttribute("toolname") ?? "",
    description: form.getAttribute("tooldescription") ?? ""
  };
}

export function readDeclarativeSearchInput(data: FormData): Record<string, string> {
  const input: Record<string, string> = {};
  for (const field of ["keyword", "city", "format"] as const) {
    const value = String(data.get(field) ?? "").trim();
    if (value) input[field] = value;
  }
  return input;
}

export function useAgentRespondWith(event: AgentSubmitEvent, result: Promise<SearchEventsResult>): boolean {
  if (!event.agentInvoked) return false;
  event.respondWith?.(result);
  return true;
}
