export type JsonSchema = Record<string, unknown>;

export type ProjectTool<TInput extends object, TResult> = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: TInput): Promise<TResult>;
};
