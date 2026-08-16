"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { type NavItem, visibleNavigationItems } from "@/config/site";
import { ExternalAnchor } from "@/components/external-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteNavProps = { items: readonly NavItem[] };

export function SiteNav({ items }: SiteNavProps) {
  const pathname = usePathname();
  const visibleItems = visibleNavigationItems(items, pathname);

  return (
    <>
      <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
        {visibleItems.map((item) => {
          const className = cn(
            "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-[background-color,color,transform] duration-200 hover:-translate-y-px hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none",
            !item.external && isCurrent(pathname, item.href) && "bg-foreground/8 text-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--surface)_65%,transparent)]",
          );

          return item.external ? (
            <ExternalAnchor key={item.href} href={item.href} className={cn(className, "gap-1")}>
              {item.label}<ArrowUpRight aria-hidden="true" className="size-3.5" />
            </ExternalAnchor>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              transitionTypes={["nav-root"]}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              aria-label={item.label === "Résumé" ? "Résumé navigation" : undefined}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-1 lg:ml-1">
        <ThemeToggle />
      </div>
    </>
  );
}
