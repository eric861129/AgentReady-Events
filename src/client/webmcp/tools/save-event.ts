import type { SaveEventResponse } from "../../../shared/contracts";
import type { ActionContext } from "../../services/event-actions";
import { commonToolFailure, toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

export function createSaveEventTool(dependencies: {
  getCurrentEventId(): string | undefined;
  save(eventId: string, context: ActionContext): Promise<SaveEventResponse>;
  show(result: SaveEventResponse): void;
  getStateVersion(): number;
}): ProjectTool<{ event_id: string }, ToolResult<SaveEventResponse>> {
  const opaqueId = /^[a-z0-9_-]{1,64}$/;
  return {
    name: "save_event",
    description: "收藏目前正在查看的公開活動；重複收藏安全且使用者可以在可見介面 Undo。",
    inputSchema: { type: "object", additionalProperties: false, required: ["event_id"], properties: { event_id: { type: "string", pattern: "^[a-z0-9_-]+$", description: "目前詳情頁的不透明活動 ID。" } } },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options = {}) {
      const version = dependencies.getStateVersion();
      if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
      if (!opaqueId.test(input?.event_id ?? "")) return toolFailure("INVALID_INPUT", "INVALID_EVENT_ID", "活動 ID 格式無效。", "請使用目前詳情頁顯示的 event_id。", version);
      if (dependencies.getCurrentEventId() !== input.event_id) return toolFailure("CONFLICT", "STALE_EVENT_TARGET", "目前頁面已不是指定活動。", "重新讀取目前詳情頁，再確認要收藏的活動。", version);
      try {
        const result = await dependencies.save(input.event_id, { mode: "agent" });
        if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
        dependencies.show(result);
        return { ok: true, code: "SUCCESS", data: result, uiUpdated: true, stateVersion: dependencies.getStateVersion() };
      } catch (error) {
        const common = commonToolFailure(error, options.signal, version);
        if (common) return common;
        return toolFailure("TEMPORARY_FAILURE", "SAVE_UNAVAILABLE", "暫時無法收藏活動。", "稍後重試，或使用頁面上的收藏按鈕。", version);
      }
    }
  };
}
