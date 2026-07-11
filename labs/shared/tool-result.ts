export type ToolResultCode = "SUCCESS" | "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "CONFIRMATION_REQUIRED" | "TEMPORARY_FAILURE";

export type ToolResult<T> =
  | { ok: true; code: "SUCCESS"; data: T }
  | { ok: false; code: Exclude<ToolResultCode, "SUCCESS">; reason: string; retryable: boolean };

export function success<T>(data: T): ToolResult<T> {
  return { ok: true, code: "SUCCESS", data };
}

export function failure(code: Exclude<ToolResultCode, "SUCCESS">, reason: string): ToolResult<never> {
  return { ok: false, code, reason, retryable: code === "TEMPORARY_FAILURE" };
}
