import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import sharp from "sharp";

import { researchFrontmatterSchema } from "../lib/content-schema.ts";
import {
  getResearchImageVariantPath,
  getResearchImageVariantWidths,
} from "../lib/research-image-variants.ts";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchContentDirectory = path.join(rootDirectory, "content", "research");
const publicDirectory = path.join(rootDirectory, "public");
const outputDirectory = path.join(publicDirectory, "research", "responsive");
const maximumDetailBytes = 200 * 1024;

sharp.cache(false);
sharp.concurrency(1);

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + " KiB";
}

async function loadImageDescriptor(research) {
  if (!research.image) return null;

  const sourcePath = path.join(publicDirectory, research.image.slice(1));
  const metadata = await sharp(sourcePath).metadata();
  if (metadata.width !== research.imageWidth || metadata.height !== research.imageHeight) {
    throw new Error(
      research.image + " is " + (metadata.width ?? "?") + "x" + (metadata.height ?? "?")
      + "; research front matter declares " + research.imageWidth + "x" + research.imageHeight,
    );
  }

  return {
    research,
    sourcePath,
    sourceWidth: research.imageWidth,
    sourceHeight: research.imageHeight,
    widths: getResearchImageVariantWidths(research.imageWidth),
  };
}

async function loadResearchImages() {
  const filenames = (await fs.readdir(researchContentDirectory))
    .filter((filename) => filename.endsWith(".md"))
    .sort();

  const descriptors = await Promise.all(filenames.map(async (filename) => {
    const contentPath = path.join(researchContentDirectory, filename);
    const parsed = matter(await fs.readFile(contentPath, "utf8"));
    return loadImageDescriptor(researchFrontmatterSchema.parse(parsed.data));
  }));

  return descriptors.filter(Boolean);
}

function expectedHeight(image, width) {
  return Math.round(width * (image.sourceHeight / image.sourceWidth));
}

function outputPathFor(image, width) {
  return path.join(
    publicDirectory,
    getResearchImageVariantPath(image.research.slug, width).slice(1),
  );
}

function validateMetadata(image, width, metadata, byteLength) {
  const failures = [];
  const height = expectedHeight(image, width);

  if (metadata.width !== width || metadata.height !== height) {
    failures.push(
      "expected " + width + "x" + height + ", received "
      + (metadata.width ?? "?") + "x" + (metadata.height ?? "?"),
    );
  }
  if (metadata.format !== "webp") {
    failures.push("expected webp, received " + (metadata.mediaType ?? metadata.format ?? "unknown"));
  }
  if (byteLength > maximumDetailBytes) {
    failures.push(formatBytes(byteLength) + " exceeds " + formatBytes(maximumDetailBytes));
  }

  return failures;
}

async function buildVariant(image, width) {
  const isIntrinsicWidth = width === image.sourceWidth;
  let buffer = await sharp(image.sourcePath)
    .resize({ width, withoutEnlargement: true })
    .webp(isIntrinsicWidth
      ? { lossless: true, effort: 6 }
      : { quality: 88, effort: 6, smartSubsample: false })
    .toBuffer();

  if (buffer.byteLength > maximumDetailBytes) {
    for (const quality of [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10]) {
      buffer = await sharp(image.sourcePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: false })
        .toBuffer();
      if (buffer.byteLength <= maximumDetailBytes) break;
    }
  }

  return buffer;
}

async function generateAssets(images) {
  const generated = [];

  for (const image of images) {
    for (const width of image.widths) {
      const buffer = await buildVariant(image, width);
      const metadata = await sharp(buffer).metadata();
      const failures = validateMetadata(image, width, metadata, buffer.byteLength);
      if (failures.length > 0) {
        throw new Error(image.research.slug + "-" + width + ".webp: " + failures.join("; "));
      }
      generated.push({ buffer, outputPath: outputPathFor(image, width) });
    }
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  for (const asset of generated) await fs.writeFile(asset.outputPath, asset.buffer);
}

async function checkAssets(images) {
  const expectedFilenames = new Set();
  const failures = [];

  for (const image of images) {
    for (const width of image.widths) {
      const outputPath = outputPathFor(image, width);
      expectedFilenames.add(path.basename(outputPath));
      try {
        const [metadata, stats] = await Promise.all([
          sharp(outputPath).metadata(),
          fs.stat(outputPath),
        ]);
        const assetFailures = validateMetadata(image, width, metadata, stats.size);
        if (assetFailures.length > 0) {
          failures.push(path.basename(outputPath) + ": " + assetFailures.join("; "));
        } else {
          console.log(
            "PASS " + path.basename(outputPath) + " " + metadata.width + "x"
            + metadata.height + " " + formatBytes(stats.size),
          );
        }
      } catch (error) {
        failures.push(
          path.basename(outputPath) + ": "
          + (error instanceof Error ? error.message : String(error)),
        );
      }
    }
  }

  try {
    const outputEntries = await fs.readdir(outputDirectory, { withFileTypes: true });
    for (const entry of outputEntries) {
      if (!entry.isFile() || !expectedFilenames.has(entry.name)) {
        failures.push("unexpected generated asset: " + entry.name);
      }
    }
  } catch (error) {
    failures.push(
      "unable to inspect " + outputDirectory + ": "
      + (error instanceof Error ? error.message : String(error)),
    );
  }

  if (failures.length > 0) {
    throw new Error("Research image checks failed:\n- " + failures.join("\n- "));
  }
}

const argumentsList = process.argv.slice(2);
if (argumentsList.some((argument) => argument !== "--check")) {
  throw new Error("Usage: node scripts/research-images.mjs [--check]");
}

try {
  const images = await loadResearchImages();
  if (!argumentsList.includes("--check")) await generateAssets(images);
  await checkAssets(images);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
