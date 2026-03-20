export interface AgentResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface AgentProvider {
  name: string;
  execute(
    prompt: string,
    onLog: (stream: "stdout" | "stderr" | "system", content: string) => Promise<void>,
    signal?: AbortSignal
  ): Promise<AgentResult>;
}
