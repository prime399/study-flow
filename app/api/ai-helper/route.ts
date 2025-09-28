import { AIRequestBody } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import OpenAI from "openai"

type TableData = {
  headers: string[]
  rows: string[][]
  caption?: string
}

type ToolInvocation = {
  toolName: "displayTable"
  toolCallId: string
  state: "result"
  result: TableData
}

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
    "5. When you include tabular data, append a JSON code block at the end of the response formatted as ```json {\"tables\":[{\"headers\":[\"Column 1\"],\"rows\":[[\"Value\"]],\"caption\":\"Optional caption\"}]}```.",
    "6. Ensure all table values are strings and avoid markdown tables in the narrative.",
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

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const result: string[] = []

  for (const item of value) {
    if (typeof item !== "string") {
      return null
    }
    result.push(item)
  }

  return result
}

function toRows(value: unknown): string[][] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const rows: string[][] = []

  for (const row of value) {
    const parsedRow = toStringArray(row)
    if (!parsedRow) {
      return null
    }
    rows.push(parsedRow)
  }

  return rows
}

function toTableData(raw: unknown): TableData | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const value = raw as {
    headers?: unknown
    rows?: unknown
    caption?: unknown
  }

  const headers = toStringArray(value.headers)
  const rows = toRows(value.rows)

  if (!headers || !rows) {
    return null
  }

  const caption =
    typeof value.caption === "string" && value.caption.trim().length > 0
      ? value.caption.trim()
      : undefined

  return { headers, rows, caption }
}

function extractTablesFromContent(content: string): {
  content: string
  tables: TableData[]
} {
  const tables: TableData[] = []
  let sanitizedContent = content

  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/gi

  sanitizedContent = sanitizedContent.replace(codeBlockRegex, (match, jsonPayload) => {
    try {
      const parsed = JSON.parse(jsonPayload) as {
        tables?: unknown
        table?: unknown
      }

      const candidateTables: unknown[] = Array.isArray(parsed.tables)
        ? parsed.tables
        : parsed.table !== undefined
        ? [parsed.table]
        : []

      const validTables = candidateTables
        .map((table) => toTableData(table))
        .filter((table): table is TableData => table !== null)

      if (validTables.length > 0) {
        tables.push(...validTables)
        return ""
      }
    } catch (error) {
      // Ignore parsing errors and keep the original match
    }

    return match
  })

  sanitizedContent = sanitizedContent.replace(/\n{3,}/g, "\n\n").trim()

  return { content: sanitizedContent, tables }
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

    const firstChoice = completion.choices?.[0]
    const originalContent = firstChoice?.message?.content ?? ""

    const { content: cleanedContent, tables } =
      typeof originalContent === "string"
        ? extractTablesFromContent(originalContent)
        : { content: originalContent ?? "", tables: [] as TableData[] }

    const toolInvocations: ToolInvocation[] = tables.map((table, index) => ({
      toolName: "displayTable",
      toolCallId: `table-${index}`,
      state: "result",
      result: table,
    }))

    const updatedChoices =
      completion.choices?.map((choice, index) => {
        if (!choice?.message) {
          return choice
        }

        if (index === 0) {
          return {
            ...choice,
            message: {
              ...choice.message,
              content: cleanedContent,
            },
          }
        }

        return choice
      }) ?? []

    const responsePayload = {
      ...completion,
      choices: updatedChoices,
      toolInvocations,
    }

    return Response.json(responsePayload)
  } catch (error) {
    console.error("Error in AI helper API:", error)

    if (error instanceof OpenAI.APIError) {
      return new Response(error.message, { status: error.status ?? 500 })
    }

    return new Response("Error processing request", { status: 500 })
  }
}
