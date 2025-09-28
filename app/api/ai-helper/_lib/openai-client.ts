/**
 * OpenAI client configuration and setup
 * Handles Heroku Inference API configuration
 */

import OpenAI from "openai"

export interface OpenAIConfig {
  herokuBaseUrl: string
  herokuApiKey: string
  herokuModelId: string
}

export function validateOpenAIConfig(): OpenAIConfig {
  const herokuBaseUrl = process.env.HEROKU_INFERENCE_URL
  const herokuApiKey = process.env.HEROKU_INFERENCE_KEY
  const herokuModelId = process.env.HEROKU_INFERENCE_MODEL_ID ?? "gpt-oss-120b"

  if (!herokuBaseUrl || !herokuApiKey) {
    throw new Error("Heroku Inference API is not configured.")
  }

  return {
    herokuBaseUrl,
    herokuApiKey,
    herokuModelId,
  }
}

export function createOpenAIClient(config: OpenAIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.herokuApiKey,
    baseURL: `${config.herokuBaseUrl.replace(/\/$/, "")}/v1`,
  })
}

export interface ChatCompletionOptions {
  model: string
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  temperature?: number
  top_p?: number
  max_tokens?: number
}

export const DEFAULT_COMPLETION_OPTIONS = {
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 2048,
} as const