import type { EventDetail } from "../../shared/contracts";

export type Clock = () => Date;

type InventoryRecord = {
  event: EventDetail;
  maximumCapacity: number;
};

export type ReserveSeatResult =
  | { kind: "reserved"; event: EventDetail }
  | { kind: "not-found" }
  | { kind: "unavailable"; reason: "EVENT_NOT_OPEN" };

/**
 * 保存單一應用程式執行個體內的活動名額，並以注入時鐘推導報名狀態。
 * 正式多執行個體環境仍應改用具交易與鎖定能力的資料庫。
 */
export class EventInventory {
  private readonly records = new Map<string, InventoryRecord>();

  constructor(
    events: EventDetail[],
    private readonly now: Clock
  ) {
    for (const event of events) {
      this.records.set(event.id, {
        event: structuredClone(event),
        maximumCapacity: event.remainingCapacity
      });
    }
  }

  list(): EventDetail[] {
    return [...this.records.values()].map(({ event }) => this.snapshot(event));
  }

  find(eventId: string): EventDetail | undefined {
    const record = this.records.get(eventId);
    return record ? this.snapshot(record.event) : undefined;
  }

  reserve(eventId: string): ReserveSeatResult {
    const record = this.records.get(eventId);
    if (!record) return { kind: "not-found" };
    const current = this.snapshot(record.event);
    if (current.state !== "open") return { kind: "unavailable", reason: "EVENT_NOT_OPEN" };

    record.event.remainingCapacity -= 1;
    return { kind: "reserved", event: this.snapshot(record.event) };
  }

  release(eventId: string): boolean {
    const record = this.records.get(eventId);
    if (!record || record.event.remainingCapacity >= record.maximumCapacity) return false;
    record.event.remainingCapacity += 1;
    return true;
  }

  private snapshot(event: EventDetail): EventDetail {
    const remainingCapacity = event.remainingCapacity;
    const deadlinePassed = this.now().getTime() > new Date(event.registrationDeadline).getTime();
    const state =
      event.state === "closed" || deadlinePassed
        ? "closed"
        : remainingCapacity < 1 || event.state === "full"
          ? "full"
          : "open";
    return { ...event, remainingCapacity, state };
  }
}
