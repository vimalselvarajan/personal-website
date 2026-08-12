import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalAnchor } from "@/components/external-link";
import { classifyHref } from "@/lib/links";
import { assertKnownInternalHref, type PortfolioRoute } from "@/lib/routes";
import { getSiteRoutes } from "@/lib/site-routes";

type MarkdownContentProps = {
  source: string;
  route: PortfolioRoute;
};

export function MarkdownContent({ source, route }: MarkdownContentProps) {
  const knownRoutes = new Set<string>(getSiteRoutes());

  const components: Components = {
    a({ children, href = "", node, ...props }) {
      void node;
      const kind = classifyHref(href);
      if (kind === "internal") {
        const destination = assertKnownInternalHref(href, route, knownRoutes);
        const linkProps = {
          ...(props.className !== undefined ? { className: props.className } : {}),
          ...(props.title !== undefined ? { title: props.title } : {}),
        };
        return (
          <Link {...linkProps} href={destination}>
            {children}
          </Link>
        );
      }
      if (kind === "external") {
        return <ExternalAnchor {...props} href={href}>{children}</ExternalAnchor>;
      }
      if (kind === "same-tab") return <a {...props} href={href}>{children}</a>;
      throw new Error(`Unsupported Markdown link destination: ${href}`);
    },
    table({ children, node, ...props }) {
      void node;
      return (
        <div
          className="table-scroll"
          role="group"
          aria-label="Scrollable table"
          tabIndex={0}
        >
          <table {...props}>{children}</table>
        </div>
      );
    },
  };

  return (
    <div className="prose-portfolio">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        skipHtml
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
