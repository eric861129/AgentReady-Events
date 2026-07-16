import { expect, it, vi } from "vitest";
import {
  executeProjectTool,
  getProjectTools,
  registerProjectTool,
  subscribeProjectToolChanges,
  type ProjectModelContext
} from "../../labs/shared/model-context-adapter";
import { ToolRegistry } from "../../labs/shared/tool-registry";
import type { ProjectTool } from "../../labs/shared/tool-types";

const tool = (name: string): ProjectTool<object, unknown> => ({ name, description: name, inputSchema: {}, execute: async () => ({}) });

it("serializes concurrent sync and registers a name once", async () => {
  const register = vi.fn(async () => new AbortController());
  const registry = new ToolRegistry(register);
  await Promise.all([registry.sync([tool("details")]), registry.sync([tool("details")])]);
  expect(register).toHaveBeenCalledTimes(1);
  expect(registry.names()).toEqual(["details"]);
});

it("aborts removed tools and keeps the queue alive after rejection", async () => {
  const controller = new AbortController();
  const register = vi.fn()
    .mockRejectedValueOnce(new Error("temporary"))
    .mockResolvedValueOnce(controller);
  const registry = new ToolRegistry(register);
  await expect(registry.sync([tool("details")])).rejects.toThrow("temporary");
  await registry.sync([tool("details")]);
  await registry.sync([]);
  expect(controller.signal.aborted).toBe(true);
  expect(registry.names()).toEqual([]);
});

it("discovers, executes, and observes tools through the 2026 Chrome surface", async () => {
  const descriptor = { name: "details", description: "details", inputSchema: "{}", origin: "https://events.example" };
  const context = new EventTarget() as ProjectModelContext;
  context.registerTool = vi.fn(async () => undefined);
  context.getTools = vi.fn(async () => [descriptor]);
  context.executeTool = vi.fn(async () => ({ ok: true }));
  const source = { modelContext: context };
  const controller = await registerProjectTool(tool("details"), { exposedTo: ["https://agent.example"] }, source);
  expect(context.registerTool).toHaveBeenCalledWith(expect.objectContaining({ name: "details" }), {
    signal: controller?.signal,
    exposedTo: ["https://agent.example"]
  });
  await expect(getProjectTools({ fromOrigins: ["https://partner.example"] }, source)).resolves.toEqual([descriptor]);
  await expect(executeProjectTool(descriptor, "{}", {}, source)).resolves.toEqual({ ok: true });
  const changed = vi.fn();
  const unsubscribe = subscribeProjectToolChanges(changed, source);
  context.dispatchEvent(new Event("toolchange"));
  expect(changed).toHaveBeenCalledOnce();
  unsubscribe();
});

it("degrades explicitly when the runtime is unsupported", async () => {
  const source = {};
  await expect(registerProjectTool(tool("details"), {}, source)).resolves.toBeUndefined();
  await expect(getProjectTools({}, source)).resolves.toEqual([]);
  await expect(executeProjectTool({ name: "details", description: "", inputSchema: "{}", origin: "" }, "{}", {}, source)).resolves.toBeUndefined();
  expect(() => subscribeProjectToolChanges(vi.fn(), source)()).not.toThrow();
});

it("rejects insecure cross-origin policy entries before registration", async () => {
  const context = new EventTarget() as ProjectModelContext;
  context.registerTool = vi.fn(async () => undefined);
  const source = { modelContext: context };
  await expect(registerProjectTool(tool("details"), { exposedTo: ["http://agent.example"] }, source)).rejects.toThrow(/HTTPS/);
  expect(context.registerTool).not.toHaveBeenCalled();
});
