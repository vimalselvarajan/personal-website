"use client";

import { useEffect } from "react";
import { productionBasePath } from "@/config/site";

const homeHref = process.env.NODE_ENV === "production" ? productionBasePath + "/" : "/";

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
      <body style={{ margin: 0, colorScheme: "light dark", fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" }}>
        <title>Page error - Vimal Selvarajan</title>
        <main
          role="alert"
          aria-live="assertive"
          aria-labelledby="global-error-heading"
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            boxSizing: "border-box",
            padding: "clamp(1.25rem, 5vw, 3rem)",
            textAlign: "center",
            background: "Canvas",
            color: "CanvasText",
          }}
        >
          <div
            style={{
              width: "min(100%, 38rem)",
              boxSizing: "border-box",
              padding: "clamp(1.75rem, 6vw, 3.5rem)",
              border: "1px solid GrayText",
              borderRadius: "2rem",
              background: "Canvas",
              boxShadow: "0 28px 70px -52px GrayText",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                display: "grid",
                placeItems: "center",
                margin: "0 auto",
                border: "1px solid GrayText",
                borderRadius: "999px",
                color: "#0a66d8",
                fontSize: "1.35rem",
                fontWeight: 700,
              }}
            >
              !
            </span>
            <p style={{ margin: "1.5rem 0 0", color: "#0a66d8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Unexpected interruption
            </p>
            <h1
              id="global-error-heading"
              style={{
                margin: "1rem 0 0",
                fontSize: "clamp(2.25rem, 8vw, 4.25rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.055em",
              }}
            >
              The portfolio could not be displayed.
            </h1>
            <p style={{ maxWidth: "31rem", margin: "1.25rem auto 0", color: "GrayText", fontSize: "1.05rem", lineHeight: 1.7 }}>
              The issue may be temporary. Try loading the site again, or return to the portfolio overview.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={retry}
                style={{
                  minHeight: "2.75rem",
                  padding: "0.65rem 1.25rem",
                  border: "1px solid #0a66d8",
                  borderRadius: "999px",
                  background: "#0a66d8",
                  color: "white",
                  font: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href={homeHref}
                style={{
                  minHeight: "2.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  padding: "0.65rem 1.25rem",
                  border: "1px solid GrayText",
                  borderRadius: "999px",
                  color: "CanvasText",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Return home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
