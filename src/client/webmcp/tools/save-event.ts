import type { SaveEventResponse } from "../../../shared/contracts";
import type { ActionContext } from "../../services/event-actions";
import { toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

export function createSaveEventTool(dependencies: {
  getCurrentEventId(): string | undefined;
  save(eventId: string, context: ActionContext): Promise<SaveEventResponse>;
  show(result: SaveEventResponse): void;
  getStateVersion(): number;
}): ProjectTool<{ event_id: string }, ToolResult<SaveEventResponse>> {
  return {
    name: "save_event",
    description: "收藏目前正在查看的公開活動；重複收藏安全且使用者可以在可見介面 Undo。",
    inputSchema: { type: "object", additionalProperties: false, required: ["event_id"], properties: { event_id: { type: "string", pattern: "^[a-z0-9_-]+$", description: "目前詳情頁的不透明活動 ID。" } } },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input) {
      const version = dependencies.getStateVersion();
      if (dependencies.getCurrentEventId() !== input.event_id) return toolFailure("CONFLICT", "STALE_EVENT_TARGET", "目前頁面已不是指定活動。", version);
      try {
        const result = await dependencies.save(input.event_id, { mode: "agent" });
        dependencies.show(result);
        return { ok: true, code: "SUCCESS", data: result, uiUpdated: true, stateVersion: dependencies.getStateVersion() };
      } catch {
        return toolFailure("TEMPORARY_FAILURE", "SAVE_UNAVAILABLE", "暫時無法收藏活動。", version);
      }
    }
  };
}
