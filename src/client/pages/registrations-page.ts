import type { CancellationSummary, RegistrationListItem } from "../../shared/contracts";
import { cancellationRequest, cancellationSummaryRequest, registrationsRequest } from "../api/client";
import { createConfirmationDialog } from "../ui/confirmation-dialog";
import { createPrepareCancellationTool } from "../webmcp/tools/prepare-cancellation";
import type { AnyProjectTool } from "../webmcp/registry";

export async function renderRegistrationsPage(root: HTMLElement): Promise<AnyProjectTool[]> {
  const heading = document.createElement("h1");
  heading.textContent = "我的報名";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const list = document.createElement("ol");
  list.setAttribute("aria-label", "我的報名列表");
  const registrations = await registrationsRequest();
  let stateVersion = 1;
  let dialogApi: ReturnType<typeof createConfirmationDialog>;
  const updateCancelled = (registrationId: string) => {
    const item = list.querySelector<HTMLElement>(`[data-registration-id="${registrationId}"]`);
    item?.querySelector("button")?.remove();
    item?.append(document.createTextNode(" · 已取消"));
    status.textContent = "已取消報名";
    stateVersion += 1;
  };
  dialogApi = createConfirmationDialog(async (summary) => {
    await cancellationRequest(summary.registrationId, { mode: "human" });
    updateCancelled(summary.registrationId);
  });
  const showSummary = (summary: CancellationSummary, trigger?: HTMLElement) => dialogApi.show(summary, trigger);
  for (const registration of registrations) {
    const item = document.createElement("li");
    item.dataset.registrationId = registration.id;
    item.append(document.createTextNode(`${registration.eventTitle} · ${registration.startsAt} · ${registration.status}`));
    if (registration.status === "active") {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "準備取消";
      button.addEventListener("click", async () => showSummary(await cancellationSummaryRequest(registration.id), button));
      item.append(document.createTextNode(" "), button);
    }
    list.append(item);
  }
  root.replaceChildren(heading, list, status, dialogApi.element);
  const active = registrations.find((registration: RegistrationListItem) => registration.status === "active");
  if (!active) return [];
  return [createPrepareCancellationTool({ load: cancellationSummaryRequest, show: (summary) => showSummary(summary), cancel: cancellationRequest, getStateVersion: () => stateVersion })];
}
