import type { EvalCase } from "../validate-evals";

export interface RuntimeBrowserContext {
  goto(path: string): Promise<void>;
  fillLabel(label: string, value: string): Promise<void>;
  humanClick(name: string): Promise<void>;
  readRegistrationId(): Promise<string>;
}

export interface RuntimeSetupRecord {
  kind: "none" | "create_registration";
  completed: true;
  agentInvocationCount: 0;
  registrationId?: string;
}

export async function createSetup(
  evalCase: EvalCase,
  browser: RuntimeBrowserContext
): Promise<RuntimeSetupRecord> {
  if (evalCase.setup.kind === "none") {
    await browser.goto(evalCase.startPath);
    return { kind: "none", completed: true, agentInvocationCount: 0 };
  }

  await browser.goto(`/events/${evalCase.setup.eventId}/register`);
  await browser.fillLabel("姓名", evalCase.setup.attendeeName);
  await browser.fillLabel("Email", evalCase.setup.email);
  await browser.humanClick("確認報名");
  const registrationId = await browser.readRegistrationId();
  if (!/^reg-[a-z0-9-]+$/.test(registrationId)) {
    throw new Error("Visible registration setup did not return an opaque registration ID.");
  }
  await browser.goto(evalCase.startPath);
  return {
    kind: "create_registration",
    completed: true,
    agentInvocationCount: 0,
    registrationId
  };
}
