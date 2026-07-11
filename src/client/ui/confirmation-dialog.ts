import type { CancellationSummary } from "../../shared/contracts";

export function createConfirmationDialog(onConfirm: (summary: CancellationSummary) => Promise<void>) {
  const dialog = document.createElement("dialog");
  const title = document.createElement("h2");
  title.id = "cancellation-dialog-title";
  title.textContent = "確認取消報名";
  dialog.setAttribute("aria-labelledby", title.id);
  const content = document.createElement("p");
  const keep = document.createElement("button");
  keep.type = "button";
  keep.textContent = "保留報名";
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.textContent = "確認取消";
  dialog.append(title, content, keep, confirm);
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
