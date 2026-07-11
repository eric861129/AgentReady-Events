export type FailureScenario = "expired" | "full" | "repeat-save" | "repeat-cancel" | "timeout" | "temporary";
export type FailureResult = { code: string; reason?: string; retryable?: boolean; alreadySaved?: boolean; alreadyCancelled?: boolean };

export class FailurePolicy {
  constructor(private readonly scenario?: FailureScenario) {}
  result(): FailureResult | undefined {
    switch (this.scenario) {
      case "expired": return { code: "AUTHENTICATION_REQUIRED", reason: "SESSION_EXPIRED", retryable: false };
      case "full": return { code: "CONFLICT", reason: "EVENT_FULL", retryable: false };
      case "repeat-save": return { code: "SUCCESS", alreadySaved: true };
      case "repeat-cancel": return { code: "SUCCESS", alreadyCancelled: true };
      case "timeout": return { code: "TEMPORARY_FAILURE", reason: "API_TIMEOUT", retryable: true };
      case "temporary": return { code: "TEMPORARY_FAILURE", reason: "API_UNAVAILABLE", retryable: true };
      default: return undefined;
    }
  }
}
