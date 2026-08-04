import { ApiClientError } from "../api/client";
import type { ApprovedToolName } from "../../shared/contracts";

export type ToolErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "TEMPORARY_FAILURE" | "ABORTED";

export type ToolFailure = {
  ok: false;
  code: ToolErrorCode;
  reason: string;
  message: string;
  nextAction: string;
  retryable: boolean;
  uiUpdated: false;
  stateVersion: number;
};

export type ToolGuidance = {
  availableActions: ApprovedToolName[];
  currentTarget?: {
    kind: "event" | "registration";
    id: string;
  };
  requiresHumanConfirmation: boolean;
};

export type ToolResult<T> =
  | { ok: true; code: "SUCCESS"; data: T; guidance?: ToolGuidance; uiUpdated: boolean; stateVersion: number }
  | ToolFailure;

export function toolFailure(
  code: ToolErrorCode,
  reason: string,
  message: string,
  nextAction: string,
  stateVersion: number
): ToolFailure {
  return {
    ok: false,
    code,
    reason,
    message,
    nextAction,
    retryable: code === "TEMPORARY_FAILURE",
    uiUpdated: false,
    stateVersion
  };
}

export function commonToolFailure(
  error: unknown,
  signal: AbortSignal | undefined,
  stateVersion: number
): ToolFailure | undefined {
  if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
    return toolFailure("ABORTED", "EXECUTION_ABORTED", "Tool 執行已取消。", "確認目前頁面狀態後，再決定是否重新執行。", stateVersion);
  }
  if (error instanceof ApiClientError && error.status === 401) {
    if (error.reason === "SESSION_EXPIRED") {
      return toolFailure(
        "UNAUTHORIZED",
        "SESSION_EXPIRED",
        "工作階段已過期。",
        "請重新整理頁面，重新開始這次操作。",
        stateVersion
      );
    }
    return toolFailure("UNAUTHORIZED", "AUTHENTICATION_REQUIRED", "登入狀態已失效。", "請先重新登入，再執行這個 Tool。", stateVersion);
  }
  if (error instanceof ApiClientError && error.status === 403) {
    return toolFailure("FORBIDDEN", "PERMISSION_DENIED", "目前沒有執行此操作的權限。", "請回到可見介面確認帳號與操作權限。", stateVersion);
  }
  return undefined;
}
