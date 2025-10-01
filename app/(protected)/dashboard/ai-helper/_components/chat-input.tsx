"use client"
/**
 * Chat input component with send/stop/reload functionality
 * Handles user input and control actions for the chat interface
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Send, StopCircle, Coins } from "lucide-react"
import { useCallback, useMemo } from "react"

import { AUTO_MODEL_ID, MODEL_LABELS } from "../_constants"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onStop: () => void
  onReload: () => void
  isLoading: boolean
  error: string | null
  hasMessages: boolean
  activeModel: string
  coinBalance: number
  coinsRequired: number
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  onReload,
  isLoading,
  error,
  hasMessages,
  activeModel,
  coinBalance,
  coinsRequired,
}: ChatInputProps) {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [setInput])

  const modelLabel = useMemo(() => {
    const fallback = MODEL_LABELS[AUTO_MODEL_ID]
    return MODEL_LABELS[activeModel] ?? activeModel ?? fallback
  }, [activeModel])

  const insufficientCoins = coinBalance < coinsRequired

  return (
    <div className="">
      <div className="p-2 sm:p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask anything about studying..."
              disabled={isLoading || (error != null && !insufficientCoins)}
              className="flex-1 text-sm sm:text-base"
              autoFocus
            />
            <div className="flex gap-1 sm:gap-2 shrink-0">
              {isLoading ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={onStop}
                  className="h-9 w-9 sm:h-10 sm:w-10"
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
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )
              )}
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim() || insufficientCoins}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {insufficientCoins && (
            <p className="text-xs text-destructive">
              You need {coinsRequired} coins to ask MentorMind. Start a study session to earn more coins (1 second = 1 coin).
            </p>
          )}

          {error && !insufficientCoins && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </form>
      </div>

      {/* Powered by footer - responsive */}
      <div className="border-t bg-muted/30 px-2 sm:px-4 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>AI Assistant Active</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline">Powered by</span>
              <span className="font-semibold text-primary truncate">{modelLabel}</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              <span className="font-semibold">{coinBalance}</span>
              <span className="text-muted-foreground/70">({coinsRequired} per question)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

