import type { CancellationResponse, CancellationSummary } from "../../../shared/contracts";
import { ApiClientError } from "../../api/client";
import { commonToolFailure, toolFailure, type ToolGuidance, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

type PreparationResult = ToolResult<never> | { ok: false; code: "CONFIRMATION_REQUIRED"; reason: "HUMAN_CONFIRMATION_REQUIRED"; message: string; nextAction: string; retryable: false; uiUpdated: true; stateVersion: number; summary: CancellationSummary; guidance: ToolGuidance };

export function createPrepareCancellationTool(dependencies: {
  load(registrationId: string): Promise<CancellationSummary>;
  show(summary: CancellationSummary): void;
  cancel(registrationId: string, context: { mode: "human" | "agent" }): Promise<CancellationResponse>;
  getStateVersion(): number;
  getDefaultRegistrationId?(): string | undefined;
}): ProjectTool<{ registration_id?: string }, PreparationResult> {
  return {
    name: "prepare_registration_cancellation",
    description: "為目前頁面的有效報名顯示取消摘要，並停在最終確認對話框。頁面只有一筆有效報名時以空物件直接呼叫；有多筆時傳入頁面提供的 registration_id。此 Tool 只準備摘要，最終取消由使用者確認。",
    inputSchema: { type: "object", additionalProperties: false, properties: { registration_id: { type: "string", pattern: "^[a-z0-9_-]+$", description: "選填。只有多筆有效報名時，才使用我的報名列表提供的不透明報名 ID；不得自行產生。" } } },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options = {}) {
      const version = dependencies.getStateVersion();
      if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
      const registrationId = input?.registration_id || dependencies.getDefaultRegistrationId?.();
      if (!registrationId) {
        return toolFailure(
          "INVALID_INPUT",
          "REGISTRATION_SELECTION_REQUIRED",
          "目前無法唯一判定要取消的報名。",
          "請使用者從我的報名列表選擇一筆有效報名。",
          version
        );
      }
      if (!/^[a-z0-9_-]{1,64}$/.test(registrationId)) return toolFailure("INVALID_INPUT", "INVALID_REGISTRATION_ID", "報名 ID 格式無效。", "請使用我的報名列表提供的 registration_id。", version);
      try {
        const summary = await dependencies.load(registrationId);
        if (options.signal?.aborted) return commonToolFailure(undefined, options.signal, version)!;
        dependencies.show(summary);
        return {
          ok: false,
          code: "CONFIRMATION_REQUIRED",
          reason: "HUMAN_CONFIRMATION_REQUIRED",
          message: "取消摘要已顯示，等待使用者確認。",
          nextAction: "請使用者閱讀影響，並在可見對話框中自行確認。",
          retryable: false,
          uiUpdated: true,
          stateVersion: dependencies.getStateVersion(),
          summary,
          guidance: {
            availableActions: [],
            currentTarget: { kind: "registration", id: summary.registrationId },
            requiresHumanConfirmation: true
          }
        };
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
