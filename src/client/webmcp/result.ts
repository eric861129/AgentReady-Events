export type ToolErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "CONFIRMATION_REQUIRED" | "TEMPORARY_FAILURE" | "AUTHENTICATION_REQUIRED";

export type ToolResult<T> =
  | { ok: true; code: "SUCCESS"; data: T; uiUpdated: boolean; stateVersion: number }
  | { ok: false; code: ToolErrorCode; reason: string; message: string; retryable: boolean; uiUpdated: boolean; stateVersion: number };

export function toolFailure(code: ToolErrorCode, reason: string, message: string, stateVersion: number): ToolResult<never> {
  return { ok: false, code, reason, message, retryable: code === "TEMPORARY_FAILURE", uiUpdated: false, stateVersion };
}
