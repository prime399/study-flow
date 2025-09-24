import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAll = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error("Not authenticated");
		}
		return await ctx.db
			.query("todos")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		text: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error("Not authenticated");
		}
		const newTodoId = await ctx.db.insert("todos", {
			text: args.text,
			completed: false,
			userId,
		});
		return await ctx.db.get(newTodoId);
	},
});

export const toggle = mutation({
	args: {
		id: v.id("todos"),
		completed: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error("Not authenticated");
		}
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) {
			throw new Error("Todo not found or access denied");
		}
		await ctx.db.patch(args.id, { completed: args.completed });
		return { success: true };
	},
});

export const deleteTodo = mutation({
	args: {
		id: v.id("todos"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error("Not authenticated");
		}
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) {
			throw new Error("Todo not found or access denied");
		}
		await ctx.db.delete(args.id);
		return { success: true };
	},
});
