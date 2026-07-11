import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import type { DemoSession, MemoryStore } from "../store/memory-store";

const COOKIE_NAME = "are_session";

function cookieValue(header: string | undefined, name: string): string | undefined {
  for (const pair of header?.split(";") ?? []) {
    const [key, ...value] = pair.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

export function ensureSession(request: Request, response: Response, store: MemoryStore): DemoSession {
  const existing = store.getSession(cookieValue(request.headers.cookie, COOKIE_NAME));
  if (existing) return existing;
  const session = store.createSession();
  response.append("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(session.id)}; Path=/; HttpOnly; SameSite=Lax`);
  return session;
}

export function validCsrf(session: DemoSession, supplied: string | undefined): boolean {
  if (!supplied) return false;
  const expected = Buffer.from(session.csrfToken);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
