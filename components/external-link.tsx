import type { AnchorHTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";
import { assertSafeExternalHref } from "@/lib/links";
import { cn } from "@/lib/utils";

export type ExternalAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "rel" | "target"
> & { href: string };

export function ExternalAnchor({ children, href, ...props }: ExternalAnchorProps) {
  assertSafeExternalHref(href);

  return (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ExternalLink({ children, className, ...props }: ExternalAnchorProps) {
  return (
    <ExternalAnchor
      {...props}
      className={cn("inline-flex items-center gap-1.5 text-link underline-offset-4 hover:underline", className)}
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </ExternalAnchor>
  );
}
