import type { CancellationSummary } from "../../shared/contracts";

export function createConfirmationDialog(onConfirm: (summary: CancellationSummary) => Promise<void>) {
  const dialog = document.createElement("dialog");
  dialog.className = "confirmation-dialog";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Agent 已停下來";
  const title = document.createElement("h2");
  title.id = "cancellation-dialog-title";
  title.textContent = "確認取消報名";
  dialog.setAttribute("aria-labelledby", title.id);
  const content = document.createElement("p");
  content.className = "confirmation-summary";
  const warning = document.createElement("div");
  warning.className = "confirmation-consequence";
  const warningTitle = document.createElement("strong");
  warningTitle.textContent = "這是最後的人類確認";
  const warningCopy = document.createElement("p");
  warningCopy.textContent = "按下確認取消後，這筆報名會立即失效；Agent 無法替你執行這一步。";
  warning.append(warningTitle, warningCopy);
  const actions = document.createElement("div");
  actions.className = "confirmation-actions";
  const keep = document.createElement("button");
  keep.type = "button";
  keep.className = "button button-secondary";
  keep.textContent = "保留報名";
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "button button-danger";
  confirm.textContent = "確認取消";
  actions.append(keep, confirm);
  dialog.append(eyebrow, title, content, warning, actions);
  let trigger: HTMLElement | undefined;
  let current: CancellationSummary | undefined;
  const close = () => { dialog.close(); trigger?.focus(); };
  keep.addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
  confirm.addEventListener("click", async () => {
    if (!current) return;
    confirm.disabled = true;
    try { await onConfirm(current); close(); } finally { confirm.disabled = false; }
  });
  return {
    element: dialog,
    show(summary: CancellationSummary, source?: HTMLElement) {
      current = summary;
      trigger = source ?? document.activeElement as HTMLElement;
      content.textContent = `${summary.eventTitle} · ${summary.startsAt}。${summary.effect}`;
      dialog.showModal();
      keep.focus();
    }
  };
}
