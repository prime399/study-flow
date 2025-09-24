import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/api/auth"]);

export default convexAuthNextjsMiddleware((request) => {
	if (!isPublicRoute(request) && !request.convexAuth.isAuthenticated()) {
		return nextjsMiddlewareRedirect(request, "/");
	}
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
