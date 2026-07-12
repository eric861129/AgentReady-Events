# WebMCP security policy

Public event text is untrusted data, including text that resembles an instruction. It is rendered with `textContent`, never copied into Tool names, descriptions, schemas, or authorization decisions. The malicious fixture exists only as an imported security-test fixture; production defaults never load it.

The server decides ownership from an opaque HttpOnly SameSite session cookie and validates CSRF on mutation. Client-supplied `interactionMode` is audit context, not authority: registration and cancellation finalization reject Agent mode. Foreign IDs return the same public-safe not-found response. Email is validated for the demo request but is neither persisted nor returned.

Annotations describe risk; they do not grant authority. v1 intentionally defines no `exposedTo`. Only `src/client/webmcp/adapter.ts` may access `document.modelContext`. Runtime evidence must omit secrets, cookies, CSRF values, personal email addresses, and private prompts.

Azure production may receive one origin-bound Chrome Origin Trial token at process startup. The server validates the value before installing a response-header middleware, never logs it, and never returns it from health or API payloads. An absent token produces no `Origin-Trial` header.

Eval Lab is parsed once from `EVAL_LAB` during process startup. Only `security`, `failure:temporary`, and `failure:expired` are accepted. Query strings, headers, and request bodies cannot select a lab. Normal production uses `{ kind: "none" }`, excludes the hostile event from public data, and receives no injected failure policy.
