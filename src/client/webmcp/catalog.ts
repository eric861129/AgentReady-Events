export const APPROVED_TOOL_NAMES = [
  "search_events",
  "get_event_details",
  "save_event",
  "prepare_event_registration",
  "prepare_registration_cancellation"
] as const;

export const IMPERATIVE_TOOL_ANNOTATIONS = {
  get_event_details: { readOnlyHint: true, untrustedContentHint: true },
  save_event: { readOnlyHint: false, untrustedContentHint: true },
  prepare_registration_cancellation: { readOnlyHint: true, untrustedContentHint: true }
} as const;
