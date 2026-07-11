import type { EventDetail } from "../../../shared/contracts";
import { ApiClientError } from "../../api/client";
import { toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

export type GetEventDetailsInput = { event_id: string };
const OPAQUE_ID = /^[a-z0-9_-]{1,64}$/;

export function createGetEventDetailsTool(dependencies: {
  load(eventId: string): Promise<EventDetail>;
  show(detail: EventDetail): void;
  getStateVersion(): number;
}): ProjectTool<GetEventDetailsInput, ToolResult<{ event: EventDetail }>> {
  return {
    name: "get_event_details",
    description: "依搜尋結果提供的不透明活動 ID 取得目前公開詳情，並更新使用者看得見的活動內容。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["event_id"],
      properties: { event_id: { type: "string", minLength: 1, maxLength: 64, pattern: "^[a-z0-9_-]+$", description: "搜尋結果提供的不透明活動 ID。" } }
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      const version = dependencies.getStateVersion();
      if (!OPAQUE_ID.test(input.event_id)) return toolFailure("VALIDATION_ERROR", "INVALID_EVENT_ID", "活動 ID 格式無效。", version);
      try {
        const event = await dependencies.load(input.event_id);
        dependencies.show(event);
        return { ok: true, code: "SUCCESS", data: { event }, uiUpdated: true, stateVersion: dependencies.getStateVersion() };
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) return toolFailure("NOT_FOUND", "EVENT_NOT_FOUND", "找不到公開活動。", version);
        return toolFailure("TEMPORARY_FAILURE", "EVENT_SERVICE_UNAVAILABLE", "活動服務暫時無法使用。", version);
      }
    }
  };
}
