"use client"

import { AITable } from "@/components/ai-data-table"
import PageTitle from "@/components/page-title"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import {
  Bot,
  Loader2,
  RefreshCw,
  Send,
  StopCircle,
  TrashIcon,
  User,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const PREDEFINED_MESSAGES = [
  "How can I improve my study focus?",
  "What's the best study technique for me based on my stats?",
  "Give me tips for better time management",
  "How can I make my study sessions more effective?",
] as const

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  toolInvocations?: any[]
  timestamp: number
}

export default function AIHelperPage() {
  const getStudyStats = useQuery(api.study.getFullStats)
  const listMyGroups = useQuery(api.groups.listMyGroups)
  const user = useQuery(api.users.viewer)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("chatMessages")
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages))
        } catch (e) {
          console.error("Failed to parse saved messages:", e)
        }
      }
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageContent.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    // Create abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch("/api/ai-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          studyStats: getStudyStats,
          groupInfo: listMyGroups,
          userName: user?.name,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      let assistantContent = ""
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantContent = data.choices[0].message.content
      } else {
        assistantContent = "I apologize, but I couldn't generate a proper response. Please try again."
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info("Request cancelled")
      } else {
        console.error("Error sending message:", err)
        setError(err.message)
        toast.error("Failed to get response", {
          description: err.message,
        })
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }, [isLoading, messages, getStudyStats, listMyGroups, user?.name])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const append = useCallback((message: { role: "user", content: string }) => {
    sendMessage(message.content)
  }, [sendMessage])

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      toast.info("Request stopped")
    }
  }, [abortController])

  const reload = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === "user")
      if (lastUserMessage) {
        // Remove the last assistant message if it exists
        const lastMessageIndex = messages.length - 1
        if (messages[lastMessageIndex]?.role === "assistant") {
          setMessages(prev => prev.slice(0, -1))
        }
        sendMessage(lastUserMessage.content)
      }
    }
  }, [messages, sendMessage])

  const clearChat = useCallback(() => {
    setMessages([])
    localStorage.removeItem("chatMessages")
    setError(null)
    toast.success("Chat history cleared")
  }, [])

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <PageTitle title="AI Study Assistant" />
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          className="gap-2"
        >
          <TrashIcon className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>
      <Card className="flex h-[calc(100svh-120px)] flex-col">
        <ScrollArea
          className="flex-1 p-4"
          style={{ height: "calc(100% - 80px)" }}
        >
          {messages.length === 0 ? (
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
                    onClick={() => {
                      append({ role: "user", content: message })
                    }}
                    disabled={isLoading}
                  >
                    {message}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: any) => (
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
                        "max-w-prose rounded-lg bg-muted px-4 py-3",
                      )}
                    >
                      {message.content}
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
                        setError(null)
                        reload()
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
                  onClick={stop}
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                messages.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      reload()
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
      </Card>
    </div>
  )
}
