import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
      <Container as="section" aria-labelledby="not-found-heading" className="grid min-h-[65svh] place-items-center py-16 text-center sm:py-24">
      <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-7 shadow-[0_28px_70px_-54px_var(--foreground)] sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-muted">
          <SearchX aria-hidden="true" className="size-6 text-link" />
        </span>
        <p className="mt-7 eyebrow">404 · Not found</p>
        <h1 id="not-found-heading" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          This path does not lead to a portfolio entry.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          The link may be outdated. Return to the overview or continue through the project archive.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/" transitionTypes={["nav-root"]}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              Return home
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/projects" transitionTypes={["nav-root"]}>Browse projects</Link>
          </Button>
        </div>
      </div>
      </Container>
  );
}
