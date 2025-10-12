
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// ----------------------------------------------------------------------

type TimelineContextValue = {
  defaultValue?: number
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null)

const useTimelineContext = () => {
  const context = React.useContext(TimelineContext)

  if (!context) {
    throw new Error(
      "useTimelineContext must be used within a <Timeline />"
    )
  }

  return context
}

// ----------------------------------------------------------------------

type TimelineProps = React.HTMLAttributes<HTMLOListElement> & {
  defaultValue?: number
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ children, className, defaultValue, ...props }, ref) => {
    const value = React.useMemo(
      () => ({
        defaultValue,
      }),
      [defaultValue]
    )

    return (
      <TimelineContext.Provider value={value}>
        <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
          {children}
        </ol>
      </TimelineContext.Provider>
    )
  }
)

Timeline.displayName = "Timeline"

// ----------------------------------------------------------------------

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    step?: number
  }
>(({ children, className, step, ...props }, ref) => {
  const { defaultValue } = useTimelineContext()

  const isCompleted = defaultValue && step ? defaultValue >= step : false

  return (
    <li
      ref={ref}
      data-completed={isCompleted}
      className={cn(
        "flex-1 gap-4",
        "flex flex-row items-start",
        "[&:not(:last-child)]:pb-10",
        "data-[completed=true]:[--indicator-color:hsl(var(--primary))]",
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
})

TimelineItem.displayName = "TimelineItem"

// ----------------------------------------------------------------------

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-[auto,1fr] items-center gap-x-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))

TimelineHeader.displayName = "TimelineHeader"

// ----------------------------------------------------------------------

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => (
  <h6
    ref={ref}
    className={cn(
      "col-start-2 row-start-1",
      "text-base font-semibold leading-none",
      className
    )}
    {...props}
  >
    {children}
  </h6>
))

TimelineTitle.displayName = "TimelineTitle"

// ----------------------------------------------------------------------

const TimelineDate = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "col-start-2 row-start-2",
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </p>
))

TimelineDate.displayName = "TimelineDate"

// ----------------------------------------------------------------------

const TimelineIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("col-start-1 row-span-2 row-start-1", className)}
    {...props}
  >
    <div
      className={cn(
        "flex size-4 items-center justify-center rounded-full border-2 border-[var(--indicator-color,hsl(var(--border)))] bg-background"
      )}
    >
      <div
        className={cn(
          "size-2.5 rounded-full bg-[var(--indicator-color,hsl(var(--border)))]"
        )}
      />
    </div>
  </div>
))

TimelineIndicator.displayName = "TimelineIndicator"

// ----------------------------------------------------------------------

const TimelineSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-1 row-span-full row-start-1",
      "flex items-center justify-center",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "h-full w-px",
        "bg-[var(--indicator-color,hsl(var(--border)))]"
      )}
    />
  </div>
))

TimelineSeparator.displayName = "TimelineSeparator"

// ----------------------------------------------------------------------

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("col-start-2 min-w-0 pb-1 ps-4", className)}
    {...props}
  >
    {children}
  </div>
))

TimelineContent.displayName = "TimelineContent"

// ----------------------------------------------------------------------

export {
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineTitle,
  TimelineDate,
  TimelineIndicator,
  TimelineSeparator,
  TimelineContent,
}
