# WebMCP security policy

Public event text is untrusted data, including text that resembles an instruction. It is rendered with `textContent`, never copied into Tool names, descriptions, schemas, or authorization decisions. The malicious-copy fixture is intentionally part of this public teaching Demo so readers can reproduce the failure experiment; a real product should isolate or remove adversarial samples according to its content policy.

The server decides ownership from an opaque HttpOnly SameSite session cookie and validates CSRF on mutation. Client-supplied `interactionMode` is audit context, not authority. Registration and cancellation finalization reject declared Agent mode and also require a server-issued, five-minute, single-use confirmation intent bound to the current session, action and target. This prevents token replay and wrong-target use inside the controlled demo flow, but it does not cryptographically prove that a human clicked the button. A production high-risk flow still needs real identity, re-authentication or an equivalent user-verification mechanism.

The server owns event inventory and derives availability from the current clock, registration deadline and remaining capacity. A successful registration decrements inventory; only the first cancellation restores it. This in-memory implementation is atomic only inside one Node.js process. Multiple replicas require a transactional shared data store.

Foreign IDs return the same public-safe not-found response. Email is validated for the demo request but is neither persisted nor returned.

Annotations describe risk; they do not grant authority. v1 intentionally defines no `exposedTo`. Only `src/client/webmcp/adapter.ts` may access `document.modelContext`. Runtime evidence must omit secrets, cookies, CSRF values, personal email addresses, and private prompts.
