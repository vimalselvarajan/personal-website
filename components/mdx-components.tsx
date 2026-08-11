import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ExternalLink } from "@/components/external-link";

function MdxLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return <ExternalLink href={href} {...props}>{children}</ExternalLink>;
}

export const mdxComponents = {
  a: MdxLink,
};
