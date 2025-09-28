/**
 * Chat input component with send/stop/reload functionality
 * Handles user input and control actions for the chat interface
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Send, StopCircle } from "lucide-react"
import { useCallback } from "react"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onStop: () => void
  onReload: () => void
  isLoading: boolean
  error: string | null
  hasMessages: boolean
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  onReload,
  isLoading,
  error,
  hasMessages
}: ChatInputProps) {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [setInput])

  return (
    <div className="border-t">
      <div className="p-4">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything about studying..."
            disabled={isLoading || error != null}
            className="flex-1"
            autoFocus
          />
          <div className="flex gap-2">
            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onStop}
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              hasMessages && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    onReload()
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )
            )}
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      
      {/* Powered by footer */}
      <div className="border-t bg-muted/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>AI Assistant Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-primary">Heroku Inference</span>
            <span>•</span>
            <span className="text-muted-foreground/70">Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  )
}