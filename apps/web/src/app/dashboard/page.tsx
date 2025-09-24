"use client";

import { api } from "@study-mate/backend/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
	const { signOut } = useAuthActions();
	const privateData = useQuery(api.privateData.get);

	return (
		<>
			<Authenticated>
				<div className="p-8">
					<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
					<p className="mb-4">privateData: {privateData?.message}</p>
					<Button onClick={() => void signOut()}>Sign Out</Button>
				</div>
			</Authenticated>
			<Unauthenticated>
				<div className="p-8">
					<h1 className="text-2xl font-bold mb-4">Welcome to Study Mate</h1>
					<p className="mb-4">Please sign in to continue</p>
					<SignInComponent />
				</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="p-8">Loading...</div>
			</AuthLoading>
		</>
	);
}

function SignInComponent() {
	const { signIn } = useAuthActions();

	return (
		<div className="space-y-4">
			<Button
				onClick={() => void signIn("github")}
				className="w-full"
				variant="outline"
			>
				Sign in with GitHub
			</Button>
			<Button
				onClick={() => void signIn("google")}
				className="w-full"
				variant="outline"
			>
				Sign in with Google
			</Button>
		</div>
	);
}
