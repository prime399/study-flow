import { convexAuth } from "@convex-dev/auth/server";
import { authConfig } from "./authConfig";

export const { auth, signIn, signOut, store } = convexAuth(authConfig);
