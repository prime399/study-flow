/**
 * Message list component for displaying chat messages
 * Handles rendering of user and assistant messages with proper styling
 */

import { AITable } from "@/components/ai-data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Loader2, RefreshCw, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"

import { formatMessageContent } from "./message-formatter"
import { markdownComponents } from "./markdown-components"
import type { Message } from "./chat-state"

interface MessageListProps {
  messages: Message[]
  user?: { name?: string; image?: string }
  error?: string | null
  isLoading: boolean
  onRetry: () => void
  onClearError: () => void
}

export function MessageList({ 
  messages, 
  user, 
  error, 
  isLoading, 
  onRetry, 
  onClearError 
}: MessageListProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-2 sm:gap-3 text-sm",
            message.role === "user" ? "flex-row-reverse" : "flex-row",
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shrink-0",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {message.role === "user" ? (
              <Avatar className="size-7 sm:size-8">
                <AvatarImage src={user?.image} />
                <AvatarFallback>
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
          <div
            className={cn(
              "flex flex-col gap-2 sm:gap-4 min-w-0 flex-1",
              message.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "w-full max-w-[calc(100vw-4rem)] sm:max-w-prose rounded-lg bg-muted px-3 sm:px-4 py-2 sm:py-3 overflow-hidden break-words",
              )}
            >
              <div className="markdown-body text-xs sm:text-sm overflow-wrap-anywhere">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {formatMessageContent(message.content)}
                </ReactMarkdown>
              </div>
            </div>

            {message.role === "assistant" &&
              message.toolInvocations?.map((toolInvocation: any) => {
                const { toolName, toolCallId, state } = toolInvocation

                if (state === "result") {
                  if (toolName === "displayTable") {
                    const { result } = toolInvocation
                    return (
                      <div key={toolCallId} className="w-full">
                        <AITable {...result} />
                      </div>
                    )
                  }
                } else {
                  return (
                    <div
                      key={toolCallId}
                      className="rounded-lg bg-muted px-4 py-3"
                    >
                      <div className="flex flex-row items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating visualization...
                      </div>
                    </div>
                  )
                }
              })}
          </div>
        </div>
      ))}
      
      {error && (
        <div className="flex gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-2 rounded-lg bg-destructive/10 px-3 sm:px-4 py-2 sm:py-3 min-w-0 flex-1">
            <div className="text-xs sm:text-sm text-destructive break-words">
              An error occurred: {error}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClearError()
                onRetry()
              }}
              className="w-fit text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-muted shrink-0">
            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 sm:px-4 py-2 sm:py-3">
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            <span className="text-xs sm:text-sm">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}