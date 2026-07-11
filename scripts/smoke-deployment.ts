import { spawn, spawnSync } from "node:child_process";

const port = 43129;
const base = `http://127.0.0.1:${port}`;
const child = spawn("npm", ["start"], { env: { ...process.env, NODE_ENV: "production", PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"], shell: false });
let logs = "";
child.stdout.on("data", (chunk) => { logs += String(chunk); });
child.stderr.on("data", (chunk) => { logs += String(chunk); });

async function poll(path: string) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try { const response = await fetch(`${base}${path}`); if (response.ok) return response; } catch { /* retry startup */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${path}. ${logs}`);
}

try {
  const health = await poll("/health/live");
  if (JSON.stringify(await health.json()) !== JSON.stringify({ status: "ok" })) throw new Error("Unexpected health payload.");
  const events = await poll("/events");
  if (!(await events.text()).includes('id="app"')) throw new Error("SPA fallback did not return the client.");
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", shell: false }).stdout.trim();
  console.log(JSON.stringify({ ok: true, mode: "local-production-candidate", commit }));
} finally {
  child.kill("SIGTERM");
}
