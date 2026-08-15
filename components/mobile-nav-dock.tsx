"use client";

import Link from "next/link";
import { FileText, FlaskConical, FolderKanban, House } from "lucide-react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import { ExternalAnchor } from "@/components/external-link";
import { GlassSurface } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DockIcon({ label }: { label: string }) {
  const Icon = label === "Projects"
    ? FolderKanban
    : label === "Research"
      ? FlaskConical
      : label === "Résumé"
        ? FileText
        : House;

  return <Icon aria-hidden="true" className="size-[1.15rem]" />;
}

type MobileNavDockProps = { items: readonly NavItem[] };

export function MobileNavDock({ items }: MobileNavDockProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile primary" className="mobile-nav-dock lg:hidden">
      <GlassSurface material="thick" className="mobile-nav-dock-surface">
        {items.map((item) => {
          const active = !item.external && isCurrent(pathname, item.href);
          const className = cn(
            "mobile-nav-dock-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "is-active",
          );
          const content = (
            <>
              <DockIcon label={item.label} />
              <span>{item.label}</span>
            </>
          );

          return item.external ? (
            <ExternalAnchor key={item.href} href={item.href} className={className}>
              {content}
            </ExternalAnchor>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              transitionTypes={["nav-root"]}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </GlassSurface>
    </nav>
  );
}
