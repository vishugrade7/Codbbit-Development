
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { showTicks?: boolean }
>(({ className, showTicks, ...props }, ref) => {
  const { min = 0, max = 100, step = 1 } = props;
  const ticks = showTicks ? Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step) : [];

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary transition-all" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {showTicks && (
        <span
          className="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 px-1 text-xs font-medium"
          aria-hidden="true"
        >
          {ticks.map((tickValue) => (
            <span
              key={tickValue}
              className="flex w-0 flex-col items-center justify-center gap-2"
            >
              <span
                className={cn(
                  "bg-muted-foreground/70 h-1 w-px",
                )}
              />
              <span className={cn(
                "text-xs",
                (tickValue % 2 !== 0 && tickValue !== min && tickValue !== max) && "opacity-0"
              )}>
                {tickValue}
              </span>
            </span>
          ))}
        </span>
      )}
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

