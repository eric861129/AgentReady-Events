import type { ProjectTool } from "./types";

export type AnyProjectTool = ProjectTool<never, unknown>;
type Register = (tool: AnyProjectTool) => Promise<AbortController | undefined>;

export class WebMcpRegistry {
  private readonly controllers = new Map<string, AbortController>();
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly register: Register) {}

  sync(tools: AnyProjectTool[]): Promise<void> {
    const operation = this.queue.then(() => this.apply(tools));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  disposeAll(): Promise<void> {
    return this.sync([]);
  }

  names(): string[] {
    return [...this.controllers.keys()].sort();
  }

  private async apply(tools: AnyProjectTool[]) {
    const desired = new Map(tools.map((tool) => [tool.name, tool]));
    for (const [name, controller] of this.controllers) {
      if (!desired.has(name)) {
        controller.abort();
        this.controllers.delete(name);
      }
    }
    for (const [name, tool] of desired) {
      if (this.controllers.has(name)) continue;
      const controller = await this.register(tool);
      if (controller) this.controllers.set(name, controller);
    }
  }
}
