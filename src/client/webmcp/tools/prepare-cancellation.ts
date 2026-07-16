import type { CancellationResponse, CancellationSummary } from "../../../shared/contracts";
import { ApiClientError } from "../../api/client";
import { commonToolFailure, toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

type PreparationResult = ToolResult<never> | { ok: false; code: "CONFIRMATION_REQUIRED"; reason: "HUMAN_CONFIRMATION_REQUIRED"; message: string; nextAction: string; retryable: false; uiUpdated: true; stateVersion: number; summary: CancellationSummary };

export function createPrepareCancellationTool(dependencies: {
  load(registrationId: string): Promise<CancellationSummary>;
  show(summary: CancellationSummary): void;
  cancel(registrationId: string, context: { mode: "human" | "agent" }): Promise<CancellationResponse>;
  getStateVersion(): number;
}): ProjectTool<{ registration_id: string }, PreparationResult> {
  return {
    name: "prepare_registration_cancellation",
    description: "為目前工作階段擁有的有效報名顯示取消摘要，並停在最終人類確認之前。",
    inputSchema: { type: "object", additionalProperties: false, required: ["registration_id"], properties: { registration_id: { type: "string", pattern: "^[a-z0-9_-]+$", description: "我的報名列表提供的不透明報名 ID。" } } },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options = {}) {
      const version = dependencies.getStateVersion();
      if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
      if (!/^[a-z0-9_-]{1,64}$/.test(input?.registration_id ?? "")) return toolFailure("INVALID_INPUT", "INVALID_REGISTRATION_ID", "報名 ID 格式無效。", "請使用我的報名列表提供的 registration_id。", version);
      try {
        const summary = await dependencies.load(input.registration_id);
        if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
        dependencies.show(summary);
        return { ok: false, code: "CONFIRMATION_REQUIRED", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "取消摘要已顯示，等待使用者確認。", nextAction: "請使用者閱讀影響，並在可見對話框中自行確認。", retryable: false, uiUpdated: true, stateVersion: dependencies.getStateVersion(), summary };
      } catch (error) {
        const common = commonToolFailure(error, options.signal, version);
        if (common) return common;
        if (error instanceof ApiClientError && error.status === 404) return toolFailure("NOT_FOUND", "REGISTRATION_NOT_FOUND", "找不到可取消的報名。", "重新整理我的報名列表，確認這筆資料仍屬於目前帳號。", version);
        if (error instanceof ApiClientError && error.status === 409) return toolFailure("CONFLICT", "REGISTRATION_NOT_ACTIVE", "這筆報名目前不能取消。", "重新整理列表，確認報名是否已取消或狀態已變更。", version);
        return toolFailure("TEMPORARY_FAILURE", "CANCELLATION_SUMMARY_UNAVAILABLE", "暫時無法準備取消摘要。", "稍後重試，或從我的報名列表重新開始。", version);
      }
    }
  };
}
