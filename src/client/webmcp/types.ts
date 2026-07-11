export type ToolAnnotations = { readOnlyHint?: boolean; untrustedContentHint?: boolean };

export type ProjectTool<TInput extends object, TResult> = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: ToolAnnotations;
  execute(input: TInput): Promise<TResult>;
};
