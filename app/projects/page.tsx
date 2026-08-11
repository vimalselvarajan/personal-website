import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl, assetUrl } from "@/config/site";
import { contentRepository } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Vimal Selvarajan spanning C++, PCB design, embedded systems, test automation, and bioinformatics.",
  alternates: { canonical: absoluteUrl("/projects") },
};

export default function ProjectsPage() {
  const projects = contentRepository.list("projects");

  return (
    <>
      <PageIntro
        eyebrow="Selected work"
        title="Projects across hardware and software."
        description="PCB design, embedded interfaces, C++ systems, laboratory automation, and bioinformatics algorithms."
      />
      <Container as="section" className="py-16 sm:py-24">
        <div className="space-y-16 sm:space-y-24">
          {projects.map((project, index) => (
            <article key={project.frontmatter.slug} className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className={index % 2 === 0 ? "lg:col-span-6" : "lg:order-2 lg:col-span-6"}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border bg-white shadow-sm">
                  <Image
                    src={assetUrl(project.frontmatter.cardImage?.src ?? project.frontmatter.image)}
                    alt={project.frontmatter.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 608px, (min-width: 1024px) calc(50vw - 4rem), calc(100vw - 2.5rem)"
                    loading={index === 0 ? "eager" : undefined}
                    fetchPriority={index === 0 ? "high" : undefined}
                    decoding={index === 0 ? "sync" : "async"}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className={index % 2 === 0 ? "lg:col-span-6 lg:pl-8" : "lg:col-span-6 lg:pr-8"}>
                <span className="text-sm font-semibold text-link">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">{project.frontmatter.title}</h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">{project.frontmatter.summary}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {project.frontmatter.stack.map((technology) => <Badge key={technology}>{technology}</Badge>)}
                </div>
                <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
                  <Link href={`/projects/${project.frontmatter.slug}`} className="inline-flex min-h-11 items-center gap-2 text-link hover:underline">
                    Project details <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <a href={project.frontmatter.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-muted-foreground hover:text-foreground">
                    GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
