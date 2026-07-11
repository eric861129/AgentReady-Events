export type ActivitySource = "human" | "agent";

export type ActivityEntry = {
  source: ActivitySource;
  action: string;
  resultCode: string;
  timestamp: string;
  eventId?: string;
  registrationId?: string;
};

type ActivityCandidate = Omit<ActivityEntry, "eventId" | "registrationId"> & {
  metadata?: Record<string, unknown>;
};

export function sanitizeActivity(candidate: ActivityCandidate): ActivityEntry {
  const entry: ActivityEntry = {
    source: candidate.source,
    action: candidate.action,
    resultCode: candidate.resultCode,
    timestamp: candidate.timestamp
  };
  if (typeof candidate.metadata?.eventId === "string") entry.eventId = candidate.metadata.eventId;
  if (typeof candidate.metadata?.registrationId === "string") entry.registrationId = candidate.metadata.registrationId;
  return entry;
}
