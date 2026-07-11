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
  const heading = document.createElement("h2");
  heading.textContent = "人類與 Agent 操作紀錄";
  const list = document.createElement("ol");
  list.setAttribute("aria-label", "操作紀錄");
  for (const entry of readActivity()) {
    const item = document.createElement("li");
    const identifier = entry.registrationId ?? entry.eventId;
    item.textContent = `${entry.source} · ${entry.action} · ${entry.resultCode}${identifier ? ` · ${identifier}` : ""}`;
    list.append(item);
  }
  section.append(heading, list);
  root.append(section);
}
