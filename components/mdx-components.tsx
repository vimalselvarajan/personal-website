import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ExternalLink } from "@/components/external-link";
import { isInternalHref, isSafeSameTabHref, opensInNewTab } from "@/lib/links";

function MdxLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (isInternalHref(href)) return <Link href={href} {...props}>{children}</Link>;
  if (opensInNewTab(href)) return <ExternalLink href={href} {...props}>{children}</ExternalLink>;
  if (isSafeSameTabHref(href)) return <a href={href} {...props}>{children}</a>;
  throw new Error(`Unsupported MDX link destination: ${href}`);
}

export const mdxComponents = {
  a: MdxLink,
};
