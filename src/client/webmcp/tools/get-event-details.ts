import type { EventDetail } from "../../../shared/contracts";
import { ApiClientError } from "../../api/client";
import { commonToolFailure, toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

export type GetEventDetailsInput = { event_id?: string };
const OPAQUE_ID = /^[a-z0-9_-]{1,64}$/;

export function createGetEventDetailsTool(dependencies: {
  load(eventId: string): Promise<EventDetail>;
  show(detail: EventDetail): void;
  getStateVersion(): number;
  getCurrentEventId?: () => string | undefined;
}): ProjectTool<GetEventDetailsInput, ToolResult<{ event: EventDetail }>> {
  const routeBound = dependencies.getCurrentEventId !== undefined;
  return {
    name: "get_event_details",
    description: routeBound
      ? "讀取目前頁面正在查看的公開活動完整資訊，並更新使用者看得見的活動內容。此 Tool 已綁定目前頁面，請以空物件呼叫，不要提供活動 ID。"
      : "使用 search_events 結果提供的不透明活動 ID，讀取該公開活動的完整資訊。",
    inputSchema: routeBound
      ? { type: "object", additionalProperties: false, properties: {} }
      : {
          type: "object",
          additionalProperties: false,
          required: ["event_id"],
          properties: { event_id: { type: "string", minLength: 1, maxLength: 64, pattern: "^[a-z0-9_-]+$", description: "search_events 結果提供的不透明活動 ID；不得自行產生。" } }
        },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options = {}) {
      const version = dependencies.getStateVersion();
      if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
      const currentEventId = dependencies.getCurrentEventId?.();
      if (currentEventId !== undefined) {
        if (!OPAQUE_ID.test(currentEventId)) return toolFailure("INVALID_INPUT", "CURRENT_EVENT_UNAVAILABLE", "目前頁面的活動識別資料無效。", "請重新載入目前活動頁面後再試。", version);
        if (input?.event_id !== undefined && input.event_id !== currentEventId) return toolFailure("INVALID_INPUT", "CURRENT_EVENT_MISMATCH", "目前頁面只允許讀取正在查看的活動。", "請不要提供活動 ID，直接重新執行這個 Tool。", version);
      }
      const eventId = currentEventId ?? input?.event_id;
      if (eventId === undefined || !OPAQUE_ID.test(eventId)) return toolFailure("INVALID_INPUT", "INVALID_EVENT_ID", "活動 ID 格式無效。", "請使用 search_events 回傳的 event_id，或回到活動詳情頁後直接重新執行。", version);
      try {
        const event = await dependencies.load(eventId);
        if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
        dependencies.show(event);
        return { ok: true, code: "SUCCESS", data: { event }, uiUpdated: true, stateVersion: dependencies.getStateVersion() };
      } catch (error) {
        const common = commonToolFailure(error, options.signal, version);
        if (common) return common;
        if (error instanceof ApiClientError && error.status === 404) return toolFailure("NOT_FOUND", "EVENT_NOT_FOUND", "找不到公開活動。", "重新搜尋活動，取得目前有效的 event_id。", version);
        return toolFailure("TEMPORARY_FAILURE", "EVENT_SERVICE_UNAVAILABLE", "活動服務暫時無法使用。", "稍後重試；若持續失敗，改由可見介面確認服務狀態。", version);
      }
    }
  };
}
