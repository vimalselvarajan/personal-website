import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/85 bg-surface/88 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-[0_5px_15px_-14px_var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}
