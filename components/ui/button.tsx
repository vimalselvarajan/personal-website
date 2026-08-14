import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "border border-primary/75 bg-primary px-5 text-primary-foreground shadow-[0_14px_28px_-18px_var(--primary)] hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_18px_32px_-18px_var(--primary)]",
        secondary: "border border-border bg-surface/90 px-5 text-foreground shadow-[0_10px_24px_-22px_var(--foreground)] hover:-translate-y-px hover:border-foreground/20 hover:bg-surface",
        ghost: "px-3 text-muted-foreground hover:bg-foreground/7 hover:text-foreground",
        glass: "glass-control border border-border/80 bg-surface/45 px-3 text-muted-foreground shadow-[0_8px_20px_-18px_var(--foreground)] hover:-translate-y-px hover:border-foreground/18 hover:bg-surface/70 hover:text-foreground",
        link: "min-h-0 rounded-none p-0 text-link underline-offset-4 hover:scale-100 hover:underline",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-4 text-xs",
        icon: "size-11 shrink-0 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
