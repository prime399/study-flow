import GoToActionButton from "@/components/go-to-action-button"
import Logo from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Meteors from "@/components/ui/meteors"
import { Highlighter } from "@/components/ui/highlighter"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import {
  BarChart,
  BookOpen,
  Clock,
  Github,
  LineChart,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: <Timer className="h-12 w-12" />,
    title: "Focus Timer",
    description: "Customizable study sessions with break reminders",
    badge: "Popular",
  },
  {
    icon: <Trophy className="h-12 w-12" />,
    title: "Competitive Learning",
    description: "Global and group-based leaderboards",
  },
  {
    icon: <Users className="h-12 w-12" />,
    title: "Study Groups",
    description: "Create and join study groups for collaborative learning",
    badge: "New",
  },
  {
    icon: <BarChart className="h-12 w-12" />,
    title: "Progress Analytics",
    description: "Detailed insights into your study patterns",
  },
  {
    icon: <Target className="h-12 w-12" />,
    title: "Goal Setting",
    description: "Set and track daily and weekly study goals",
  },
  {
    icon: <Zap className="h-12 w-12" />,
    title: "Achievements",
    description: "Earn rewards for consistent study habits",
  },
]

const stats = [
  {
    value: "5,000+",
    label: "Active Students",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "500K+",
    label: "Study Hours",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "2,500+",
    label: "Study Groups",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    value: "25+",
    label: "Universities",
    icon: <Star className="h-4 w-4" />,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black relative">
      {/* Midnight Mist */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
          `,
        }}
      />
      
      <div className="flex min-h-screen flex-col relative z-10">
        <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between w-full">
              <Logo />
              <GoToActionButton />
            </div>
          </div>
        </header>

        <main className="relative flex-1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Meteors number={20} />
          </div>
        <section className="relative mx-auto space-y-8 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 z-20">
          <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-screen z-10 overflow-hidden">
            <Meteors number={20} />
          </div>
          <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center relative z-20">
            <h1 className="text-pretty text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl text-white">
              Study. Connect. <Highlighter 
                action="highlight" 
                color="#6366f1" 
                strokeWidth={1}
                animationDuration={1200}
                isView={true}
                padding={1}
              >
                Achieve.
              </Highlighter>
            </h1>
            <p className="max-w-[42rem] leading-normal text-gray-300 sm:text-xl sm:leading-8">
              Your intelligent study companion. Track progress, collaborate with peers, 
              and unlock your academic potential with AI-powered insights.
            </p>
            <div className="space-x-4">
              <Link href="/dashboard">
                <InteractiveHoverButton className="rounded-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                  Get Started
                </InteractiveHoverButton>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                asChild
              >
                <Link
                  href={"https://github.com/study-mate-project"}
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  Github
                </Link>
              </Button>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4">
                <div className="flex items-center gap-2 text-white">
                  {stat.icon}
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-5xl p-4">
            <div className="relative h-[400px] w-full rounded-[12px] bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-white/10 shadow-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
                    <Timer className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    StudyMate Dashboard Preview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    Your personalized study dashboard with analytics, goals, and progress tracking
                  </p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-white/20 rounded"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-white mb-6">
              Everything you need to excel
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Comprehensive tools designed for serious students who want to maximize their potential
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-white/70 group-hover:text-white group-hover:bg-white/10 transition-all duration-300">
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="mt-2 bg-white/10 text-white/80 border-white/20 text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/50 shadow-lg">
              <div className="absolute inset-0 h-full w-full">
                <Meteors number={30} />
              </div>
              <div className="relative z-10 p-12 text-center flex flex-col items-center">
                <LineChart className="h-12 w-12 text-gray-800" />
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-4">
                  Ready to Transform Your Study Habits?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                  Join thousands of students who are already improving their
                  academic performance with TopStudz.
                </p>
                <div className="mt-8">
                  <Link href="/dashboard">
                    <InteractiveHoverButton className="rounded-full border-gray-900 bg-gray-900 text-white hover:bg-gray-800">
                      Start Your Journey
                    </InteractiveHoverButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        </main>

        <footer className="relative border-t bg-[#0a0a0a]/80 backdrop-blur-sm border-white/5 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <p className="text-sm text-gray-400">
                © 2024 StudyMate. All rights reserved.
              </p>
              <Link
                href={"https://studymate.example.com"}
                className="text-sm text-gray-400 underline hover:text-white transition-colors"
                target="_blank"
              >
                Learn More
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
