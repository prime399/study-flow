/**
 * System prompt builder for AI assistant
 * Constructs personalized context based on user data
 */

import { AIRequestBody } from "@/lib/types"
import { formatDuration } from "@/lib/utils"

export function buildSystemPrompt({
  userName,
  studyStats,
  groupInfo,
}: {
  userName: string | undefined
  studyStats: AIRequestBody["studyStats"]
  groupInfo: AIRequestBody["groupInfo"]
}): string {
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