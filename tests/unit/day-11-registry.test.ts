import { expect, it, vi } from "vitest";
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
