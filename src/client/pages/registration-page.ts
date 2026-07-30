import type { RegistrationInput } from "../../shared/contracts";
import { eventDetailsRequest, registrationRequest } from "../api/client";
import { prepareRegistration, submitRegistration, type RegistrationFields } from "../services/registration-actions";
import { recordActivity } from "../ui/activity-timeline";

type AgentSubmitEvent = Event & { agentInvoked?: boolean; respondWith?: (promise: Promise<unknown>) => void };

export async function renderRegistrationPage(root: HTMLElement, eventId: string): Promise<void> {
  const event = await eventDetailsRequest(eventId);
  root.innerHTML = `
    <section class="registration-page" aria-labelledby="registration-heading">
      <a class="back-link" href="/events/${event.id}">← 回活動詳情</a>
      <header class="registration-intro">
        <div>
          <p class="eyebrow">JOURNEY 02 <span>HUMAN CONFIRMATION</span></p>
          <h1 id="registration-heading">報名</h1>
          <p>Agent 可以準備資料，最後送出必須由你確認。Tool 不會在背景建立報名，也不會替你接受活動條款。</p>
        </div>
        <div class="confirmation-stop">
          <span aria-hidden="true">!</span>
          <div>
            <strong>人類決策停點</strong>
            <p>送出後會建立一筆正式報名。</p>
          </div>
        </div>
      </header>
      <div class="registration-layout">
        <div class="registration-card">
          <section class="registration-event" aria-label="報名活動摘要">
            <p class="eyebrow">YOU ARE REGISTERING FOR</p>
            <h2 data-registration-event-title></h2>
            <p><span data-registration-event-date></span><span data-registration-event-venue></span></p>
          </section>
          <form id="registration-form" toolname="prepare_event_registration" tooldescription="替目前公開活動準備使用者可見的報名資料，並停在最終人類確認之前。">
            <input type="hidden" name="eventId">
            <div class="field">
              <label for="attendeeName">姓名</label>
              <input id="attendeeName" name="attendeeName" autocomplete="name" required maxlength="80" placeholder="請輸入參加者姓名" toolparamdescription="報名者顯示姓名。">
            </div>
            <div class="field">
              <label for="email">Email（不保存）</label>
              <input id="email" name="email" type="email" autocomplete="email" required maxlength="120" placeholder="name@example.com" toolparamdescription="只用於本次 Demo validation，不保存也不回傳。">
              <small>Email 只用於這次 Demo 驗證，不會保存。</small>
            </div>
            <div class="registration-submit">
              <button type="submit">我確認並送出報名</button>
              <p>按下按鈕前，Agent 只能停在 <code>CONFIRMATION_REQUIRED</code>。</p>
            </div>
          </form>
          <p id="registration-status" class="registration-status" role="status"></p>
        </div>
        <aside class="safety-panel" aria-labelledby="safety-title">
          <p class="eyebrow">PREPARE-ONLY CONTRACT</p>
          <h2 id="safety-title">Agent 能做什麼？</h2>
          <ol>
            <li><span>01</span><div><strong>帶入活動</strong><p>使用目前 route 上的 opaque event ID。</p></div></li>
            <li><span>02</span><div><strong>填入可見欄位</strong><p>姓名與 Email 都留在你看得見的表單。</p></div></li>
            <li><span>03</span><div><strong>停下等待確認</strong><p>回傳 CONFIRMATION_REQUIRED，POST 次數仍為 0。</p></div></li>
          </ol>
          <p class="tool-boundary"><code>prepare_event_registration</code><br>不是 <code>submit_registration</code></p>
        </aside>
      </div>
    </section>`;
  root.querySelector<HTMLElement>("#registration-heading")!.textContent = `報名 ${event.title}`;
  root.querySelector<HTMLElement>("[data-registration-event-title]")!.textContent = event.title;
  root.querySelector<HTMLElement>("[data-registration-event-date]")!.textContent =
    new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(event.startsAt));
  root.querySelector<HTMLElement>("[data-registration-event-venue]")!.textContent = event.venue;
  const form = root.querySelector<HTMLFormElement>("#registration-form")!;
  const status = root.querySelector<HTMLElement>("#registration-status")!;
  const controls = form.elements.namedItem.bind(form.elements);
  const fields: RegistrationFields = {
    eventId: controls("eventId") as HTMLInputElement,
    attendeeName: controls("attendeeName") as HTMLInputElement,
    email: controls("email") as HTMLInputElement
  };
  fields.eventId.value = event.id;
  const input = (): RegistrationInput => ({ eventId: fields.eventId.value, attendeeName: fields.attendeeName.value, email: fields.email.value });
  form.addEventListener("submit", (rawEvent) => {
    const submitEvent = rawEvent as AgentSubmitEvent;
    rawEvent.preventDefault();
    if (submitEvent.agentInvoked) {
      const result = Promise.resolve(prepareRegistration(fields, input()));
      submitEvent.respondWith?.(result);
      recordActivity("prepare_event_registration", "agent", "CONFIRMATION_REQUIRED", { eventId });
      status.dataset.state = "prepared";
      status.textContent = "資料已準備，請由使用者確認送出。";
      return;
    }
    void submitRegistration(registrationRequest, input(), { mode: "human" })
      .then(({ registration }) => {
        recordActivity("submit_registration", "human", "SUCCESS", { eventId, registrationId: registration.id });
        status.dataset.state = "success";
        status.textContent = `報名完成：${registration.eventTitle}`;
      })
      .catch((error) => {
        status.dataset.state = "error";
        status.textContent = error instanceof Error ? error.message : "報名失敗。";
      });
  });
}
