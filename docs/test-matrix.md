# Deterministic test matrix

| Layer | Proves | Does not prove |
| --- | --- | --- |
| Typecheck | TypeScript interfaces agree | Runtime browser support |
| Unit and Tool | Pure rules, schemas, lifecycle and result contracts | Network or rendered UI |
| API | Session ownership, validation and HTTP behavior | Browser accessibility |
| Security | Explicit authorization, injection and annotation invariants | Absence of every vulnerability |
| Browser | Human fallback, accessible confirmation and three Journeys | Real compatible-Agent discovery |
| Build | Client and server sources compile | Public-host configuration |
| Codex Evals | Observed discovery, selection and behavior in the recorded environment | Behavior in unrecorded versions or environments |

`npm run verify` runs the deterministic layers in this order and writes a commit-bound JSON report even when a command fails. Codex Evals start only after this command succeeds; their runtime evidence remains separate from deterministic test evidence.
