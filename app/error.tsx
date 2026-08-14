"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function ErrorFallback({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container
      as="section"
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-heading"
      className="grid min-h-[65svh] place-items-center py-16 text-center sm:py-24"
    >
      <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-7 shadow-[0_28px_70px_-54px_var(--foreground)] sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-muted">
          <AlertTriangle aria-hidden="true" className="size-6 text-link" />
        </span>
        <p className="mt-7 eyebrow">Unexpected interruption</p>
        <h1 id="error-heading" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          This page could not be displayed.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          The issue may be temporary. Try the page again, or return to the portfolio overview.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={retry}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/" transitionTypes={["nav-root"]}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              Return home
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
