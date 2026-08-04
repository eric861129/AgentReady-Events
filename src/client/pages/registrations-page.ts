import type { CancellationSummary } from "../../shared/contracts";
import {
  cancellationRequest,
  cancellationSummaryRequest,
  expireCurrentSessionForEvaluationRequest,
  registrationsRequest,
  sessionRequest
} from "../api/client";
import { createConfirmationDialog } from "../ui/confirmation-dialog";
import { createPrepareCancellationTool } from "../webmcp/tools/prepare-cancellation";
import type { AnyProjectTool } from "../webmcp/registry";
import { recordActivity } from "../ui/activity-timeline";

export async function renderRegistrationsPage(root: HTMLElement): Promise<AnyProjectTool[]> {
  const page = document.createElement("section");
  page.className = "registrations-page";

  const intro = document.createElement("header");
  intro.className = "page-intro registrations-intro";
  const introCopy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "JOURNEY 03 · HUMAN AUTHORITY";
  const heading = document.createElement("h1");
  heading.textContent = "我的報名";
  const description = document.createElement("p");
  description.textContent = "查看有效與已取消的活動。需要取消時，先準備後果摘要，再由你完成最後確認。";
  introCopy.append(eyebrow, heading, description);
  const introNote = document.createElement("aside");
  introNote.className = "page-intro-note";
  const introNoteTitle = document.createElement("strong");
  introNoteTitle.textContent = "取消前先看清楚後果";
  const introNoteCopy = document.createElement("span");
  introNoteCopy.textContent = "prepare_registration_cancellation 只開啟對話框，不會直接取消。";
  introNote.append(introNoteTitle, introNoteCopy);
  intro.append(introCopy, introNote);

  const status = document.createElement("p");
  status.className = "registrations-status";
  status.setAttribute("role", "status");
  const list = document.createElement("ol");
  list.className = "registration-list";
  list.setAttribute("aria-label", "我的報名列表");
  const session = await sessionRequest();
  const registrations = await registrationsRequest();
  const activeRegistrationIds = new Set(
    registrations.filter((registration) => registration.status === "active").map((registration) => registration.id)
  );
  let stateVersion = 1;
  const updateCancelled = (registrationId: string) => {
    activeRegistrationIds.delete(registrationId);
    const item = list.querySelector<HTMLElement>(`[data-registration-id="${registrationId}"]`);
    item?.querySelector("button")?.remove();
    const state = item?.querySelector<HTMLElement>("[data-registration-status]");
    if (state) {
      state.textContent = "已取消";
      state.className = "registration-state registration-state-cancelled";
    }
    status.textContent = "已取消報名";
    status.dataset.state = "success";
    stateVersion += 1;
  };
  const dialogApi = createConfirmationDialog(async (summary) => {
    await cancellationRequest(summary.registrationId, { mode: "human" });
    recordActivity("cancel_registration", "human", "SUCCESS", { eventId: summary.eventId, registrationId: summary.registrationId });
    updateCancelled(summary.registrationId);
  });
  const showSummary = (summary: CancellationSummary, trigger?: HTMLElement) => dialogApi.show(summary, trigger);
  for (const registration of registrations) {
    const item = document.createElement("li");
    item.className = "registration-item";
    item.dataset.registrationId = registration.id;
    const cardContent = document.createElement("div");
    cardContent.className = "registration-item-content";
    const state = document.createElement("span");
    state.dataset.registrationStatus = "true";
    state.className = registration.status === "active"
      ? "registration-state registration-state-active"
      : "registration-state registration-state-cancelled";
    state.textContent = registration.status === "active" ? "報名有效" : "已取消";
    const title = document.createElement("h2");
    title.textContent = registration.eventTitle;
    const details = document.createElement("p");
    const date = document.createElement("time");
    date.dateTime = registration.startsAt;
    date.textContent = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(registration.startsAt));
    const attendee = document.createElement("span");
    attendee.textContent = `參加者：${registration.attendeeName}`;
    details.append(date, attendee);
    const identifier = document.createElement("code");
    identifier.textContent = registration.id;
    cardContent.append(state, title, details, identifier);

    const actions = document.createElement("div");
    actions.className = "registration-item-actions";
    if (registration.status === "active") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-secondary";
      button.textContent = "準備取消";
      button.addEventListener("click", async () => {
        const summary = await cancellationSummaryRequest(registration.id);
        recordActivity("prepare_registration_cancellation", "human", "CONFIRMATION_REQUIRED", { eventId: summary.eventId, registrationId: summary.registrationId });
        showSummary(summary, button);
      });
      actions.append(button);
    }
    item.append(cardContent, actions);
    list.append(item);
  }
  if (registrations.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "目前沒有報名紀錄。先從活動列表找到適合的場次吧。";
    list.append(empty);
  }

  const listSection = document.createElement("section");
  listSection.className = "registrations-list-section";
  const listHeading = document.createElement("div");
  listHeading.className = "results-heading";
  const listHeadingCopy = document.createElement("div");
  const listEyebrow = document.createElement("p");
  listEyebrow.className = "eyebrow";
  listEyebrow.textContent = "REGISTRATION RECORDS";
  const listTitle = document.createElement("h2");
  listTitle.textContent = "報名紀錄";
  listHeadingCopy.append(listEyebrow, listTitle);
  const count = document.createElement("p");
  count.textContent = `${registrations.length} 筆紀錄`;
  listHeading.append(listHeadingCopy, count);
  listSection.append(listHeading, list, status);

  const evaluationControls = document.createElement("section");
  if (session.evaluationFixturesEnabled) {
    evaluationControls.className = "evaluation-controls";
    evaluationControls.setAttribute("role", "region");
    evaluationControls.setAttribute("aria-labelledby", "evaluation-controls-title");
    const evaluationCopy = document.createElement("div");
    const evaluationEyebrow = document.createElement("p");
    evaluationEyebrow.className = "eyebrow";
    evaluationEyebrow.textContent = "CONTROLLED EVALUATION FIXTURE";
    const evaluationTitle = document.createElement("h2");
    evaluationTitle.id = "evaluation-controls-title";
    evaluationTitle.textContent = "受控測試工具";
    const evaluationDescription = document.createElement("p");
    evaluationDescription.textContent = "只在 evaluation 模式顯示。用同一個分頁建立 SESSION_EXPIRED 前置條件，再回到 Inspector 執行 RECOVERY-02。";
    evaluationCopy.append(evaluationEyebrow, evaluationTitle, evaluationDescription);
    const evaluationAction = document.createElement("div");
    evaluationAction.className = "evaluation-controls-action";
    const expireButton = document.createElement("button");
    expireButton.type = "button";
    expireButton.className = "button button-secondary";
    expireButton.textContent = "讓目前工作階段過期";
    const evaluationStatus = document.createElement("p");
    expireButton.addEventListener("click", async () => {
      expireButton.disabled = true;
      evaluationStatus.setAttribute("role", "status");
      try {
        await expireCurrentSessionForEvaluationRequest();
        evaluationStatus.dataset.state = "ready";
        evaluationStatus.textContent = "SESSION_EXPIRED 已建立。請勿重新整理，直接在 Inspector 執行取消準備。";
      } catch (error) {
        expireButton.disabled = false;
        evaluationStatus.dataset.state = "error";
        evaluationStatus.textContent = error instanceof Error ? error.message : "無法建立測試前置條件。";
      }
    });
    evaluationAction.append(expireButton, evaluationStatus);
    evaluationControls.append(evaluationCopy, evaluationAction);
  }

  page.append(intro, listSection);
  if (session.evaluationFixturesEnabled) page.append(evaluationControls);
  page.append(dialogApi.element);
  root.replaceChildren(page);
  if (activeRegistrationIds.size === 0) return [];
  return [createPrepareCancellationTool({
    load: cancellationSummaryRequest,
    show: (summary) => showSummary(summary),
    cancel: cancellationRequest,
    getStateVersion: () => stateVersion,
    getDefaultRegistrationId: () => activeRegistrationIds.size === 1
      ? activeRegistrationIds.values().next().value
      : undefined
  })];
}
