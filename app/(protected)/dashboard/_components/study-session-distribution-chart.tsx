"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SessionCounts {
  completed: number;
  incomplete: number;
}

interface ProcessedData {
  [key: string]: SessionCounts;
}

interface ChartDataPoint extends SessionCounts {
  date: string;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))", // Uses theme chart color
  },
  incomplete: {
    label: "Incomplete", 
    color: "hsl(var(--chart-2))", // Uses theme chart color
  },
} satisfies ChartConfig;

const GridBackgroundPattern = () => {
  return (
    <>
      <pattern
        id="grid-pattern"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 20 0 L 0 0 0 20"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </pattern>
      <pattern
        id="fine-grid-pattern"
        x="0"
        y="0"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 10 0 L 0 0 0 10"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.25"
          opacity="0.15"
        />
      </pattern>
    </>
  );
};

export default function StudySessionDistribution({
  recentSessions,
}: {
  recentSessions: {
    startTime: string;
    endTime: string | null;
    duration: number;
    type: string;
    completed: boolean;
  }[];
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Process data before any conditional returns
  const processedData = React.useMemo(() => {
    return recentSessions.reduce<ProcessedData>((acc, session) => {
      const date = new Date(session.startTime).toISOString().split('T')[0]; // Use YYYY-MM-DD format
      if (!acc[date]) {
        acc[date] = { completed: 0, incomplete: 0 };
      }
      session.completed ? acc[date].completed++ : acc[date].incomplete++;
      return acc;
    }, {});
  }, [recentSessions]);

  const data: ChartDataPoint[] = React.useMemo(() => {
    return Object.entries(processedData)
      .map(([date, counts]) => ({
        date,
        completed: counts.completed,
        incomplete: counts.incomplete,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Show last 7 days
  }, [processedData]);

  const activeData = React.useMemo(() => {
    if (activeIndex === null) return null;
    return data[activeIndex];
  }, [activeIndex, data]);

  // Early return after all hooks
  if (!recentSessions.length) {
    return (
      <Card className="h-[300px]">
        <CardHeader className="flex items-center justify-center">
          <CardTitle>Daily Study Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col items-center gap-4 py-10">
          <p className="text-balance text-center text-muted-foreground">
            No study sessions recorded yet. Complete your first session to see
            your daily progress!
          </p>
          <Button asChild>
            <Link href="/dashboard/study">Start Studying</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalIncomplete = data.reduce((sum, item) => sum + item.incomplete, 0);
  const totalSessions = totalCompleted + totalIncomplete;
  const completionRate = totalSessions > 0 ? (totalCompleted / totalSessions) * 100 : 0;

  const getTrendIcon = () => {
    if (completionRate >= 70) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (completionRate >= 70) {
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50";
    }
    return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Daily Study Sessions</CardTitle>
          <Badge
            variant="outline"
            className={`${getTrendColor()} border-none font-medium px-2.5 py-1`}
          >
            {getTrendIcon()}
            <span className="ml-1">{completionRate.toFixed(1)}%</span>
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {activeData ? (
            <div className="flex items-center gap-4 text-xs">
              <span className="font-medium">{new Date(activeData.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                  <span>Completed: {activeData.completed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                  <span>Incomplete: {activeData.incomplete}</span>
                </div>
              </div>
            </div>
          ) : (
            <span>Hover over bars to see daily breakdown • Last 7 days</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
            onMouseLeave={() => setActiveIndex(null)}
            barCategoryGap="25%"
          >
            <defs>
              <GridBackgroundPattern />
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="incompleteGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            
            {/* Grid Background */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#fine-grid-pattern)"
            />
            
            {/* Cartesian Grid for better data reading */}
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="hsl(var(--border))"
              opacity={0.4}
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              axisLine={false}
              className="text-xs text-muted-foreground"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
              tickFormatter={(value) => `${value}`}
              domain={[0, 'dataMax + 1']}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              content={<ChartTooltipContent 
                indicator="dot" 
                labelClassName="font-medium"
                className="rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg"
              />}
            />
            <Bar 
              dataKey="completed" 
              fill="url(#completedGradient)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-completed-${index}`}
                  fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.4}
                  stroke={activeIndex === index ? "hsl(var(--chart-1))" : "transparent"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                />
              ))}
            </Bar>
            <Bar 
              dataKey="incomplete" 
              fill="url(#incompleteGradient)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-incomplete-${index}`}
                  fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.4}
                  stroke={activeIndex === index ? "hsl(var(--chart-2))" : "transparent"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm bg-chart-1"></div>
            <span className="text-muted-foreground">Completed Sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm bg-chart-2"></div>
            <span className="text-muted-foreground">Incomplete Sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
