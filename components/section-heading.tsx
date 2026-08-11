import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{description}</p> : null}
    </div>
  );
}
