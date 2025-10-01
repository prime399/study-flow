/**
 * Model configuration and metadata
 * Centralized model definitions and availability checking
 */

import React from "react"
import { getAvailableModels, type SupportedModelId } from "./openai-client"

export interface ModelInfo {
  id: SupportedModelId
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

// Model icon components (server-side safe)
const BrainIcon = () => React.createElement('svg', { className: 'h-4 w-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z' }),
  React.createElement('path', { d: 'M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z' })
)

const ZapIcon = () => React.createElement('svg', { className: 'h-4 w-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
  React.createElement('polygon', { points: '13,2 3,14 12,14 11,22 21,10 12,10' })
)

const CpuIcon = () => React.createElement('svg', { className: 'h-4 w-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
  React.createElement('rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }),
  React.createElement('rect', { x: '9', y: '9', width: '6', height: '6' }),
  React.createElement('path', { d: 'M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3' })
)

// Complete model definitions
export const ALL_MODELS: ModelInfo[] = [
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "OpenAI OSS model kept as a reliable fallback option",
    icon: React.createElement(BrainIcon),
  },
  {
    id: "nova-lite", 
    name: "Nova Lite",
    description: "Fast and efficient for quick responses",
    icon: React.createElement(ZapIcon),
    badge: "Fast",
    badgeVariant: "secondary",
  },
  {
    id: "nova-pro",
    name: "Nova Pro",
    description: "Balanced performance for most tasks", 
    icon: React.createElement(BrainIcon),
    badge: "Pro",
    badgeVariant: "outline",
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Balanced reasoning model recommended for most study help.",
    icon: React.createElement(CpuIcon),
    badge: "Recommended",
    badgeVariant: "default",
  },
] as const

// Get available models with their metadata
export function getAvailableModelInfo(): ModelInfo[] {
  const availableModelIds = getAvailableModels()
  return ALL_MODELS.filter(model => availableModelIds.includes(model.id))
}

// Get model info by ID
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return ALL_MODELS.find(model => model.id === modelId)
}

// Validate if a model is available
export function isModelAvailable(modelId: string): boolean {
  const availableModels = getAvailableModels()
  return availableModels.includes(modelId as SupportedModelId)
}