/**
 * Custom hook for chat functionality
 * Manages chat state, API communication, and user interactions
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { 
  Message, 
  generateId, 
  saveMessagesToStorage, 
  loadMessagesFromStorage, 
  clearMessagesFromStorage,
  createUserMessage,
  createAssistantMessage
} from "../_components/chat-state"

interface UseChatProps {
  studyStats: any
  groupInfo: any
  userName?: string
}

export function useChat({ studyStats, groupInfo, userName }: UseChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage()
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    saveMessagesToStorage(messages)
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage = createUserMessage(messageContent)
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
          studyStats,
          groupInfo,
          userName,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const toolInvocations = Array.isArray(data.toolInvocations)
        ? data.toolInvocations
        : []

      let assistantContent = ""
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantContent = data.choices[0].message.content
      } else {
        assistantContent = "I apologize, but I couldn't generate a proper response. Please try again."
      }

      const assistantMessage = createAssistantMessage(assistantContent, toolInvocations)
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
  }, [isLoading, messages, studyStats, groupInfo, userName])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

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
    clearMessagesFromStorage()
    setError(null)
    toast.success("Chat history cleared")
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSubmit,
    append,
    stop,
    reload,
    clearChat,
    clearError,
  }
}