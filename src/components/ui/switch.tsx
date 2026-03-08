import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-primary/85 bg-slate-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.55)] transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/12 data-[state=unchecked]:bg-slate-100 dark:border-primary/70 dark:bg-white/10 dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full border border-slate-600/85 bg-slate-600 shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:translate-x-0 dark:data-[state=unchecked]:border-white/30 dark:data-[state=unchecked]:bg-white dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
