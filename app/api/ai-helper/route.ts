import { AIRequestBody } from "@/lib/types"
import OpenAI from "openai"

import { buildSystemPrompt } from "./_lib/system-prompt"
import { sanitizeMessages } from "./_lib/message-sanitizer"
import {
  validateOpenAIConfig,
  createOpenAIClient,
  DEFAULT_COMPLETION_OPTIONS,
  fetchChatCompletion,
  type ChatCompletionOptions,
} from "./_lib/openai-client"
import { processAIResponse } from "./_lib/response-processor"
import { resolveModelRouting } from "./_lib/model-router"

export async function POST(req: Request) {
  try {
    const { messages, userName, studyStats, groupInfo, modelId }: AIRequestBody & { modelId?: string } =
      await req.json()

    const routingDecision = resolveModelRouting({
      messages,
      studyStats,
      modelId,
    })

    // Validate and get OpenAI configuration for the resolved model
    const config = validateOpenAIConfig(routingDecision.resolvedModelId)

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt({ userName, studyStats, groupInfo })

    // Prepare chat messages
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...sanitizeMessages(messages),
    ]

    // Create OpenAI client
    const client = createOpenAIClient(config)

    // Prepare completion options
    const completionOptions: ChatCompletionOptions = {
      model: config.herokuModelId,
      messages: chatMessages,
      ...DEFAULT_COMPLETION_OPTIONS,
    }

    // Get AI completion
    const completion = await fetchChatCompletion(client, completionOptions)

    // Process response and extract tables
    const { choices, toolInvocations } = processAIResponse(completion)

    const responsePayload = {
      ...completion,
      choices,
      toolInvocations,
      routing: routingDecision,
      selectedModel: routingDecision.resolvedModelId,
    }

    return Response.json(responsePayload)
  } catch (error) {
    console.error("Error in AI helper API:", error)

    if (error instanceof OpenAI.APIError) {
      return new Response(error.message, { status: error.status ?? 500 })
    }

    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response("Error processing request", { status: 500 })
  }
}
