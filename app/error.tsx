"use client";

import { useEffect } from "react";

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
    <section
      role="alert"
      aria-live="assertive"
      className="grid min-h-[65svh] place-items-center px-5 py-20 text-center"
      aria-labelledby="error-heading"
    >
      <div className="max-w-xl">
        <p className="eyebrow">Unexpected error</p>
        <h1 id="error-heading" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          This page could not be displayed.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          The problem may be temporary. Try rendering the page again.
        </p>
        <button type="button" className="mt-8 min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground" onClick={retry}>
          Try again
        </button>
      </div>
    </section>
  );
}
