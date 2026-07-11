# Codex WebMCP runtime protocol

Each case runs in a separate Eval task containing only the reviewed URL, commit, this protocol, and one case. When requested, reset the site session; open the exact path; send the exact prompt once; do not reveal expected Tools, retry, rephrase, or coach the Agent. Record preflight capability, discovery, ordered selection, arguments, visible result, UI before/after, confirmation boundary, and pass/fail. Record the environment even when discovery is unavailable.

Use an author-authorized HTTPS deployment when available; otherwise use the locally started production artifact and label it `local-production-candidate`. Never substitute Fake ModelContext or direct Tool calls for genuine discovery. Remove cookies, tokens, personal email, private prompts and secrets.

E0 is an idea, E1 a static artifact, E2 deterministic local execution, E3 browser integration, E4 observed real discovery and invocation, and E5 a clean task/environment replay of E4. E4 requires both discovered schema and invocation evidence. E5 additionally requires a clean-task reference. A lower level is a truthful result, not a reason to inflate the label.
