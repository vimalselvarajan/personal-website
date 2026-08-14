import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import sharp from "sharp";

import { projectFrontmatterSchema } from "../lib/content-schema.ts";
import {
  getProjectCardImageVariantPath,
  getProjectCardImageVariantWidths,
  getProjectImageVariantPath,
  getProjectGalleryImageVariantPath,
  getProjectImageVariantWidths,
} from "../lib/project-image-variants.ts";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectContentDirectory = path.join(rootDirectory, "content", "projects");
const publicDirectory = path.join(rootDirectory, "public");
const outputDirectory = path.join(publicDirectory, "projects", "responsive");
const maximumDetailBytes = 200 * 1024;
const maximumCardBytes = 120 * 1024;
const maximumResponsiveCardAvifBytes = 17 * 1024;
const responsiveCardAvifMaximumWidth = 672;
const cardFormats = ["avif", "webp"];

sharp.cache(false);
sharp.concurrency(1);

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function loadImageDescriptor(project, kind, asset, galleryIndex) {
  const sourcePath = path.join(publicDirectory, asset.src.slice(1));
  const metadata = await sharp(sourcePath).metadata();

  if (metadata.width !== asset.width || metadata.height !== asset.height) {
    throw new Error(
      `${asset.src} is ${metadata.width ?? "?"}x${metadata.height ?? "?"}; `
      + `${kind} front matter declares ${asset.width}x${asset.height}`,
    );
  }

  return {
    kind,
    sourcePath,
    sourceWidth: asset.width,
    sourceHeight: asset.height,
    widths: kind === "card"
      ? getProjectCardImageVariantWidths(asset.width)
      : getProjectImageVariantWidths(asset.width),
    formats: kind === "card" ? cardFormats : ["webp"],
    galleryIndex,
    project,
  };
}

async function loadProjects() {
  const filenames = (await fs.readdir(projectContentDirectory))
    .filter((filename) => filename.endsWith(".md"))
    .sort();

  return Promise.all(filenames.map(async (filename) => {
    const contentPath = path.join(projectContentDirectory, filename);
    const parsed = matter(await fs.readFile(contentPath, "utf8"));
    const project = projectFrontmatterSchema.parse(parsed.data);
    const detailAsset = {
      src: project.image,
      width: project.imageWidth,
      height: project.imageHeight,
    };
    const cardAsset = project.cardImage ?? detailAsset;

    const gallery = project.gallery ?? [];
    return {
      project,
      images: await Promise.all([
        loadImageDescriptor(project, "detail", detailAsset),
        loadImageDescriptor(project, "card", cardAsset),
        ...gallery.map((asset, index) => loadImageDescriptor(project, "gallery", asset, index)),
      ]),
    };
  }));
}

function expectedHeight(image, width) {
  return Math.round(width * (image.sourceHeight / image.sourceWidth));
}

function maximumBytesFor(image, width, format) {
  if (image.kind === "detail") return maximumDetailBytes;
  if (format === "avif" && width <= responsiveCardAvifMaximumWidth) {
    return maximumResponsiveCardAvifBytes;
  }
  return maximumCardBytes;
}

function outputPathFor(image, width, format) {
  const assetPath = image.kind === "card"
    ? getProjectCardImageVariantPath(image.project.slug, width, format)
    : image.kind === "gallery"
      ? getProjectGalleryImageVariantPath(image.project.slug, image.galleryIndex, width)
      : getProjectImageVariantPath(image.project.slug, width);
  return path.join(publicDirectory, assetPath.slice(1));
}

function validateMetadata(image, width, format, metadata, byteLength) {
  const failures = [];
  const height = expectedHeight(image, width);
  const maximumBytes = maximumBytesFor(image, width, format);

  if (metadata.width !== width || metadata.height !== height) {
    failures.push(`expected ${width}x${height}, received ${metadata.width ?? "?"}x${metadata.height ?? "?"}`);
  }
  const hasExpectedFormat = format === "avif"
    ? metadata.format === "heif"
      && metadata.mediaType === "image/avif"
      && metadata.compression === "av1"
    : metadata.format === format;
  if (!hasExpectedFormat) {
    failures.push(`expected ${format}, received ${metadata.mediaType ?? metadata.format ?? "unknown"}`);
  }
  if (byteLength > maximumBytes) {
    failures.push(`${formatBytes(byteLength)} exceeds ${formatBytes(maximumBytes)}`);
  }

  return failures;
}

