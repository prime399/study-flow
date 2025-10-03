"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wrench, Loader2 } from "lucide-react"
import { useMemo, useEffect, useState, type ReactNode } from "react"

import { DEFAULT_MCP_TOOL, MCP_TOOLS, type McpToolId, type DynamicMcpTool } from "../_constants"

const TOOL_ICON: Record<string, ReactNode> = {
  none: <Sparkles className="h-4 w-4" />,
  default: <Wrench className="h-4 w-4" />,
}

interface McpToolSelectorProps {
  selectedTool: McpToolId
  onToolChange: (toolId: McpToolId) => void
  disabled?: boolean
}

export function McpToolSelector({ selectedTool, onToolChange, disabled = false }: McpToolSelectorProps) {
  const [dynamicTools, setDynamicTools] = useState<DynamicMcpTool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMcpTools() {
      try {
        const response = await fetch("/api/ai-helper/mcp-servers")
        if (!response.ok) {
          throw new Error("Failed to fetch MCP tools")
        }
        const data = await response.json()
        setDynamicTools(data.tools || [])
      } catch (error) {
        console.error("Error fetching MCP tools:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMcpTools()
  }, [])

  const allTools = useMemo(() => {
    return [
      ...MCP_TOOLS.map(t => ({
        id: t.id,
        label: t.label,
        description: t.description,
        isStatic: true,
      })),
      ...dynamicTools.map(t => ({
        id: t.id,
        label: `${t.namespace}/${t.name}`,
        description: t.description,
        isStatic: false,
      })),
    ]
  }, [dynamicTools])

  const activeTool = useMemo(
    () => allTools.find(tool => tool.id === selectedTool) ?? allTools[0],
    [selectedTool, allTools]
  )

  const getToolIcon = (toolId: string) => {
    return TOOL_ICON[toolId] || TOOL_ICON.default
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="text-sm text-muted-foreground hidden lg:inline">MCP Tool:</span>
      <Select value={selectedTool} onValueChange={value => onToolChange(value as McpToolId)} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full sm:w-[240px] lg:w-[260px] h-9 text-sm">
          <SelectValue>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Loading tools...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{getToolIcon(activeTool.id)}</span>
                <span className="truncate text-xs sm:text-sm">{activeTool.label}</span>
                {!activeTool.isStatic && (
                  <Badge variant="secondary" className="text-xs px-1 sm:px-1.5 py-0.5 shrink-0 hidden sm:inline-flex">
                    MCP
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[280px] sm:w-[320px] max-h-[400px]">
          {allTools.map(tool => (
            <SelectItem key={tool.id} value={tool.id} className="cursor-pointer">
              <div className="flex flex-col gap-1 py-1 w-full">
                <div className="flex items-center gap-2">
                  {getToolIcon(tool.id)}
                  <span className="font-medium text-sm">{tool.label}</span>
                  {!tool.isStatic && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      MCP
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pl-6">{tool.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
