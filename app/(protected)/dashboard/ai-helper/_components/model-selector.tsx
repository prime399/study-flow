/**
 * Model selection component for AI helper
 * Allows users to choose between different AI models
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Cpu, Zap } from "lucide-react"

export interface ModelInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "Proven OpenAI OSS model - reliable and versatile",
    icon: <Brain className="h-4 w-4" />,
    badge: "Recommended",
    badgeVariant: "default",
  },
  {
    id: "nova-lite",
    name: "Nova Lite",
    description: "Fast and efficient for quick responses",
    icon: <Zap className="h-4 w-4" />,
    badge: "Fast",
    badgeVariant: "secondary",
  },
  {
    id: "nova-pro",
    name: "Nova Pro", 
    description: "Balanced performance for most tasks",
    icon: <Brain className="h-4 w-4" />,
    badge: "Pro",
    badgeVariant: "outline",
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Advanced reasoning and detailed analysis",
    icon: <Cpu className="h-4 w-4" />,
    badge: "Advanced",
    badgeVariant: "outline",
  },
] as const

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

export function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find(model => model.id === selectedModel) || AVAILABLE_MODELS[0]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
        <SelectTrigger className="w-[220px] h-9 text-sm">
          <SelectValue>
            <div className="flex items-center gap-2 min-w-0">
              {currentModel.icon}
              <span className="truncate">{currentModel.name}</span>
              {currentModel.badge && (
                <Badge variant={currentModel.badgeVariant} className="text-xs px-1.5 py-0.5 shrink-0">
                  {currentModel.badge}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[320px]">
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex flex-col gap-1 py-1 w-full">
                <div className="flex items-center gap-2">
                  {model.icon}
                  <span className="font-medium">{model.name}</span>
                  {model.badge && (
                    <Badge variant={model.badgeVariant} className="text-xs px-1.5 py-0.5">
                      {model.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pl-6">
                  {model.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}