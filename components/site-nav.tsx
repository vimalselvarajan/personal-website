"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteNavProps = { items: readonly NavItem[] };

export function SiteNav({ items }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    mobileNavigationRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    }

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }

    const desktop = window.matchMedia("(min-width: 64rem)");
    window.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleViewportChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleViewportChange);
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
        {items.map((item) => {
          const className = cn(
            "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
            !item.external && isCurrent(pathname, item.href) && "bg-muted text-foreground",
          );

          return item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={cn(className, "inline-flex items-center gap-1")}>
              {item.label}<ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          ) : (
            <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined} className={className}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          ref={menuButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </Button>
      </div>
      <div
        ref={mobileNavigationRef}
        id="mobile-navigation"
        className={cn(
          "absolute inset-x-0 top-full border-b border-border bg-background/98 px-4 py-3 shadow-lg backdrop-blur-xl lg:hidden",
          !open && "hidden",
        )}
      >
        <nav aria-label="Mobile primary" className="mx-auto grid max-w-7xl gap-1">
          {items.map((item) => {
            const className = cn(
              "flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !item.external && isCurrent(pathname, item.href) && "bg-muted text-foreground",
            );

            return item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center justify-between">
                <span className={cn(className, "w-full gap-2")}>{item.label}<ArrowUpRight aria-hidden="true" className="size-4" /></span>
              </a>
            ) : (
              <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined} onClick={() => setOpen(false)} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
