export type AppRoute =
  | { kind: "events" }
  | { kind: "event-detail"; eventId: string }
  | { kind: "registration"; eventId: string }
  | { kind: "registrations" }
  | { kind: "home" };

export function parseRoute(pathname: string): AppRoute {
  if (pathname === "/events") return { kind: "events" };
  const registration = /^\/events\/([a-z0-9_-]+)\/register$/.exec(pathname);
  if (registration?.[1]) return { kind: "registration", eventId: registration[1] };
  const detail = /^\/events\/([a-z0-9_-]+)$/.exec(pathname);
  if (detail?.[1]) return { kind: "event-detail", eventId: detail[1] };
  if (pathname === "/registrations") return { kind: "registrations" };
  return { kind: "home" };
}
