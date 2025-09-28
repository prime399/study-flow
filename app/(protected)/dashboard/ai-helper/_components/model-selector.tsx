"use client"
/**
 * Model selection component for AI helper
 * Allows users to choose between different AI models
 * Only shows models that are available (have API keys configured)
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Cpu, Zap, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

export interface ModelInfo {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

const getIconForModel = (id: string) => {
  switch (id) {
    case "gpt-oss-120b":
    case "nova-pro":
      return <Brain className="h-4 w-4" />
    case "nova-lite":
      return <Zap className="h-4 w-4" />
    case "claude-3-5-haiku":
      return <Cpu className="h-4 w-4" />
    default:
      return <Brain className="h-4 w-4" />
  }
}

// Default models as fallback
const DEFAULT_MODELS: ModelInfo[] = [
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
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(DEFAULT_MODELS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available models on component mount
  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/ai-helper/models')
        
        if (!response.ok) {
          throw new Error('Failed to fetch available models')
        }
        
        const data = await response.json()
        
        if (data.models && data.models.length > 0) {
          const withIcons = data.models.map((m: ModelInfo) => ({ ...m, icon: getIconForModel(m.id) }))
          setAvailableModels(withIcons)
          
          // If current selected model is not available, switch to first available
          if (!withIcons.some((model: ModelInfo) => model.id === selectedModel)) {
            onModelChange(withIcons[0].id)
          }
        } else {
          setError('No models available')
        }
      } catch (err) {
        console.error('Error fetching models:', err)
        setError('Failed to load models')
        // Fallback to default models
        setAvailableModels(DEFAULT_MODELS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableModels()
  }, [selectedModel, onModelChange])

  const currentModel = availableModels.find(model => model.id === selectedModel) || availableModels[0]

  if (error) {
    return (
      <div className="flex items-center gap-2 w-full sm:w-auto p-2 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-xs">{error}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="text-sm text-muted-foreground hidden lg:inline">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full sm:w-[200px] lg:w-[220px] h-9 text-sm">
          <SelectValue>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="shrink-0">{currentModel?.icon}</span>
              <span className="truncate text-xs sm:text-sm">
                {isLoading ? 'Loading...' : currentModel?.name}
              </span>
              {currentModel?.badge && !isLoading && (
                <Badge variant={currentModel.badgeVariant} className="text-xs px-1 sm:px-1.5 py-0.5 shrink-0 hidden sm:inline-flex">
                  {currentModel.badge}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[280px] sm:w-[320px]">
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex flex-col gap-1 py-1 w-full">
                <div className="flex items-center gap-2">
                  {model.icon}
                  <span className="font-medium text-sm">{model.name}</span>
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