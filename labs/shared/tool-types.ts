export type JsonSchema = Record<string, unknown>;

export type ProjectTool<TInput extends object, TResult> = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute(input: TInput): Promise<TResult>;
};
