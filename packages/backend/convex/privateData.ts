import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return {
				message: "Not authenticated",
			};
		}
		const user = await ctx.db.get(userId);
		return {
			message: `This is private data for ${user?.name || user?.email || "user"}`,
		};
	},
});
