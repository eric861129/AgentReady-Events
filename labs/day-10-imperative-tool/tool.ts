import {
  SEARCH_EVENTS_INPUT_SCHEMA,
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME,
  type SearchEventsResult
} from "../shared/search-tool";
import { failure } from "../shared/tool-result";
import type { ProjectTool } from "../shared/tool-types";

export type SearchEventsLabExecutor = (input: unknown) => Promise<SearchEventsResult>;

export function createSearchEventsLabTool(
  executeSearch: SearchEventsLabExecutor,
  render: (result: SearchEventsResult) => void
): ProjectTool<Record<string, unknown>, SearchEventsResult> {
  return {
    name: SEARCH_EVENTS_TOOL_NAME,
    description: SEARCH_EVENTS_TOOL_DESCRIPTION,
    inputSchema: SEARCH_EVENTS_INPUT_SCHEMA as unknown as Record<string, unknown>,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      let result: SearchEventsResult;
      try {
        result = await executeSearch(input);
      } catch {
        result = failure("TEMPORARY_FAILURE", "活動搜尋暫時無法完成，請稍後再試。");
      }
      render(result);
      return result;
    }
  };
}
