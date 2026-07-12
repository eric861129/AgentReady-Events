import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  validateAzureBaseline,
  validateAzureRuntimeResult,
  type AzureRuntimeResult
} from "../../scripts/evals/validate-runtime-result";

const datasetBytes = readFileSync("evals/dataset/webmcp-evals.json");
const datasetHash = createHash("sha256").update(datasetBytes).digest("hex");
const digest = `sha256:${"a".repeat(64)}`;

const base: AzureRuntimeResult = {
  caseId: "SEL-01",
  datasetHash,
  imageDigest: digest,
  fqdn: "ca-agentready-events.example.eastasia.azurecontainerapps.io",
  codexTask: { id: "task-123", clean: false },
  browser: { name: "Chrome", version: "150.0.0", secureContext: true },
  setup: { kind: "none", completed: true, agentInvocationCount: 0 },
  evidenceLevel: "E4",
  discoveredTools: [{ name: "search_events", schema: { type: "object" } }],
  invocations: [{ tool: "search_events", arguments: {}, phase: "agent" }],
  outcome: { status: "pass", cause: "expected-behavior" }
};

it("requires complete Azure, Codex, browser, and dataset provenance", () => {
  expect(() => validateAzureRuntimeResult(base)).not.toThrow();
  for (const field of ["caseId", "datasetHash", "imageDigest", "fqdn"] as const) {
    expect(() => validateAzureRuntimeResult({ ...base, [field]: "" })).toThrow();
  }
  expect(() => validateAzureRuntimeResult({ ...base, codexTask: { id: "", clean: false } })).toThrow(
    /Codex task/
  );
  expect(() => validateAzureRuntimeResult({ ...base, browser: { ...base.browser, version: "" } })).toThrow(
    /browser version/
  );
});

it("requires visible setup evidence without counting setup as Agent work", () => {
  const registrationCase: AzureRuntimeResult = {
    ...base,
    caseId: "AMB-02",
    evidenceLevel: "E3",
    setup: {
      kind: "create_registration",
      completed: true,
      agentInvocationCount: 0,
      registrationId: "reg-opaque"
    },
    discoveredTools: [],
    invocations: [],
    outcome: { status: "pass", cause: "clarified-ambiguity" }
  };
  expect(() => validateAzureRuntimeResult(registrationCase)).not.toThrow();
  expect(() => validateAzureRuntimeResult({ ...registrationCase, setup: { ...registrationCase.setup, agentInvocationCount: 1 } })).toThrow(/setup calls/);
  expect(() => validateAzureRuntimeResult({ ...registrationCase, setup: { kind: "none", completed: true, agentInvocationCount: 0 } })).toThrow(/setup evidence/);
});

it("prevents inflated E4/E5 and forbidden finalizers", () => {
  expect(() => validateAzureRuntimeResult({ ...base, discoveredTools: [] })).toThrow(/E4/);
  expect(() => validateAzureRuntimeResult({ ...base, invocations: [] })).toThrow(/E4/);
  expect(() =>
    validateAzureRuntimeResult({
      ...base,
      evidenceLevel: "E5",
      codexTask: { id: "clean-task", clean: true },
      cleanContext: true,
      e4Reference: ""
    })
  ).toThrow(/E5/);
  expect(() =>
    validateAzureRuntimeResult({
      ...base,
      caseId: "CONF-01",
      invocations: [{ tool: "submit_registration", arguments: {}, phase: "agent" }]
    })
  ).toThrow(/forbidden Tool/);
});

it("rejects sensitive keys and values", () => {
  expect(() => validateAzureRuntimeResult({ ...base, metadata: { token: "secret" } })).toThrow(/sensitive key/i);
  expect(() => validateAzureRuntimeResult({ ...base, outcome: { status: "fail", cause: "sent real@example.net" } })).toThrow(/sensitive value/i);
});

it("requires exactly one result for each of the 20 locked cases", () => {
  const dataset = JSON.parse(datasetBytes.toString()) as Array<{ id: string; setup: { kind: string } }>;
  const results = dataset.map((item) => ({
    ...base,
    caseId: item.id,
    evidenceLevel: "ENVIRONMENT_FAILURE" as const,
    setup:
      item.setup.kind === "create_registration"
        ? { kind: "create_registration" as const, completed: true, agentInvocationCount: 0, registrationId: "reg-opaque" }
        : { kind: "none" as const, completed: true, agentInvocationCount: 0 },
    discoveredTools: [],
    invocations: [],
    outcome: { status: "environment-failure" as const, cause: "modelContext-unavailable" }
  }));
  expect(() => validateAzureBaseline(results)).not.toThrow();
  expect(() => validateAzureBaseline(results.slice(1))).toThrow(/exactly 20/);
  expect(() => validateAzureBaseline([...results.slice(0, 19), results[0]!])).toThrow(/unique/);
});
