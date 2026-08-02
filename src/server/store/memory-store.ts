import { randomUUID } from "node:crypto";
import type { EventDetail, RegistrationListItem } from "../../shared/contracts";
import { EventInventory, type Clock } from "./event-inventory";

export type ConfirmationAction = "submit_registration" | "cancel_registration";

type ConfirmationIntent = {
  token: string;
  action: ConfirmationAction;
  targetId: string;
  expiresAt: number;
};

export type DemoSession = {
  id: string;
  csrfToken: string;
  expiresAt: number;
  savedEventIds: Set<string>;
  registrations: Map<string, RegistrationListItem>;
  confirmationIntents: Map<string, ConfirmationIntent>;
};

export class MemoryStore {
  private readonly sessions = new Map<string, DemoSession>();
  readonly inventory: EventInventory;

  constructor(
    events: EventDetail[],
    private readonly now: Clock,
    private readonly sessionTtlMs = 4 * 60 * 60 * 1000
  ) {
    this.inventory = new EventInventory(events, now);
  }

  createSession(): DemoSession {
    const session: DemoSession = {
      id: randomUUID(),
      csrfToken: randomUUID(),
      expiresAt: this.now().getTime() + this.sessionTtlMs,
      savedEventIds: new Set<string>(),
      registrations: new Map<string, RegistrationListItem>(),
      confirmationIntents: new Map<string, ConfirmationIntent>()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string | undefined): DemoSession | undefined {
    return id ? this.sessions.get(id) : undefined;
  }

  isSessionExpired(session: DemoSession): boolean {
    return this.now().getTime() >= session.expiresAt;
  }

  expireSession(session: DemoSession): void {
    session.expiresAt = this.now().getTime() - 1;
    session.confirmationIntents.clear();
  }

  createConfirmationIntent(session: DemoSession, action: ConfirmationAction, targetId: string) {
    const intent: ConfirmationIntent = {
      token: randomUUID(),
      action,
      targetId,
      expiresAt: this.now().getTime() + 5 * 60 * 1000
    };
    session.confirmationIntents.set(intent.token, intent);
    return {
      token: intent.token,
      action: intent.action,
      targetId: intent.targetId,
      expiresAt: new Date(intent.expiresAt).toISOString()
    };
  }

  consumeConfirmationIntent(
    session: DemoSession,
    token: unknown,
    action: ConfirmationAction,
    targetId: string
  ): boolean {
    if (typeof token !== "string") return false;
    const intent = session.confirmationIntents.get(token);
    session.confirmationIntents.delete(token);
    return Boolean(
      intent &&
      intent.action === action &&
      intent.targetId === targetId &&
      this.now().getTime() <= intent.expiresAt
    );
  }
}
