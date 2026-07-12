import type { CancellationResponse, CancellationSummary } from "../../../shared/contracts";
import { ApiClientError } from "../../api/client";
import { toolFailure, type ToolResult } from "../result";
import type { ProjectTool } from "../types";

type PreparationResult = ToolResult<never> | { ok: false; code: "CONFIRMATION_REQUIRED"; reason: "HUMAN_CONFIRMATION_REQUIRED"; message: string; retryable: false; uiUpdated: true; stateVersion: number; summary: CancellationSummary };

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
    async execute(input) {
      const version = dependencies.getStateVersion();
      if (!/^[a-z0-9_-]{1,64}$/.test(input.registration_id)) return toolFailure("VALIDATION_ERROR", "INVALID_REGISTRATION_ID", "報名 ID 格式無效。", version);
      try {
        const summary = await dependencies.load(input.registration_id);
        dependencies.show(summary);
        return { ok: false, code: "CONFIRMATION_REQUIRED", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "取消摘要已顯示，等待使用者確認。", retryable: false, uiUpdated: true, stateVersion: dependencies.getStateVersion(), summary };
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) return toolFailure("AUTHENTICATION_REQUIRED", "SESSION_EXPIRED", "工作階段已過期，請重新開始。", version);
        if (error instanceof ApiClientError && error.status === 404) return toolFailure("NOT_FOUND", "REGISTRATION_NOT_FOUND", "找不到可取消的報名。", version);
        if (error instanceof ApiClientError && error.status === 409) return toolFailure("CONFLICT", "REGISTRATION_NOT_ACTIVE", "這筆報名目前不能取消。", version);
        return toolFailure("TEMPORARY_FAILURE", "CANCELLATION_SUMMARY_UNAVAILABLE", "暫時無法準備取消摘要。", version);
      }
    }
  };
}
