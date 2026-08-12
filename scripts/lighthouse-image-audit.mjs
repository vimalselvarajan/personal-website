const auditId = "image-delivery-insight";
const responsiveReason = /^This image file is larger than it needs to be \(\d+x\d+\) for its displayed dimensions \(\d+x\d+\)\. Use responsive images to reduce the image download size\.$/;
const knownReasons = new Set([
  "Increasing the image compression factor could improve this image's download size.",
  "Using a modern image format (WebP, AVIF) or increasing the image compression could improve this image's download size.",
  "Using video formats instead of GIFs can improve the download size of animated content.",
]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function schemaError(message) {
  return new Error(`Unsupported Lighthouse ${auditId} schema: ${message}`);
}

export function countResponsiveImageFindings(report) {
  if (!isRecord(report) || !isRecord(report.audits)) {
    throw schemaError("report.audits is missing");
  }
  const audit = report.audits[auditId];
  if (!isRecord(audit) || audit.id !== auditId) {
    throw schemaError(`audit ${auditId} is missing`);
  }
  if (!isRecord(audit.details) || audit.details.type !== "table" || !Array.isArray(audit.details.items)) {
    throw schemaError("details must be a table with an items array");
  }

  let findings = 0;
  for (const [itemIndex, item] of audit.details.items.entries()) {
    if (!isRecord(item) || typeof item.url !== "string" || !Number.isFinite(item.wastedBytes)) {
      throw schemaError(`item ${itemIndex} is malformed`);
    }
    if (!isRecord(item.subItems)
      || item.subItems.type !== "subitems"
      || !Array.isArray(item.subItems.items)
      || item.subItems.items.length === 0) {
      throw schemaError(`item ${itemIndex} has no optimization subitems`);
    }

    for (const [optimizationIndex, optimization] of item.subItems.items.entries()) {
      if (!isRecord(optimization)
        || typeof optimization.reason !== "string"
        || !Number.isFinite(optimization.wastedBytes)
        || optimization.wastedBytes <= 0) {
        throw schemaError(`item ${itemIndex} optimization ${optimizationIndex} is malformed`);
      }
      if (responsiveReason.test(optimization.reason)) findings += 1;
      else if (!knownReasons.has(optimization.reason)) {
        throw schemaError(`unknown optimization reason: ${optimization.reason}`);
      }
    }
  }
  return findings;
}
