"use client"
import PageTitle from "@/components/page-title"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { CalendarEvent, StudySession } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { format, getDay, parse, startOfWeek } from "date-fns"
import { enUS } from "date-fns/locale"
import { useState } from "react"
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { CalendarHeader } from "./_components/calendar-header"
import { CalendarToolbar } from "./_components/calendar-toolbar"
import { SessionDialog } from "./_components/session-dialog"
import "./styles.css"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarPage() {
  const stats = useQuery(api.study.getFullStats)
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(
    null,
  )
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  if (!stats) {
    return <LoadingSkeleton />
  }

  const events: CalendarEvent[] = stats.recentSessions.map((session) => {
    const startTime = new Date(session.startTime)
    const endTime = session.endTime ? new Date(session.endTime) : new Date(session.startTime + 1000 * 60 * 30) // Default 30min if no end time
    const timeString = format(startTime, 'HH:mm')
    
    return {
      title: `${timeString} - ${session.type}`,
      start: startTime,
      end: endTime,
      allDay: false,
      resource: session,
    }
  })

  const eventStyleGetter = (event: CalendarEvent) => {
    const isCompleted = event.resource.completed
    return {
      className: cn(
        "border rounded-md px-1 py-0.5 text-xs font-medium transition-colors overflow-hidden",
        isCompleted
          ? "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
          : "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50",
      ),
      style: {
        border: 'none',
        borderRadius: '4px',
        fontSize: '11px',
        lineHeight: '1.2',
        height: 'auto',
        maxHeight: '100%',
        minHeight: '18px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }
    }
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  return (
    <div className="">
      <PageTitle title="Study Calendar" />
      <Card className="w-[calc(100svw-50px)] p-4 md:w-full">
        <ScrollArea>
          <div className="h-[calc(100svh-150px)]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => setSelectedSession(event.resource)}
              components={{
                toolbar: CalendarToolbar,
                header: CalendarHeader,
              }}
              popup={true}
              popupOffset={5}
              selectable
              className="calendar bg-background text-foreground"
              dayPropGetter={(date) => ({
                className: "bg-background text-foreground hover:bg-accent/50 transition-colors",
              })}
              slotPropGetter={() => ({
                className: "bg-background text-foreground border-border",
              })}
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 6, 0, 0)}
              max={new Date(2024, 0, 1, 22, 0, 0)}
              scrollToTime={new Date(2024, 0, 1, 8, 0, 0)}
              showMultiDayTimes={true}
              rtl={false}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      <SessionDialog
        session={selectedSession}
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="">
      <PageTitle title="Study Calendar" />
      <Card>
        <div className="h-[calc(100svh-150px)] p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    </div>
  )
}
