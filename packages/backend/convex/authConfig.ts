import type { ConvexAuthConfig } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";

const providers: ConvexAuthConfig["providers"] = [
  GitHub({
    // Convex requires literal strings when pushing auth config.
    clientId: process.env.AUTH_GITHUB_ID ?? "",
    clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
  }),
];

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
}

const secret = process.env.CONVEX_AUTH_SECRET ?? "";

export const authConfig: ConvexAuthConfig = {
  providers,
  ...(secret ? { secret: [secret] } : {}),
};
