/**
 * Predefined message suggestions for users
 * Provides quick-start options for common queries
 */

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

export const PREDEFINED_MESSAGES = [
  "How can I improve my study focus?",
  "What's the best study technique for me based on my stats?",
  "Give me tips for better time management",
  "How can I make my study sessions more effective?",
] as const

interface PredefinedMessagesProps {
  onMessageSelect: (message: string) => void
  isLoading: boolean
}

export function PredefinedMessages({ onMessageSelect, isLoading }: PredefinedMessagesProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <Bot className="mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">
        How can I help you study better?
      </h3>
      <p className="mb-6 max-w-sm text-sm">
        Ask me anything about study techniques, time management, or get
        personalized advice based on your study patterns.
      </p>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 md:grid-cols-2">
        {PREDEFINED_MESSAGES.map((message) => (
          <Button
            key={message}
            variant="outline"
            className="h-auto whitespace-normal text-left text-sm"
            onClick={() => onMessageSelect(message)}
            disabled={isLoading}
          >
            {message}
          </Button>
        ))}
      </div>
    </div>
  )
}