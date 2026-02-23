
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "../../lib/utils"

const Label = React.forwardRef<_React.ElementRef<typeof LabelPrimitive.Root>,_React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root_>>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
