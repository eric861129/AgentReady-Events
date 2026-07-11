import { Router } from "express";
import { ensureSession } from "../session/demo-session";
import type { MemoryStore } from "../store/memory-store";

export function createSessionRouter(store: MemoryStore): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const session = ensureSession(request, response, store);
    response.json({ csrfToken: session.csrfToken });
  });
  return router;
}
