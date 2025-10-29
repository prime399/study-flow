import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  userSettings: defineTable({
    userId: v.id("users"),
    isOnboardingDone: v.boolean(),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_creation", ["createdAt"]),
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
    groupId: v.id("groups"),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId", "createdAt"])
    .index("by_user", ["userId", "createdAt"]),
  studySessions: defineTable({
    userId: v.id("users"),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.number(),
    type: v.string(),
    completed: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "startTime"]),
  studySettings: defineTable({
    userId: v.id("users"),
    studyDuration: v.number(),
    dailyGoal: v.optional(v.number()),
    totalStudyTime: v.number(),
    coinsBalance: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_total_time", ["totalStudyTime"]),
  todos: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    dueDate: v.optional(v.number()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),
  spotifyTokens: defineTable({
    userId: v.id("users"),
    accessToken: v.string(), // Encrypted
    refreshToken: v.string(), // Encrypted
    expiresAt: v.number(),
    scope: v.string(),
    tokenType: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
})
