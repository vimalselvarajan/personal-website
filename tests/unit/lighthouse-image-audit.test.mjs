import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { countResponsiveImageFindings } from "../../scripts/lighthouse-image-audit.mjs";

const fixture = JSON.parse(fs.readFileSync(
  new URL("../fixtures/lighthouse-image-delivery.json", import.meta.url),
  "utf8",
));

describe("Lighthouse image-delivery audit", () => {
  it("counts only responsive-size optimization findings", () => {
    expect(countResponsiveImageFindings(fixture)).toBe(1);
  });

  it("accepts a current audit with no optimization findings", () => {
    const report = structuredClone(fixture);
    report.audits["image-delivery-insight"].details.items = [];
    expect(countResponsiveImageFindings(report)).toBe(0);
  });

  it("fails closed when Lighthouse removes or reshapes the audit", () => {
    const missing = structuredClone(fixture);
    delete missing.audits["image-delivery-insight"];
    expect(() => countResponsiveImageFindings(missing)).toThrow(/audit image-delivery-insight is missing/);

    const reshaped = structuredClone(fixture);
    reshaped.audits["image-delivery-insight"].details.items[0].subItems = undefined;
    expect(() => countResponsiveImageFindings(reshaped)).toThrow(/has no optimization subitems/);
  });

  it("rejects missing audit containers, details, and malformed items", () => {
    expect(() => countResponsiveImageFindings(null)).toThrow(/report.audits is missing/);

    const missingDetails = structuredClone(fixture);
    delete missingDetails.audits["image-delivery-insight"].details;
    expect(() => countResponsiveImageFindings(missingDetails)).toThrow(/details must be a table/);

    const malformedItem = structuredClone(fixture);
    delete malformedItem.audits["image-delivery-insight"].details.items[0].url;
    expect(() => countResponsiveImageFindings(malformedItem)).toThrow(/item 0 is malformed/);
  });

  it("fails closed when an optimization reason changes", () => {
    const report = structuredClone(fixture);
    report.audits["image-delivery-insight"].details.items[0].subItems.items[0].reason = "Renamed responsive audit";
    expect(() => countResponsiveImageFindings(report)).toThrow(/unknown optimization reason/);
  });

  it("rejects malformed optimization values", () => {
    const report = structuredClone(fixture);
    report.audits["image-delivery-insight"].details.items[0].subItems.items[0].wastedBytes = 0;
    expect(() => countResponsiveImageFindings(report)).toThrow(/optimization 0 is malformed/);
  });
});
