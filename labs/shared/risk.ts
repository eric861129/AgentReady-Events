export const RISK_LEVELS = {
  search: "R0",
  details: "R0",
  save: "R1",
  registration: "R2",
  cancellation: "R3"
} as const;

export type CancellationPreview = { eventTitle: string; startsAt: string };

export function createCancellationPreparation(
  showSummary: (summary: CancellationPreview) => void,
  mutate: (summary: CancellationPreview) => void | Promise<void>
) {
  return {
    async prepare(summary: CancellationPreview) {
      showSummary(summary);
      return { ok: false as const, code: "CONFIRMATION_REQUIRED" as const, retryable: false, summary };
    },
    async confirm(summary: CancellationPreview) {
      await mutate(summary);
      return { ok: true as const, code: "SUCCESS" as const };
    }
  };
}
