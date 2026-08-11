type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{title}</h1>
        <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">{description}</p>
      </div>
    </section>
  );
}
