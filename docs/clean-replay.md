# Day 29 clean replay

- Source candidate: `701bb9e5e2bc999d04ef377f71c863006537d25b`.
- Preserved clone: `/Users/eric861129/iThome-2026/AgentReady-Events-v3-clean-replay-20260712-0146`.
- `npm ci`: passed, 181 packages installed, 0 vulnerabilities.
- `npm run verify`: passed; 33 non-browser files / 56 tests, 5 API files / 10 tests, 4 security files / 5 tests, and 20 Playwright tests all passed; build passed.
- `npm run evals:validate`: 20 cases valid across 10 categories.
- `npm run smoke:deployment`: passed against the production entry point.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Docker replay: not claimed because the Docker daemon was unavailable.
- Codex E5 replay: not claimed because no author-authorized HTTPS URL or WebMCP discovery surface was available.

The clone is intentionally preserved for author inspection. It was not used as an E5 claim: clean software replay and clean Codex discovery replay are different proofs.
