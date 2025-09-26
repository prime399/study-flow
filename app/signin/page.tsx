"use client"

import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"
import Logo from "@/components/logo"
import { MagicCard } from "@/components/ui/magic-card"
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import githubLogo from "@/public/github-mark.svg"
import googleLogo from "@/public/google-logo.svg"

export default function SignInPage() {
  const { signIn } = useAuthActions()

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/90 to-muted">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35)_0,_transparent_60%)]" />
      <MagicCard
        className="mx-4 w-full max-w-md rounded-3xl border border-border/60 p-[1px] shadow-2xl"
        gradientSize={250}
        gradientColor="#8B5CF6"
        gradientFrom="#8B5CF6"
        gradientTo="#EC4899"
        gradientOpacity={0.2}
      >
        <Card className="rounded-[inherit] border border-border/20 bg-background/80 p-8 text-foreground shadow-none backdrop-blur">
          <CardHeader className="items-center space-y-4 p-0 text-center">
            <Logo />
            <CardDescription className="text-balance text-base text-muted-foreground">
              Compete with friends, join study groups, and track your progress to
              become a top student.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex w-full flex-col gap-3 p-0 pt-8">
            <Button
              className="w-full"
              variant="outline"
              type="button"
              onClick={() => void signIn("google", { redirectTo: "/dashboard" })}
            >
              <Image
                className="mr-2"
                src={googleLogo}
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
            <Button
              className="w-full"
              variant="outline"
              type="button"
              onClick={() => void signIn("github", { redirectTo: "/dashboard" })}
            >
              <Image
                className="mr-2 dark:invert"
                src={githubLogo}
                alt="Github Logo"
                width={20}
                height={20}
              />
              Sign in with Github
            </Button>
          </CardFooter>
        </Card>
      </MagicCard>
    </div>
  )
}



