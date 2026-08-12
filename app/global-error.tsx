"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body style={{ margin: 0, colorScheme: "light dark", fontFamily: "system-ui, sans-serif" }}>
        <title>Page error - Vimal Selvarajan</title>
        <main
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            textAlign: "center",
            background: "Canvas",
            color: "CanvasText",
          }}
        >
          <div style={{ maxWidth: "36rem" }}>
            <h1 style={{ fontSize: "clamp(2rem, 8vw, 4rem)", lineHeight: 1.05 }}>
              The portfolio could not be displayed.
            </h1>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
              The problem may be temporary. Try rendering the site again.
            </p>
            <button
              type="button"
              onClick={retry}
              style={{ minHeight: "2.75rem", marginTop: "1rem", padding: "0.65rem 1.25rem", borderRadius: "999px" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
