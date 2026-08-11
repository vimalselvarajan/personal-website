import type { AnchorHTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "rel" | "target"> & { href: string };

export function ExternalLink({ children, className, ...props }: ExternalLinkProps) {
  return (
    <a {...props} className={cn("inline-flex items-center gap-1.5 text-link underline-offset-4 hover:underline", className)} target="_blank" rel="noopener noreferrer">
      {children}<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </a>
  );
}
