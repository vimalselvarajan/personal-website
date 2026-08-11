export function isInternalHref(href: string) {
  return /^(?:\/|#|\?|\.\.?\/)/.test(href);
}

export function opensInNewTab(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeSameTabHref(href: string) {
  return /^(?:mailto:|tel:)/.test(href);
}
