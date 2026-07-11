import type { ProjectTool } from "../shared/tool-types";

export type EventDetailsInput = { event_id: string };
export type EventDetails = { id: string; title: string; summary?: string };
export type EventDetailsLabResult =
  | { ok: true; code: "SUCCESS"; data: EventDetails; uiUpdated: true }
  | { ok: false; code: "VALIDATION_ERROR" | "NOT_FOUND" | "TEMPORARY_FAILURE"; message: string; retryable: boolean; uiUpdated: false };

const EVENT_ID = /^[a-z0-9_-]{1,64}$/;

export function createEventDetailsLabTool(
  load: (eventId: string) => Promise<EventDetails | undefined>,
  show: (detail: EventDetails) => void
): ProjectTool<EventDetailsInput, EventDetailsLabResult> {
  return {
    name: "get_event_details",
    description: "依不透明活動 ID 取得目前公開活動的詳細資訊，並更新使用者可見的詳情區。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["event_id"],
      properties: { event_id: { type: "string", minLength: 1, maxLength: 64, pattern: "^[a-z0-9_-]+$", description: "搜尋結果提供的不透明活動 ID。" } }
    },
    async execute(input) {
      if (!EVENT_ID.test(input.event_id)) return { ok: false, code: "VALIDATION_ERROR", message: "活動 ID 格式無效。", retryable: false, uiUpdated: false };
      try {
        const detail = await load(input.event_id);
        if (!detail) return { ok: false, code: "NOT_FOUND", message: "找不到公開活動。", retryable: false, uiUpdated: false };
        show(detail);
        return { ok: true, code: "SUCCESS", data: detail, uiUpdated: true };
      } catch {
        return { ok: false, code: "TEMPORARY_FAILURE", message: "活動服務暫時無法使用。", retryable: true, uiUpdated: false };
      }
    }
  };
}
