import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCardImage } from "@/components/project-card-image";
import { Badge } from "@/components/ui/badge";
import type { ProjectFrontmatter } from "@/lib/content";

type HomeProjectFeatureProps = { project: ProjectFrontmatter };

export function HomeProjectFeature({ project }: HomeProjectFeatureProps) {
  return (
    <article data-scene={project.slug} className="home-feature-card overflow-hidden rounded-[2rem] border border-border bg-background shadow-[var(--surface-shadow)]">
      <div className="home-feature-media relative aspect-[4/3] overflow-hidden bg-muted">
        <ProjectCardImage project={project} />
      </div>
      <div className="home-feature-copy p-6 sm:p-8">
        <Badge>Engineering platform</Badge>
        <h3 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
          {project.title}
        </h3>
        <p className="mt-4 leading-7 text-muted-foreground">{project.summary}</p>
        <dl className="home-metrics mt-6 grid gap-3 sm:grid-cols-2">
          <div className="home-metric rounded-2xl border border-border bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Validation run</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">1,000 hours</dd>
          </div>
          <div className="home-metric rounded-2xl border border-border bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Test capacity</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">48 RF modules</dd>
          </div>
        </dl>
        <Link href={`/projects/${project.slug}`} transitionTypes={["nav-forward"]} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
          Explore the platform <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}