import { sanitizeActivity, type ActivityEntry, type ActivitySource } from "../../shared/activity";

const STORAGE_KEY = "agentready-events:activity:v1";
const MAX_ENTRIES = 20;

export function readActivity(): ActivityEntry[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.slice(-MAX_ENTRIES) as ActivityEntry[] : [];
  } catch {
    return [];
  }
}

export function recordActivity(action: string, source: ActivitySource, resultCode: string, metadata: Record<string, unknown> = {}): void {
  if (typeof sessionStorage === "undefined") return;
  const entry = sanitizeActivity({ source, action, resultCode, timestamp: new Date().toISOString(), metadata });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...readActivity(), entry].slice(-MAX_ENTRIES)));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("activity-recorded"));
}

export function appendActivityTimeline(root: HTMLElement): void {
  root.querySelector("[data-activity-timeline]")?.remove();
  const section = document.createElement("section");
  section.dataset.activityTimeline = "true";
  section.className = "activity-timeline";

  const header = document.createElement("div");
  header.className = "activity-heading";
  const headingCopy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "SHARED AUDIT TRAIL";
  const heading = document.createElement("h2");
  heading.textContent = "可查核操作紀錄";
  const description = document.createElement("p");
  description.textContent = "人類與 Agent 走同一套 use case；只保留動作、結果與 opaque ID。";
  headingCopy.append(eyebrow, heading, description);

  const entries = readActivity();
  const count = document.createElement("span");
  count.className = "activity-count";
  count.textContent = `${entries.length} 筆紀錄`;
  header.append(headingCopy, count);

  const list = document.createElement("ol");
  list.className = "activity-list";
  list.setAttribute("aria-label", "操作紀錄");
  for (const entry of entries) {
    const item = document.createElement("li");
    item.className = `activity-entry activity-entry-${entry.source}`;
    const identifier = entry.registrationId ?? entry.eventId;
    item.textContent = `${entry.source} · ${entry.action} · ${entry.resultCode}${identifier ? ` · ${identifier}` : ""}`;
    list.append(item);
  }
  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "activity-empty";
    empty.textContent = "完成搜尋、收藏、報名或取消後，最小操作紀錄會顯示在這裡。";
    list.append(empty);
  }
  section.append(header, list);
  root.append(section);
}
