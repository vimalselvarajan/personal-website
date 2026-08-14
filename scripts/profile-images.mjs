import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(rootDirectory, "assets/profile/profile-photo.jpg");
const outputDirectory = path.join(rootDirectory, "public", "profile");
const widths = [384, 640, 768, 1024, 1280];
const maximumBytes = 120 * 1024;

const formats = [
  {
    extension: "avif",
    sharpFormat: "heif",
    encode: (image) =>
      image.avif({
        quality: 50,
        effort: 9,
        chromaSubsampling: "4:2:0",
      }),
  },
  {
    extension: "webp",
    sharpFormat: "webp",
    encode: (image) =>
      image.webp({
        quality: 74,
        effort: 6,
        smartSubsample: true,
      }),
  },
  {
    extension: "jpg",
    sharpFormat: "jpeg",
    encode: (image) =>
      image.jpeg({
        quality: 76,
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      }),
  },
];

const expectedAssets = widths.flatMap((width) =>
  formats.map((format) => ({
    ...format,
    width,
    height: (width * 3) / 4,
    filename: `profile-${width}.${format.extension}`,
  })),
);

sharp.cache(false);
sharp.concurrency(1);

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function validateAssetMetadata(asset, metadata, byteLength) {
  const failures = [];

  if (byteLength > maximumBytes) {
    failures.push(`${formatBytes(byteLength)} exceeds ${formatBytes(maximumBytes)}`);
  }
  if (metadata.width !== asset.width || metadata.height !== asset.height) {
    failures.push(
      `expected ${asset.width}x${asset.height}, received ${metadata.width ?? "?"}x${metadata.height ?? "?"}`,
    );
  }
  if (metadata.format !== asset.sharpFormat) {
    failures.push(`expected ${asset.sharpFormat}, received ${metadata.format ?? "unknown"}`);
  }
  if (metadata.hasAlpha) {
    failures.push("must not contain an alpha channel");
  }

  return failures;
}

async function validateSource() {
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read assets/profile/profile-photo.jpg dimensions.");
  }
  if (metadata.width * 3 !== metadata.height * 4) {
    throw new Error(
      `assets/profile/profile-photo.jpg must remain 4:3; received ${metadata.width}x${metadata.height}.`,
    );
  }
  if (metadata.width < widths.at(-1)) {
    throw new Error(`assets/profile/profile-photo.jpg is too small; expected at least ${widths.at(-1)}px wide.`);
  }
}

async function generateAssets() {
  await validateSource();
  const generatedAssets = [];

  for (const asset of expectedAssets) {
    const image = sharp(sourcePath)
      .rotate()
      .resize({ width: asset.width, height: asset.height, fit: "cover" });
    const buffer = await asset.encode(image).toBuffer();
    const metadata = await sharp(buffer).metadata();
    const failures = validateAssetMetadata(asset, metadata, buffer.byteLength);

    if (failures.length > 0) {
      throw new Error(`${asset.filename}: ${failures.join("; ")}`);
    }
    generatedAssets.push({ ...asset, buffer });
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  for (const asset of generatedAssets) {
    await fs.writeFile(path.join(outputDirectory, asset.filename), asset.buffer);
  }
}

async function checkAssets() {
  await validateSource();
  const failures = [];

  for (const asset of expectedAssets) {
    const outputPath = path.join(outputDirectory, asset.filename);
    try {
      const [metadata, stats] = await Promise.all([
        sharp(outputPath).metadata(),
        fs.stat(outputPath),
      ]);
      const assetFailures = validateAssetMetadata(asset, metadata, stats.size);
      if (assetFailures.length > 0) {
        failures.push(`${asset.filename}: ${assetFailures.join("; ")}`);
      } else {
        console.log(`PASS ${asset.filename} ${asset.width}x${asset.height} ${formatBytes(stats.size)}`);
      }
    } catch (error) {
      failures.push(`${asset.filename}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Profile image checks failed:\n- ${failures.join("\n- ")}`);
  }
}

const argumentsList = process.argv.slice(2);
if (argumentsList.some((argument) => argument !== "--check")) {
  throw new Error("Usage: node scripts/profile-images.mjs [--check]");
}

try {
  if (!argumentsList.includes("--check")) {
    await generateAssets();
  }
  await checkAssets();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
