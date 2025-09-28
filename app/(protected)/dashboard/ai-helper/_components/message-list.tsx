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
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 text-sm",
            message.role === "user" ? "flex-row-reverse" : "flex-row",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {message.role === "user" ? (
              <Avatar className="size-8">
                <AvatarImage src={user?.image} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="size-6" />
            )}
          </div>
          <div
            className={cn(
              "flex flex-col gap-4",
              message.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "w-full max-w-prose rounded-lg bg-muted px-4 py-3",
              )}
            >
              <div className="markdown-body">
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
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <Bot className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex flex-col gap-2 rounded-lg bg-destructive/10 px-4 py-3">
            <div className="text-sm text-destructive">
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
              className="w-fit"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        </div>
      )}
    </div>
  )
}