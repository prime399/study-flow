import { AIRequestBody } from "@/lib/types"
import OpenAI from "openai"

import {
  DEFAULT_MCP_TOOL,
  MCP_TOOLS,
  type McpToolId,
} from "../../(protected)/dashboard/ai-helper/_constants"

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


interface McpToolConfig {
  toolId: string
  systemInstruction: string
}

function resolveMcpToolConfig(requestedToolId?: string | null): McpToolConfig | null {
  if (!requestedToolId || requestedToolId === DEFAULT_MCP_TOOL) {
    return null
  }

  return {
    toolId: requestedToolId,
    systemInstruction:
      "When you use MCP tools that require a URL, extract the URL from the user's message and use it with the tool. The user can provide URLs directly in their message.",
  }
}

async function callHerokuAgentsEndpoint(
  config: { herokuBaseUrl: string; herokuApiKey: string; herokuModelId: string },
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  mcpToolId: string
) {
  const agentsUrl = `${config.herokuBaseUrl.replace(/\/$/, "")}/v1/agents/heroku`
  
  const requestBody: any = {
    model: config.herokuModelId,
    messages,
    tools: [
      {
        type: "mcp",
        name: mcpToolId,
      }
    ],
  }

  const response = await fetch(agentsUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.herokuApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Heroku Agents API error (${response.status}): ${errorText}`)
  }

  // Parse SSE response
  const text = await response.text()
  const lines = text.split('\n')
  let lastCompletion: any = null
  let toolResults: any[] = []

  for (const line of lines) {
    if (line.startsWith('data:')) {
      const data = line.slice(5).trim()
      if (data === '[DONE]') break
      
      try {
        const parsed = JSON.parse(data)
        // Collect chat completions (including tool calls and responses)
        if (parsed.object === 'chat.completion' || parsed.object === 'tool.completion') {
          lastCompletion = parsed
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
  }

  if (!lastCompletion) {
    throw new Error("No valid completion received from Heroku Agents API")
  }

  return lastCompletion
}

export async function POST(req: Request) {
  try {
    const { messages, userName, studyStats, groupInfo, modelId, mcpToolId }: AIRequestBody & { modelId?: string; mcpToolId?: string } =
      await req.json()

    const routingDecision = resolveModelRouting({
      messages,
      studyStats,
      modelId,
    })

    // Validate and get OpenAI configuration for the resolved model
    const config = validateOpenAIConfig(routingDecision.resolvedModelId)

    const mcpToolConfig = resolveMcpToolConfig(mcpToolId)

    // Build system prompt with user context
    const baseSystemPrompt = buildSystemPrompt({ userName, studyStats, groupInfo })
    let systemPrompt = baseSystemPrompt
    
    if (mcpToolConfig) {
      systemPrompt = `${baseSystemPrompt}

${mcpToolConfig.systemInstruction}`
    }

    // Prepare chat messages
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...sanitizeMessages(messages),
    ]

    let completion: OpenAI.Chat.Completions.ChatCompletion

    // Use Heroku Agents endpoint for MCP tools
    if (mcpToolConfig) {
      completion = await callHerokuAgentsEndpoint(
        config,
        chatMessages,
        mcpToolConfig.toolId
      )
    } else {
      // Use standard OpenAI client for non-MCP requests
      const client = createOpenAIClient(config)
      
      const completionOptions: ChatCompletionOptions = {
        model: config.herokuModelId,
        messages: chatMessages,
        ...DEFAULT_COMPLETION_OPTIONS,
      }

      completion = await fetchChatCompletion(client, completionOptions)
    }

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
