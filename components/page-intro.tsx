import { Container } from "@/components/container";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section aria-labelledby="page-title" className="archive-intro">
      <Container className="archive-intro-inner">
        <div className="archive-intro-index" aria-hidden="true"><span /> <span /> <span /></div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="page-title" className="archive-title">{title}</h1>
        <p className="archive-intro-copy">{description}</p>
      </Container>
    </section>
  );
}