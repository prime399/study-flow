export const AUTO_MODEL_ID = "auto"
export const DEFAULT_FALLBACK_MODEL_ID = "claude-3-5-haiku"

export const MODEL_LABELS: Record<string, string> = {
  [AUTO_MODEL_ID]: "Smart Auto Route",
  "gpt-oss-120b": "GPT OSS 120B",
  "nova-lite": "Nova Lite",
  "nova-pro": "Nova Pro",
  "claude-3-5-haiku": "Claude 3.5 Haiku",
}



export const MCP_TOOLS = [
  {
    id: "none",
    label: "No Remote Tool",
    description: "MentorMind will not call external MCP tools.",
  },
] as const

export type McpToolId = string

export const DEFAULT_MCP_TOOL: McpToolId = MCP_TOOLS[0].id

export interface DynamicMcpTool {
  id: string
  name: string
  namespace: string
  description: string
  inputSchema?: any
}

