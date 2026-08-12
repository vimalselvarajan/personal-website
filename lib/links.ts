const unicodeControlCharacter = /\p{Cc}/u;
const unicodeFormatCharacter = /\p{Cf}/u;
const permittedFormatCharacters = new Set(["\u200c", "\u200d"]);

function hasUnsafeUnicodeCharacters(value: string) {
  return [...value].some((character) => unicodeControlCharacter.test(character)
    || (unicodeFormatCharacter.test(character) && !permittedFormatCharacters.has(character)));
}

function hasUnsafeCharacters(href: string) {
  if (href !== href.trim()
    || hasUnsafeUnicodeCharacters(href)
    || href.includes("\\")) return true;

  try {
    return hasUnsafeUnicodeCharacters(decodeURI(href));
  } catch {
    return true;
  }
}

function canParseRelativeHref(href: string) {
  return URL.canParse(href, "https://portfolio.invalid/");
}

export function isInternalHref(href: string) {
  if (!href || hasUnsafeCharacters(href) || href.startsWith("//")) return false;
  if (!/^(?:\/(?!\/)|#|\?|\.\.?\/)/.test(href)) return false;
  return canParseRelativeHref(href);
}

export function isSafeExternalHref(href: string) {
  if (!href.startsWith("https://") || hasUnsafeCharacters(href)) return false;

  try {
    const url = new URL(href);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafeSameTabHref(href: string) {
  if (hasUnsafeCharacters(href)) return false;

  try {
    const url = new URL(href);
    if (url.protocol === "mailto:") {
      return /^[^?\s@]+@[^?\s@]+\.[^?\s@]+(?:\?.*)?$/.test(href.slice("mailto:".length));
    }
    if (url.protocol === "tel:") return /^\+?[0-9(). -]+$/.test(href.slice("tel:".length));
    return false;
  } catch {
    return false;
  }
}

type HrefKind = "internal" | "external" | "same-tab" | "unsafe";

export function classifyHref(href: string): HrefKind {
  if (isInternalHref(href)) return "internal";
  if (isSafeExternalHref(href)) return "external";
  if (isSafeSameTabHref(href)) return "same-tab";
  return "unsafe";
}

export function assertSafeExternalHref(href: string): asserts href is `https://${string}` {
  if (!isSafeExternalHref(href)) throw new Error(`Unsafe external link destination: ${href}`);
}
