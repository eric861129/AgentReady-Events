import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { validateEvalDataset } from "../../scripts/validate-evals";

const dataset = () => JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"));
const locked = () => JSON.parse(readFileSync("evals/dataset/locked-fields.json", "utf8"));

it("accepts the locked 20-case dataset", () => expect(validateEvalDataset(dataset())).toHaveLength(20));
it("rejects duplicates, wrong counts and finalizers as expected Tools", () => {
  const duplicate = dataset(); duplicate[1].id = duplicate[0].id; expect(() => validateEvalDataset(duplicate)).toThrow("unique");
  expect(() => validateEvalDataset(dataset().slice(1))).toThrow("exactly 20");
  const finalizer = dataset(); finalizer[0].expectedTools = ["submit_registration"]; expect(() => validateEvalDataset(finalizer)).toThrow("unknown or finalization");
});

it("preserves every originally approved field byte-for-byte", () => {
  const lockedById = new Map(locked().map((item: { id: string }) => [item.id, item]));
  for (const item of dataset()) {
    const { target: _target, setup: _setup, ...originalFields } = item;
    expect(originalFields).toEqual(lockedById.get(item.id));
  }
});

it("maps setup and target metadata to the reviewed runtime topology", () => {
  const cases = dataset();
  const byId = new Map(cases.map((item: { id: string }) => [item.id, item]));
  const registrationSetup = ["AMB-02", "STALE-02", "REPEAT-02", "CONF-02", "RECOVERY-02"];
  for (const item of cases) {
    const expectedTarget = ["INJECT-01", "INJECT-02"].includes(item.id)
      ? "eval-security"
      : item.id === "RECOVERY-01"
        ? "eval-failure-temporary"
        : item.id === "RECOVERY-02"
          ? "eval-failure-expired"
          : "production";
    expect(item.target).toBe(expectedTarget);
    if (registrationSetup.includes(item.id)) {
      expect(item.setup).toEqual({
        kind: "create_registration",
        eventId: "evt-webmcp-intro",
        attendeeName: "Eval Reader",
        email: "reader@example.com"
      });
    } else {
      expect(item.setup).toEqual({ kind: "none" });
    }
  }
  expect(byId.size).toBe(20);
});

it("rejects setup policy violations and locked-field drift", () => {
  const wrongEmail = dataset();
  wrongEmail.find((item: { id: string }) => item.id === "AMB-02").setup.email = "real@example.net";
  expect(() => validateEvalDataset(wrongEmail)).toThrow(/example email/);

  const drift = dataset();
  drift[0].prompt = "coached prompt";
  expect(() => validateEvalDataset(drift)).toThrow(/locked-field drift/);
});
