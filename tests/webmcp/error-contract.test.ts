import { describe, expect, it } from "vitest";
import { toolFailure, type ToolErrorCode } from "../../src/client/webmcp/result";

describe("formal Tool error contract", () => {
  const codes: ToolErrorCode[] = [
    "INVALID_INPUT",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "CONFLICT",
    "TEMPORARY_FAILURE",
    "ABORTED"
  ];

  it.each(codes)("provides a safe actionable %s result", (code) => {
    const result = toolFailure(code, "SAFE_REASON", "可安全顯示的訊息。", "依畫面提示完成下一步。", 3);
    expect(result).toEqual({
      ok: false,
      code,
      reason: "SAFE_REASON",
      message: "可安全顯示的訊息。",
      nextAction: "依畫面提示完成下一步。",
      retryable: code === "TEMPORARY_FAILURE",
      uiUpdated: false,
      stateVersion: 3
    });
    expect(JSON.stringify(result)).not.toMatch(/stack|session|token/i);
  });
});
