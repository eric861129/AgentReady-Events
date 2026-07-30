# AgentReady Events v3 Product Specification

## Purpose and audience

Build a small activity discovery site for frontend developers and use it to demonstrate honest WebMCP integration. Human UI remains complete without WebMCP.

## Five Tools

| Tool | Effect | Risk | API / boundary |
|---|---|---:|---|
| `search_events` | Search public events and update visible list | R0 | GET `/api/events` |
| `get_event_details` | Load one public event by opaque ID and update detail | R0 | GET `/api/events/:eventId` |
| `save_event` | Idempotently save current event with Undo | R1 | POST/DELETE `/api/saved-events` |
| `prepare_event_registration` | Fill visible registration form and stop | R2 | zero POST until human submit |
| `prepare_registration_cancellation` | Show owned cancellation summary and stop | R3 | zero cancel POST until human confirm |

No Tool named `submit_registration`, `register_event`, `cancel_registration`, or any sixth finalization capability is allowed.

## Journeys

1. Search → details → save using the same opaque event ID.
2. Prepare registration → verify zero POST → human submit.
3. Prepare cancellation → verify zero mutation → human confirm.

## Shared contracts

UI and Tool paths call the same client actions. Routes call server services. Server services own per-session records and application-level event inventory. Interaction source is audit metadata, never authorization.

## Security

Validate input at the server; use opaque Session cookie, CSRF, ownership, deadline, inventory, idempotency and a short-lived single-use confirmation intent bound to session/action/target. The intent limits replay and target substitution but is not proof of human identity. Public errors never expose stack, path, Cookie, token or CSRF values. Treat event content as untrusted. Annotations are hints, not permissions.

## Non-goals

No database, OAuth, payment, email delivery, admin panel, user-generated event creation, recommendation engine, analytics backend or production identity system. Inventory is intentionally scoped to one application process; multi-replica capacity control is outside this Demo.

## Freeze and evidence

Product features freeze at Day 22. Day 23–29 may add only tests, security, evidence, reliability, deployment and release work. Fake ModelContext/direct execute is E2; browser capability is E3; real Agent discovery/invocation is E4; clean replay is E5.