async function generateAssets(projects) {
  const generated = [];

  for (const { images } of projects) {
    for (const image of images) {
      for (const width of image.widths) {
        for (const format of image.formats) {
          const pipeline = sharp(image.sourcePath).resize({ width, withoutEnlargement: true });
          const isIntrinsicDetail = image.kind === "detail" && width === image.sourceWidth;
          let buffer = format === "avif"
            ? await pipeline.avif({
              quality: 60,
              effort: 9,
              chromaSubsampling: "4:2:0",
              bitdepth: 8,
              tune: "ssim",
            }).toBuffer()
            : await pipeline.webp(isIntrinsicDetail
              ? { lossless: true, effort: 6 }
              : { quality: 88, effort: 6, smartSubsample: false }).toBuffer();
          if (isIntrinsicDetail && buffer.byteLength > maximumDetailBytes) {
            buffer = await sharp(image.sourcePath)
              .resize({ width, withoutEnlargement: true })
              .webp({ quality: 95, effort: 6, smartSubsample: false })
              .toBuffer();
          }
          if (image.kind === "card" && format === "avif" && buffer.byteLength > maximumBytesFor(image, width, format)) {
            for (const quality of [55, 50, 45, 40]) {
              buffer = await sharp(image.sourcePath)
                .resize({ width, withoutEnlargement: true })
                .avif({
                  quality,
                  effort: 9,
                  chromaSubsampling: "4:2:0",
                  bitdepth: 8,
                  tune: "ssim",
                })
                .toBuffer();
              if (buffer.byteLength <= maximumBytesFor(image, width, format)) break;
            }
          }
          if (image.kind === "card" && format === "webp" && buffer.byteLength > maximumCardBytes) {
            buffer = await sharp(image.sourcePath)
              .resize({ width, withoutEnlargement: true })
              .webp({ quality: 82, effort: 6, smartSubsample: false })
              .toBuffer();
          }
          const metadata = await sharp(buffer).metadata();
          const failures = validateMetadata(image, width, format, metadata, buffer.byteLength);
          if (failures.length > 0) {
            throw new Error(
              `${image.project.slug}-${image.kind}-${width}.${format}: ${failures.join("; ")}`,
            );
          }
          generated.push({ buffer, outputPath: outputPathFor(image, width, format) });
        }
      }
    }
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  for (const asset of generated) await fs.writeFile(asset.outputPath, asset.buffer);
}

async function checkAssets(projects) {
  const expectedFilenames = new Set();
  const failures = [];

  for (const { images } of projects) {
    for (const image of images) {
      for (const width of image.widths) {
        for (const format of image.formats) {
          const outputPath = outputPathFor(image, width, format);
          expectedFilenames.add(path.basename(outputPath));
          try {
            const [metadata, stats] = await Promise.all([
              sharp(outputPath).metadata(),
              fs.stat(outputPath),
            ]);
            const assetFailures = validateMetadata(image, width, format, metadata, stats.size);
            if (assetFailures.length > 0) {
              failures.push(`${path.basename(outputPath)}: ${assetFailures.join("; ")}`);
            } else {
              console.log(
                `PASS ${path.basename(outputPath)} ${metadata.width}x${metadata.height} ${formatBytes(stats.size)}`,
              );
            }
          } catch (error) {
            failures.push(`${path.basename(outputPath)}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }
  }

  try {
    const outputEntries = await fs.readdir(outputDirectory, { withFileTypes: true });
    for (const entry of outputEntries) {
      if (!entry.isFile() || !expectedFilenames.has(entry.name)) {
        failures.push(`unexpected generated asset: ${entry.name}`);
      }
    }
  } catch (error) {
    failures.push(`unable to inspect ${outputDirectory}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (failures.length > 0) {
    throw new Error(`Project image checks failed:\n- ${failures.join("\n- ")}`);
  }
}

const argumentsList = process.argv.slice(2);
if (argumentsList.some((argument) => argument !== "--check")) {
  throw new Error("Usage: node scripts/project-images.mjs [--check]");
}

try {
  const projects = await loadProjects();
  if (!argumentsList.includes("--check")) await generateAssets(projects);
  await checkAssets(projects);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
