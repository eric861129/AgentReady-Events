import { randomUUID } from "node:crypto";
import type { RegistrationListItem } from "../../shared/contracts";

export type DemoSession = {
  id: string;
  csrfToken: string;
  savedEventIds: Set<string>;
  registrations: Map<string, RegistrationListItem>;
};

export class MemoryStore {
  private readonly sessions = new Map<string, DemoSession>();

  createSession(): DemoSession {
    const session = { id: randomUUID(), csrfToken: randomUUID(), savedEventIds: new Set<string>(), registrations: new Map<string, RegistrationListItem>() };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string | undefined): DemoSession | undefined {
    return id ? this.sessions.get(id) : undefined;
  }
}
