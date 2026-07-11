# Codex development workflow

## Goal

Build the approved AgentReady Events v3 from Day 13–22 with exactly five Tools, three Journeys, shared UI/Tool use cases, visible human confirmation and a Day 22 feature freeze.

## Rules that control Codex

1. Read `AGENTS.md`, this workflow and `docs/product-spec.md` before a product change.
2. Write a failing focused test, observe RED, implement the smallest behavior, then run focused and regression verification.
3. Do not add features from likely future requirements.
4. Record objective, relevant prompt, RED, decision, verification, limitation and exact commit; do not publish raw transcript exhaust.
5. Create immutable daily branch/tag snapshots. Do not push.
6. Stop registration/cancellation Tool execution before final human action.
7. Do not claim E4 from Fake ModelContext, DevTools manual execution or direct `execute()`.

## Human decisions

Public host/credentials, a real discovery-capable Codex/Chrome surface, Day 30 feelings and GitHub cutover remain author-owned. Their absence does not pause locally achievable work.
