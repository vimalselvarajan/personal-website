import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[65svh] max-w-7xl place-items-center px-5 py-20 text-center sm:px-8">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-surface"><SearchX aria-hidden="true" className="size-6 text-link" /></span>
        <p className="mt-7 eyebrow">404 · Not found</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">This path does not lead to a portfolio entry.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">The link may be outdated. Return home or browse the project index.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/"><ArrowLeft aria-hidden="true" className="size-4" />Return home</Link></Button><Button asChild variant="secondary"><Link href="/projects">Browse projects</Link></Button></div>
      </div>
    </section>
  );
}
