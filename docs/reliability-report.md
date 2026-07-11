# Day 28 Failure Lab

Six deterministic scenarios lock the public result vocabulary: expired session and full event are non-retryable; repeat save and repeat cancel are successful idempotent outcomes; timeout and temporary outage are retryable. `FailurePolicy` can only be passed from application code to `createApp` in a test process. Query strings and headers cannot switch it on, so the public demo cannot become a chaos endpoint by accident.

The Day 27 baseline failed before Tool discovery, so description, schema, availability and handoff changes would be prompt shopping rather than evidence-based repair. Revision 2 therefore makes zero Tool-contract changes and preserves the same 20 environment-classified failures. This is the bounded decision: fix the environment with an authorized HTTPS host and compatible Codex surface before changing product semantics.
