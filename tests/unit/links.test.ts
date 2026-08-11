import { describe, expect, it } from "vitest";
import { isInternalHref, isSafeSameTabHref, opensInNewTab } from "@/lib/links";

describe("link classification", () => {
  it.each(["/about", "#section", "?filter=all", "./relative", "../parent"])("classifies %s as internal", (href) => {
    expect(isInternalHref(href)).toBe(true);
  });

  it.each(["https://example.com", "http://localhost:3000"])("opens %s in a new tab", (href) => {
    expect(opensInNewTab(href)).toBe(true);
  });

  it.each(["mailto:hello@example.com", "tel:+15105550100", "javascript:alert(1)"])("does not open %s in a new tab", (href) => {
    expect(opensInNewTab(href)).toBe(false);
  });

  it.each(["mailto:hello@example.com", "tel:+15105550100"])("allows %s in the current tab", (href) => {
    expect(isSafeSameTabHref(href)).toBe(true);
  });

  it("rejects executable URL protocols", () => {
    expect(isSafeSameTabHref("javascript:alert(1)")).toBe(false);
  });
});
