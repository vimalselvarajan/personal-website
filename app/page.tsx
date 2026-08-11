import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Container } from "@/components/container";
import { absoluteUrl, siteConfig } from "@/config/site";
import profileImage from "@/vimal.jpg";

export const metadata: Metadata = {
  title: { absolute: siteConfig.metadata.title },
  description: siteConfig.metadata.description,
  alternates: { canonical: absoluteUrl() },
};

export default function HomePage() {
  return (
      <section data-landing-only className="relative overflow-hidden bg-surface">
        <Container className="relative min-h-[calc(100svh-4rem)] py-16 lg:grid lg:content-center lg:py-20">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><GraduationCap aria-hidden="true" className="size-4" />{siteConfig.university}</span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="order-3 lg:order-1">
              <p className="eyebrow">{siteConfig.role}</p>
              <h1 className="mt-5 max-w-5xl text-balance text-[clamp(3.35rem,9vw,7.8rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
                {siteConfig.name}
              </h1>
              <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">{siteConfig.introduction}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild><Link href="/projects">View projects <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
                <Button asChild variant="secondary"><Link href="/research">View research</Link></Button>
                <Button asChild variant="ghost"><Link href={siteConfig.links.resume}>Résumé <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
              </div>
              <nav aria-label="Social profiles" className="mt-9 max-w-2xl border-t border-border pt-6">
                <p className="eyebrow">Find me online</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <a
                    className="group flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-muted/45 p-3.5 transition-colors hover:border-foreground/25 hover:bg-muted"
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                      <GitHubIcon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold tracking-[-0.02em]">GitHub</span>
                      <span className="block truncate text-sm text-muted-foreground">@vimalselvarajan</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </a>
                  <a
                    className="group flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-muted/45 p-3.5 transition-colors hover:border-[#0a66c2]/50 hover:bg-muted"
                    href={siteConfig.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0a66c2] text-white">
                      <LinkedInIcon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold tracking-[-0.02em]">LinkedIn</span>
                      <span className="block truncate text-sm text-muted-foreground">Connect with me</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </a>
                </div>
              </nav>
            </div>

            <aside className="order-2 lg:order-2 lg:self-center" aria-label="Profile">
              <figure className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-border bg-muted" aria-hidden="true" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border bg-muted lg:aspect-[4/5]">
                  <Image
                    src={profileImage}
                    alt={`Portrait of ${siteConfig.name}`}
                    fill
                    sizes="(min-width: 1280px) 352px, (min-width: 1024px) 304px, calc(100vw - 2.5rem)"
                    fetchPriority="high"
                    placeholder="blur"
                    className="object-cover object-[62%_center]"
                  />
                </div>
              </figure>
            </aside>
          </div>
        </Container>
      </section>
  );
}
