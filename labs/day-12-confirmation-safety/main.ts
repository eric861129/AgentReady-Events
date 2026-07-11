import { createCancellationPreparation, type CancellationPreview } from "../shared/risk";

const trigger = document.querySelector<HTMLButtonElement>("#prepare");
const dialog = document.querySelector<HTMLDialogElement>("#confirm-dialog");
const summaryNode = document.querySelector<HTMLElement>("#summary");
const countNode = document.querySelector<HTMLElement>("#count");
const keep = document.querySelector<HTMLButtonElement>("#keep");
const confirm = document.querySelector<HTMLButtonElement>("#confirm");
let mutationCount = 0;
let current: CancellationPreview | undefined;

const preparation = createCancellationPreparation(
  (summary) => {
    current = summary;
    if (summaryNode) summaryNode.textContent = `${summary.eventTitle} · ${summary.startsAt}`;
    dialog?.showModal();
    keep?.focus();
  },
  () => {
    mutationCount += 1;
    if (countNode) countNode.textContent = `Mutation count: ${mutationCount}`;
  }
);

trigger?.addEventListener("click", () => {
  void preparation.prepare({ eventTitle: "WebMCP 入門工作坊", startsAt: "2026-08-01 10:00" });
});

function closeAndRestore() {
  dialog?.close();
  trigger?.focus();
}

keep?.addEventListener("click", closeAndRestore);
dialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAndRestore();
});
confirm?.addEventListener("click", async () => {
  if (!current) return;
  confirm.disabled = true;
  await preparation.confirm(current);
  confirm.disabled = false;
  closeAndRestore();
});
