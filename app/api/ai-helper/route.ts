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

interface McpTool {
  id: string
  name: string
  namespace: string
  description: string
  inputSchema?: any
}

async function fetchAvailableMcpTools(): Promise<McpTool[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai-helper/mcp-servers`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch MCP tools, continuing without them')
      return []
    }
    
    const data = await response.json()
    return data.tools || []
  } catch (error) {
    console.warn('Error fetching MCP tools:', error)
    return []
  }
}

async function callHerokuAgentsEndpoint(
  config: { herokuBaseUrl: string; herokuApiKey: string; herokuModelId: string },
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  mcpTools: McpTool[]
) {
  const agentsUrl = `${config.herokuBaseUrl.replace(/\/$/, "")}/v1/agents/heroku`
  
  const toolsArray = mcpTools.map(tool => ({
    type: "mcp",
    name: tool.id,
  }))

  const requestBody: any = {
    model: config.herokuModelId,
    messages,
    tools: toolsArray,
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

    // Fetch all available MCP tools
    const availableMcpTools = await fetchAvailableMcpTools()

    // Build system prompt with user context
    const baseSystemPrompt = buildSystemPrompt({ userName, studyStats, groupInfo })
    let systemPrompt = baseSystemPrompt
    
    // Add MCP tool instruction if tools are available
    if (availableMcpTools.length > 0) {
      const toolsList = availableMcpTools
        .map(tool => `- ${tool.name}: ${tool.description}`)
        .join('\n')
      
      systemPrompt = `${baseSystemPrompt}

You have access to the following MCP tools to help answer questions:
${toolsList}

When using these tools, extract any required information (like URLs) directly from the user's message. Use these tools proactively when they can help provide better answers.`
    }

    // Prepare chat messages
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...sanitizeMessages(messages),
    ]

    let completion: OpenAI.Chat.Completions.ChatCompletion

    // Use Heroku Agents endpoint with all available MCP tools
    if (availableMcpTools.length > 0) {
      completion = await callHerokuAgentsEndpoint(
        config,
        chatMessages,
        availableMcpTools
      )
    } else {
      // Fall back to standard OpenAI client if no MCP tools available
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
