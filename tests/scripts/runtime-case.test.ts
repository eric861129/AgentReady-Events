import { expect, it, vi } from "vitest";
import { createSetup } from "../../scripts/evals/runtime-case";
import type { EvalCase } from "../../scripts/validate-evals";

const base: Omit<EvalCase, "setup"> = {
  id: "SEL-01",
  category: "tool_selection",
  startPath: "/events",
  resetSession: true,
  prompt: "prompt",
  expectedTools: [],
  forbiddenTools: [],
  expectedOutcome: "outcome",
  requiresHumanConfirmation: false,
  target: "production"
};

it("navigates setup-free cases directly to their start path", async () => {
  const browser = {
    goto: vi.fn().mockResolvedValue(undefined),
    fillLabel: vi.fn(),
    humanClick: vi.fn(),
    readRegistrationId: vi.fn()
  };
  await expect(createSetup({ ...base, setup: { kind: "none" } }, browser)).resolves.toEqual({
    kind: "none",
    completed: true,
    agentInvocationCount: 0
  });
  expect(browser.goto).toHaveBeenCalledWith("/events");
  expect(browser.humanClick).not.toHaveBeenCalled();
});

it("creates registration setup through visible human controls", async () => {
  const calls: string[] = [];
  const browser = {
    goto: vi.fn(async (path: string) => { calls.push(`goto:${path}`); }),
    fillLabel: vi.fn(async (label: string, value: string) => { calls.push(`fill:${label}:${value}`); }),
    humanClick: vi.fn(async (name: string) => { calls.push(`click:${name}`); }),
    readRegistrationId: vi.fn(async () => "reg-opaque")
  };
  const evalCase = {
    ...base,
    id: "AMB-02",
    startPath: "/registrations",
    setup: {
      kind: "create_registration",
      eventId: "evt-webmcp-intro",
      attendeeName: "Eval Reader",
      email: "reader@example.com"
    }
  } as EvalCase;
  await expect(createSetup(evalCase, browser)).resolves.toMatchObject({
    kind: "create_registration",
    registrationId: "reg-opaque",
    agentInvocationCount: 0
  });
  expect(calls).toEqual([
    "goto:/events/evt-webmcp-intro/register",
    "fill:姓名:Eval Reader",
    "fill:Email:reader@example.com",
    "click:確認報名",
    "goto:/registrations"
  ]);
});
