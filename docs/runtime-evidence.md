# Runtime evidence status

The release has deterministic E2 tests and real-browser E3 integration. The Day 27 preflight did not expose `document.modelContext` in its recorded browser configuration; the immutable 0/20 environment-classified Codex baseline therefore remains valid and E4/E5 were not claimed.

On 2026-07-27, a separate Chrome 150 rerun with the official WebMCP testing flags observed one `search_events` tool through the browser testing surface. That supplements the E3 capability record only: it is not Agent discovery or invocation, and it does not alter the Day 27 baseline. See [webmcp-runtime-rerun.md](webmcp-runtime-rerun.md) for version, deployment-drift, and rerun requirements.
