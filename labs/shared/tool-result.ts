export type ToolResultCode = "SUCCESS" | "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "CONFIRMATION_REQUIRED" | "TEMPORARY_FAILURE";

export type ToolFailure = {
  ok: false;
  code: Exclude<ToolResultCode, "SUCCESS">;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
};

export type ToolResult<T> =
  | { ok: true; code: "SUCCESS"; data: T }
  | ToolFailure;

export function success<T>(data: T): ToolResult<T> {
  return { ok: true, code: "SUCCESS", data };
}

export function failure(
  code: Exclude<ToolResultCode, "SUCCESS">,
  message: string,
  details?: Record<string, unknown>
): ToolFailure {
  const result: ToolFailure = { ok: false, code, message, retryable: code === "TEMPORARY_FAILURE" };
  return details ? { ...result, details } : result;
}
