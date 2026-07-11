import type { RegistrationInput } from "../../shared/contracts";
import { eventDetailsRequest, registrationRequest } from "../api/client";
import { prepareRegistration, submitRegistration, type RegistrationFields } from "../services/registration-actions";
import { recordActivity } from "../ui/activity-timeline";

type AgentSubmitEvent = Event & { agentInvoked?: boolean; respondWith?: (promise: Promise<unknown>) => void };

export async function renderRegistrationPage(root: HTMLElement, eventId: string): Promise<void> {
  const event = await eventDetailsRequest(eventId);
  root.innerHTML = `
    <h1>報名 ${event.title}</h1>
    <p>Agent 可以準備資料，最後送出必須由你確認。</p>
    <form id="registration-form" toolname="prepare_event_registration" tooldescription="替目前公開活動準備使用者可見的報名資料，並停在最終人類確認之前。">
      <input type="hidden" name="eventId" value="${event.id}">
      <label for="attendeeName">姓名</label><input id="attendeeName" name="attendeeName" required maxlength="80" toolparamdescription="報名者顯示姓名。">
      <label for="email">Email（不保存）</label><input id="email" name="email" type="email" required maxlength="120" toolparamdescription="只用於本次 Demo validation，不保存也不回傳。">
      <button type="submit">我確認並送出報名</button>
    </form>
    <p id="registration-status" role="status"></p>`;
  const form = root.querySelector<HTMLFormElement>("#registration-form")!;
  const status = root.querySelector<HTMLElement>("#registration-status")!;
  const controls = form.elements.namedItem.bind(form.elements);
  const fields: RegistrationFields = {
    eventId: controls("eventId") as HTMLInputElement,
    attendeeName: controls("attendeeName") as HTMLInputElement,
    email: controls("email") as HTMLInputElement
  };
  const input = (): RegistrationInput => ({ eventId: fields.eventId.value, attendeeName: fields.attendeeName.value, email: fields.email.value });
  form.addEventListener("submit", (rawEvent) => {
    const submitEvent = rawEvent as AgentSubmitEvent;
    rawEvent.preventDefault();
    if (submitEvent.agentInvoked) {
      const result = Promise.resolve(prepareRegistration(fields, input()));
      submitEvent.respondWith?.(result);
      recordActivity("prepare_event_registration", "agent", "CONFIRMATION_REQUIRED", { eventId });
      status.textContent = "資料已準備，請由使用者確認送出。";
      return;
    }
    void submitRegistration(registrationRequest, input(), { mode: "human" })
      .then(({ registration }) => {
        recordActivity("submit_registration", "human", "SUCCESS", { eventId, registrationId: registration.id });
        status.textContent = `報名完成：${registration.eventTitle}`;
      })
      .catch((error) => { status.textContent = error instanceof Error ? error.message : "報名失敗。"; });
  });
}
