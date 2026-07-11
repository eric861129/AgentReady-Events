import { expect, it, vi } from "vitest";
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
