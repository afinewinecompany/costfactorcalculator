import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group py-2",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-slate-200 to-slate-100 shadow-inner">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#2F739E] to-[#4A90B8] transition-all duration-150 ease-out" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-[#2F739E] bg-white shadow-lg ring-0 transition-all duration-150 ease-out hover:scale-110 hover:shadow-xl hover:border-[#4A90B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F739E]/30 focus-visible:ring-offset-2 active:scale-105 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
