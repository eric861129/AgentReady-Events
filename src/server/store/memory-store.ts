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
  savedEventIds: Set<string>;
  registrations: Map<string, RegistrationListItem>;
  confirmationIntents: Map<string, ConfirmationIntent>;
};

export class MemoryStore {
  private readonly sessions = new Map<string, DemoSession>();
  readonly inventory: EventInventory;

  constructor(
    events: EventDetail[],
    private readonly now: Clock
  ) {
    this.inventory = new EventInventory(events, now);
  }

  createSession(): DemoSession {
    const session = {
      id: randomUUID(),
      csrfToken: randomUUID(),
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
