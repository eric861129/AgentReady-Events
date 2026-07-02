import { describe, expect, it, vi } from "vitest";
import { createWebMcpAdapter } from "./webmcpAdapter";

describe("createWebMcpAdapter", () => {
  it("沒有 document.modelContext 時回報 unsupported", () => {
    const adapter = createWebMcpAdapter({} as Document);

    expect(adapter.isSupported()).toBe(false);
  });

  it("透過 document.modelContext.registerTool 註冊 Tool 並提供 dispose", async () => {
    const registerTool = vi.fn(async () => undefined);
    const adapter = createWebMcpAdapter({
      modelContext: { registerTool }
    } as unknown as Document);
    const tool = {
      name: "get_event_details",
      description: "取得活動詳情。",
      execute: vi.fn()
    };

    const registration = await adapter.registerTool(tool);

    expect(registerTool).toHaveBeenCalledWith(tool, {
      signal: expect.any(AbortSignal)
    });
    expect(registration.name).toBe("get_event_details");
    registration.dispose();
  });
});
