import { createApp } from "./app";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PRODUCTION_HOST = "0.0.0.0";

export function resolvePort(value: string | undefined): number {
  if (value === undefined) return 3000;
  if (!/^\d+$/.test(value)) throw new Error("PORT must be an integer from 1 to 65535.");
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer from 1 to 65535.");
  return port;
}

export function startServer() {
  const port = resolvePort(process.env.PORT);
  return createApp().listen(port, PRODUCTION_HOST, () => console.log(`AgentReady Events listening on http://${PRODUCTION_HOST}:${port}`));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer();
