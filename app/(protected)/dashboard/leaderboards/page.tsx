"use client"
import PageTitle from "@/components/page-title"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { cn, formatDuration } from "@/lib/utils"
import { useQuery } from "convex/react"
import { Clock, Crown, Medal, Trophy, User, Users, TrendingUp, Zap, Target } from "lucide-react"
import { ReactNode } from "react"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  email?: string
  avatar?: string
  totalStudyTime: number
}

interface LeaderboardCardProps {
  title: string
  description: string
  icon: ReactNode
  data: LeaderboardEntry[]
}

function PersonalStatsCard({ userRanking }: { userRanking: any }) {
  const stats = [
    {
      label: "Global Rank",
      value: userRanking.rank ? `#${userRanking.rank}` : "Not Ranked",
      icon: <Trophy className="h-5 w-5" />,
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Total Study Time",
      value: formatDuration(userRanking.totalStudyTime || 0),
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Performance",
      value: userRanking.rank && userRanking.rank <= 10 ? "Top 10" : "Growing",
      icon: <TrendingUp className="h-5 w-5" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
  ]

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="rounded-lg bg-primary/10 p-2">
            <User className="h-6 w-6 text-primary" />
          </div>
          Your Performance Dashboard
        </CardTitle>
        <CardDescription className="text-base">
          Track your progress and see how you rank globally
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1",
                stat.bgColor,
                stat.borderColor
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn("rounded-full p-3", stat.iconColor)}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LeaderboardCard({
  title,
  description,
  icon,
  data,
}: LeaderboardCardProps) {
  const getRankBadge = (rank: number) => {
    const badges = {
      1: { 
        icon: <Crown className="h-4 w-4" />, 
        bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        textColor: "text-white",
        borderColor: "border-yellow-300"
      },
      2: { 
        icon: <Medal className="h-4 w-4" />, 
        bgColor: "bg-gradient-to-r from-gray-300 to-gray-500",
        textColor: "text-white",
        borderColor: "border-gray-300"
      },
      3: { 
        icon: <Medal className="h-4 w-4" />, 
        bgColor: "bg-gradient-to-r from-amber-500 to-amber-700",
        textColor: "text-white",
        borderColor: "border-amber-300"
      },
    }
    return badges[rank as keyof typeof badges]
  }

  const getRowStyle = (rank: number) => {
    if (rank <= 3) {
      return "bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary"
    }
    return "hover:bg-muted/50 transition-colors"
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="rounded-lg bg-primary/10 p-2">
                {icon}
              </div>
              {title}
            </CardTitle>
            <CardDescription className="text-base ml-12">
              {description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {data.length} Students
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-background/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-[120px] font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="text-right font-semibold">Study Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((leader, index) => (
                <TableRow 
                  key={leader.userId}
                  className={cn(
                    "transition-all duration-200",
                    getRowStyle(leader.rank)
                  )}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {getRankBadge(leader.rank) ? (
                        <div
                          className={cn(
                            "rounded-full p-2 shadow-sm border",
                            getRankBadge(leader.rank)?.bgColor,
                            getRankBadge(leader.rank)?.borderColor
                          )}
                        >
                          <div className={getRankBadge(leader.rank)?.textColor}>
                            {getRankBadge(leader.rank)?.icon}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                          {leader.rank}
                        </div>
                      )}
                      {leader.rank <= 3 && (
                        <Badge 
                          variant={leader.rank === 1 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {leader.rank === 1 ? "Champion" : leader.rank === 2 ? "Runner-up" : "3rd Place"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={leader.avatar} alt={leader.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {leader.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-semibold text-base">{leader.name}</span>
                        {leader.rank <= 3 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">Top Performer</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="space-y-1">
                      <div className="text-lg font-bold">
                        {formatDuration(leader.totalStudyTime)}
                      </div>
                      {leader.rank <= 5 && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Elite
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 10 && (
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="px-4 py-2">
              Showing top 10 of {data.length} students
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LeaderboardsPage() {
  const globalLeaderboard = useQuery(api.leaderboards.getStudyTimeLeaderboard)
  const userRanking = useQuery(api.leaderboards.getUserRanking)
  const myGroups = useQuery(api.groups.listMyGroups)

  if (!globalLeaderboard || !userRanking || !myGroups) {
    return <LoadingState />
  }

  if (globalLeaderboard.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <PageTitle title="Leaderboards" />
          <p className="text-lg text-muted-foreground">
            Track your ranking and compete with other students
          </p>
        </div>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <h3 className="mb-4 text-2xl font-bold">Ready to Compete?</h3>
            <p className="text-muted-foreground text-lg mb-6 max-w-md">
              Complete some study sessions to see the leaderboard and start competing with other students!
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Study Time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Global Rankings</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4" />
                <span>Achievement Badges</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <PageTitle title="Leaderboards" />
        <div className="flex items-center justify-between">
          <p className="text-lg text-muted-foreground">
            Track your ranking and compete with other students
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{globalLeaderboard.length} Active Students</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <PersonalStatsCard userRanking={userRanking} />
        <LeaderboardCard
          title="Global Rankings"
          description="Top students across all groups and study sessions"
          icon={<Trophy className="h-5 w-5 text-primary" />}
          data={globalLeaderboard}
        />
      </div>
    </div>
  )
}
