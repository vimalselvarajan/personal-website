import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLElement> & { as?: "div" | "section" };

export function Container({ as: Component = "div", className, ...props }: ContainerProps) {
  return <Component className={cn("app-container mx-auto w-full max-w-7xl", className)} {...props} />;
}
