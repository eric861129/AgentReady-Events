import type { ProjectTool } from "./tool-types";

type Register = (tool: ProjectTool<object, unknown>) => Promise<AbortController | undefined>;

export class ToolRegistry {
  private readonly controllers = new Map<string, AbortController>();
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly register: Register) {}

  sync(tools: ProjectTool<object, unknown>[]): Promise<void> {
    const operation = this.queue.then(() => this.apply(tools));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  async disposeAll(): Promise<void> {
    await this.sync([]);
  }

  names(): string[] {
    return [...this.controllers.keys()].sort();
  }

  private async apply(tools: ProjectTool<object, unknown>[]): Promise<void> {
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
