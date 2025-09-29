/**
 * Custom hook for chat functionality
 * Manages chat state, API communication, and user interactions
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Message,
  saveMessagesToStorage,
  loadMessagesFromStorage,
  clearMessagesFromStorage,
  createUserMessage,
  createAssistantMessage,
} from "../_components/chat-state"
import { AUTO_MODEL_ID, DEFAULT_FALLBACK_MODEL_ID } from "../_constants"

interface UseChatProps {
  studyStats: any
  groupInfo: any
  userName?: string
}

type ModelPreference = string

type AvailableModelsResponse = {
  models?: { id: string }[]
}

export function useChat({ studyStats, groupInfo, userName }: UseChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedModelState, setSelectedModelState] = useState<ModelPreference>(AUTO_MODEL_ID)
  const [resolvedModel, setResolvedModel] = useState<string>(DEFAULT_FALLBACK_MODEL_ID)

  const applyModelPreference = useCallback((modelId: string, fallbackResolved?: string) => {
    setSelectedModelState(modelId)
    if (modelId === AUTO_MODEL_ID) {
      setResolvedModel(fallbackResolved ?? DEFAULT_FALLBACK_MODEL_ID)
    } else {
      setResolvedModel(modelId)
    }
  }, [])

  // Load messages and model preference from localStorage on mount
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage()
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    }

    const savedPreference = localStorage.getItem("preferredModel") ?? AUTO_MODEL_ID

    fetch("/api/ai-helper/models")
      .then(res => res.json() as Promise<AvailableModelsResponse>)
      .then(data => {
        const availableModels = Array.isArray(data.models) ? data.models : []
        const firstAvailable = availableModels[0]?.id ?? DEFAULT_FALLBACK_MODEL_ID

        if (
          savedPreference !== AUTO_MODEL_ID &&
          availableModels.some(model => model.id === savedPreference)
        ) {
          applyModelPreference(savedPreference)
        } else {
          applyModelPreference(AUTO_MODEL_ID, firstAvailable)
          localStorage.setItem("preferredModel", AUTO_MODEL_ID)
        }
      })
      .catch(err => {
        console.warn("Failed to validate model availability:", err)
        const fallbackResolved = savedPreference === AUTO_MODEL_ID ? DEFAULT_FALLBACK_MODEL_ID : undefined
        applyModelPreference(savedPreference, fallbackResolved)
      })
  }, [applyModelPreference])

  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem("preferredModel", selectedModelState)
  }, [selectedModelState])

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
          modelId: selectedModelState,
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

      if (typeof data.selectedModel === "string") {
        setResolvedModel(data.selectedModel)
      } else if (selectedModelState !== AUTO_MODEL_ID) {
        setResolvedModel(selectedModelState)
      }

      let assistantContent = ""
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantContent = data.choices[0].message.content
      } else {
        assistantContent = "I apologize, but I couldn't generate a proper response. Please try again."
      }

      const assistantMessage = createAssistantMessage(assistantContent, toolInvocations)
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      if (err.name === "AbortError") {
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
  }, [isLoading, messages, studyStats, groupInfo, userName, selectedModelState])

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

  const setSelectedModel = useCallback((modelId: string) => {
    applyModelPreference(modelId)
  }, [applyModelPreference])

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    selectedModel: selectedModelState,
    resolvedModel,
    setSelectedModel,
    handleSubmit,
    append,
    stop,
    reload,
    clearChat,
    clearError,
  }
}
