"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";

export default function Header() {
	const { signIn, signOut } = useAuthActions();
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/todos", label: "Todos" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<Authenticated>
						<Button onClick={() => void signOut()} size="sm">
							Sign Out
						</Button>
					</Authenticated>
					<Unauthenticated>
						<div className="flex gap-2">
							<Button
								onClick={() => void signIn("github")}
								variant="outline"
								size="sm"
							>
								GitHub
							</Button>
							<Button
								onClick={() => void signIn("google")}
								variant="outline"
								size="sm"
							>
								Google
							</Button>
						</div>
					</Unauthenticated>
					<ModeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
