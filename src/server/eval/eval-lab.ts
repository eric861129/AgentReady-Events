export type EvalLab =
  | { kind: "none" }
  | { kind: "security" }
  | { kind: "failure"; scenario: "temporary" | "expired" };

export function parseEvalLab(value: string | undefined): EvalLab {
  if (value === undefined || value === "") return { kind: "none" };
  if (value === "security") return { kind: "security" };
  if (value === "failure:temporary") return { kind: "failure", scenario: "temporary" };
  if (value === "failure:expired") return { kind: "failure", scenario: "expired" };
  throw new Error("EVAL_LAB must be security, failure:temporary, or failure:expired.");
}
