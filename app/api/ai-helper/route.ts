import { AIRequestBody } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import OpenAI from "openai"

function buildSystemPrompt({
  userName,
  studyStats,
  groupInfo,
}: {
  userName: string | undefined
  studyStats: AIRequestBody["studyStats"]
  groupInfo: AIRequestBody["groupInfo"]
}) {
  const profile = [
    "User Profile:",
    `- Name: ${userName ?? "Unknown"}`,
    `- Total Study Time: ${formatDuration(studyStats?.totalStudyTime ?? 0)}`,
    `- Preferred Session Length: ${formatDuration(studyStats?.studyDuration ?? 1500)}`,
  ]

  const metrics = [
    "Study Performance:",
    `- Total Sessions: ${studyStats?.stats?.totalSessions ?? 0}`,
    `- Completed Sessions: ${studyStats?.stats?.completedSessions ?? 0}`,
    `- Success Rate: ${studyStats?.stats?.completionRate ?? "0%"}`,
  ]

  const recentSessions = (studyStats?.recentSessions ?? [])
    .slice(0, 5)
    .map((session) => {
      const date = new Date(session.startTime).toLocaleDateString()
      const duration = formatDuration(session.duration)
      const completed = session.completed ? "yes" : "no"
      return `- ${date}\n  Duration: ${duration}\n  Completed: ${completed}`
    })

  const recent = [
    "Recent Study History:",
    recentSessions.length > 0
      ? recentSessions.join("\n")
      : "No recent study activity recorded.",
  ]

  const extra = [
    "Additional Information:",
    `- Groups: ${JSON.stringify(groupInfo ?? [])}`,
    `- Current Time: ${new Date().toLocaleString()}`,
  ]

  const guidance = [
    "Key Instructions:",
    "1. Provide concise, personalized feedback.",
    "2. Focus on completion rate trends, session duration patterns, and overall study consistency.",
    "3. Keep responses brief and actionable.",
    "4. Address the user by their first name.",
  ]

  return [
    "You are a supportive study advisor providing personalized guidance.",
    "",
    ...profile,
    "",
    ...metrics,
    "",
    ...recent,
    "",
    ...extra,
    "",
    ...guidance,
  ]
    .join("\n")
    .trim()
}

function sanitizeMessages(
  messages: AIRequestBody["messages"],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages.reduce<OpenAI.Chat.Completions.ChatCompletionMessageParam[]>((acc, message) => {
    const role = message?.role === "assistant" ? "assistant" : "user"
    const rawContent =
      typeof message?.content === "string"
        ? message.content
        : JSON.stringify(message?.content ?? "")

    const content = rawContent.trim()
    if (content.length === 0) {
      return acc
    }

    acc.push({ role, content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)
    return acc
  }, [])
}

export async function POST(req: Request) {
  const { messages, userName, studyStats, groupInfo }: AIRequestBody =
    await req.json()

  const herokuBaseUrl = process.env.HEROKU_INFERENCE_URL
  const herokuApiKey = process.env.HEROKU_INFERENCE_KEY
  const herokuModelId =
    process.env.HEROKU_INFERENCE_MODEL_ID ?? "gpt-oss-120b"

  if (!herokuBaseUrl || !herokuApiKey) {
    return new Response("Heroku Inference API is not configured.", { status: 500 })
  }

  const systemPrompt = buildSystemPrompt({ userName, studyStats, groupInfo })
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...sanitizeMessages(messages),
  ]

  const herokuClient = new OpenAI({
    apiKey: herokuApiKey,
    baseURL: `${herokuBaseUrl.replace(/\/$/, "")}/v1`,
  })

  try {
    const completion = await herokuClient.chat.completions.create({
      model: herokuModelId,
      messages: chatMessages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
    })

    return Response.json(completion)
  } catch (error) {
    console.error("Error in AI helper API:", error)

    if (error instanceof OpenAI.APIError) {
      return new Response(error.message, { status: error.status ?? 500 })
    }

    return new Response("Error processing request", { status: 500 })
  }
}
