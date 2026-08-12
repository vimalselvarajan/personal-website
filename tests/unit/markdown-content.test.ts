import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MarkdownContent } from "@/components/markdown-content";

vi.mock("@/lib/site-routes", () => ({
  getSiteRoutes: () => ["/research/adaptive-cache-warming"],
}));

function renderMarkdown(source: string) {
  return renderToStaticMarkup(createElement(MarkdownContent, {
    source,
    route: "/research/adaptive-cache-warming",
  }));
}

describe("MarkdownContent", () => {
  it("renders a GFM table through the accessible table-scroll mapping", () => {
    const source = [
      "| Signal | Identifier |",
      "| --- | --- |",
      "| Feedback | buck_converter_feedback_signal |",
    ].join("\n");

    const html = renderMarkdown(source);

    expect(html).toContain(
      '<div class="table-scroll" role="group" aria-label="Scrollable table" tabindex="0"><table>',
    );
    expect(html).toContain("<thead><tr><th>Signal</th><th>Identifier</th></tr></thead>");
    expect(html).toContain("<tbody><tr><td>Feedback</td><td>buck_converter_feedback_signal</td></tr></tbody>");
  });

  it("omits raw script and JSX-like HTML while preserving safe Markdown", () => {
    const source = [
      "<script>globalThis.__markdownScriptExecuted = true;</script>",
      '<UnsafeWidget onClick="globalThis.__markdownWidgetExecuted = true">hidden widget content</UnsafeWidget>',
      "",
      "Visible Markdown.",
    ].join("\n");

    const html = renderMarkdown(source);

    expect(html).toContain("<p>Visible Markdown.</p>");
    expect(html).toContain("<p>hidden widget content</p>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("UnsafeWidget");
    expect(html).not.toContain("__markdownScriptExecuted");
    expect(html).not.toContain("__markdownWidgetExecuted");
  });

  it("renders known internal and HTTPS external links through their safe anchor branches", () => {
    const html = renderMarkdown([
      "[Research route](/research/adaptive-cache-warming)",
      "",
      "[External documentation](https://example.com/docs)",
    ].join("\n"));

    expect(html).toContain(
      '<a href="/research/adaptive-cache-warming">Research route</a>',
    );
    expect(html).toContain(
      '<a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">External documentation<span class="sr-only"> (opens in a new tab)</span></a>',
    );
  });

  it.each([
    ["JavaScript", "[Unsafe](javascript:alert(1))"],
    ["protocol-relative", "[Unsafe](//example.com/path)"],
  ])("rejects %s Markdown links in the renderer", (_label, source) => {
    expect(() => renderMarkdown(source)).toThrow(/Unsupported Markdown link destination/);
  });
});
