import { describe, expect, it } from "vitest";
import {
  assertSafeExternalHref,
  classifyHref,
  isInternalHref,
  isSafeExternalHref,
  isSafeSameTabHref,
} from "@/lib/links";

describe("link classification", () => {
  it.each(["/about", "#section", "?filter=all", "./relative", "../parent"])("classifies %s as internal", (href) => {
    expect(isInternalHref(href)).toBe(true);
  });

  it("accepts only validated HTTPS destinations as external links", () => {
    expect(isSafeExternalHref("https://example.com/path")).toBe(true);
    expect(isSafeExternalHref("http://localhost:3000")).toBe(false);
  });

  it.each([
    "http://example.com",
    "//example.com",
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "https://user:password@example.com",
    "https://example.com/%0aunsafe",
    "https://example.com/%",
    "https://[",
    "https://example.com/\u0085unsafe",
    "https://example.com/%C2%85unsafe",
    "https://example.com/\u200bhidden",
    "https://example.com/%E2%80%8Bhidden",
    "https://example.com/\u202ereversed",
    "https://example.com/%E2%80%AEreversed",
  ])("rejects unsafe or malformed destination %s", (href) => {
    expect(classifyHref(href)).toBe("unsafe");
  });

  it.each(["mailto:hello@example.com", "tel:+15105550100"])("allows %s in the current tab", (href) => {
    expect(isSafeSameTabHref(href)).toBe(true);
  });

  it.each(["mailto:hello@example.com%0d%0abcc:attacker@example.com", "tel:123%0a456"])("rejects injected same-tab destination %s", (href) => {
    expect(isSafeSameTabHref(href)).toBe(false);
  });

  it("does not treat protocol-relative URLs as internal", () => {
    expect(isInternalHref("//example.com/path")).toBe(false);
  });

  it.each([
    "https://例え.テスト/mañana",
    "https://example.com/हिन्दी/👩‍💻",
    "https://example.com/می‌خواهم",
  ])("preserves valid Unicode destination %s", (href) => {
    expect(isSafeExternalHref(href)).toBe(true);
  });

  it("classifies valid safe destinations", () => {
    expect(classifyHref("/about")).toBe("internal");
    expect(classifyHref("https://example.com")).toBe("external");
    expect(classifyHref("mailto:hello@example.com")).toBe("same-tab");
  });

  it("throws when an unsafe destination reaches the external-link boundary", () => {
    expect(() => assertSafeExternalHref("http://example.com")).toThrow(
      /Unsafe external link destination/,
    );
  });
});
