import { expect, it, vi } from "vitest";
import {
  executeToolAdapter,
  getToolsAdapter,
  registerToolAdapter,
  subscribeToolChanges,
  type BrowserModelContext
} from "../../src/client/webmcp/adapter";
import { WebMcpRegistry } from "../../src/client/webmcp/registry";
import type { ProjectTool } from "../../src/client/webmcp/types";

const tool = (name: string): ProjectTool<object, unknown> => ({ name, description: name, inputSchema: {}, execute: async () => ({}) });

it("serializes duplicate in-flight registration and aborts removed tools", async () => {
  const controller = new AbortController();
  const register = vi.fn().mockResolvedValue(controller);
  const registry = new WebMcpRegistry(register);
  await Promise.all([registry.sync([tool("details")]), registry.sync([tool("details")])]);
  expect(register).toHaveBeenCalledTimes(1);
  await registry.sync([]);
  expect(controller.signal.aborted).toBe(true);
});

it("recovers the queue after a registration rejection", async () => {
  const register = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValueOnce(new AbortController());
  const registry = new WebMcpRegistry(register);
  await expect(registry.sync([tool("details")])).rejects.toThrow("temporary");
  await expect(registry.sync([tool("details")])).resolves.toBeUndefined();
});

it("keeps document.modelContext access inside the formal adapter", async () => {
  const descriptor = { name: "details", description: "details", inputSchema: "{}", origin: "https://events.example" };
  const context = new EventTarget() as BrowserModelContext;
  context.registerTool = vi.fn(async () => undefined);
  context.getTools = vi.fn(async () => [descriptor]);
  context.executeTool = vi.fn(async () => ({ ok: true }));
  const source = { modelContext: context };
  const controller = await registerToolAdapter(tool("details"), { exposedTo: ["https://agent.example"] }, source);
  expect(context.registerTool).toHaveBeenCalledWith(expect.objectContaining({ name: "details" }), {
    signal: controller?.signal,
    exposedTo: ["https://agent.example"]
  });
  await expect(getToolsAdapter({ fromOrigins: ["https://agent.example"] }, source)).resolves.toEqual([descriptor]);
  await expect(executeToolAdapter(descriptor, "{}", {}, source)).resolves.toEqual({ ok: true });
  const listener = vi.fn();
  const unsubscribe = subscribeToolChanges(listener, source);
  context.dispatchEvent(new Event("toolchange"));
  expect(listener).toHaveBeenCalledOnce();
  unsubscribe();
});
