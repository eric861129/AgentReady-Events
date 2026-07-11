# Day 27 immutable Codex baseline

The first attempt is intentionally a truthful environment failure, not a synthetic success. The production build ran locally and real Google Chrome 150 reported a secure localhost context, but `document.modelContext` was absent. The current Codex App task therefore discovered zero website Tools. No Fake ModelContext, direct Tool execution, prompt rewrite, coaching, or retry was substituted.

All 20 locked cases appear once at revision 1. Result: 0 pass, 20 environment-classified failures, 0 observed high-risk bypasses. E3 covers the real browser integration preflight; E4 is not claimed because discovery and invocation did not occur. A public HTTPS deployment and a Codex surface with WebMCP discovery are required for a future E4 rerun. The baseline files are immutable; later work may only append a separately linked revision.
