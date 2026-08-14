import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readImageDimensions } from "@/lib/image-dimensions";

function createWebPHeader(format: "VP8X" | "VP8L") {
  const buffer = Buffer.alloc(30);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WEBP", 8, "ascii");
  buffer.write(format, 12, "ascii");
  return buffer;
}

describe("image dimensions", () => {
  it("reads PNG dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/projects/12v-to-3v3-buck-converter.png"));
    expect(readImageDimensions(buffer, "12v-to-3v3-buck-converter.png")).toEqual({ width: 1622, height: 1159 });
  });

  it("reads the committed social preview dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/social-preview.png"));
    expect(readImageDimensions(buffer, "social-preview.png")).toEqual({ width: 1200, height: 630 });
  });

  it("reads JPEG dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/projects/hastest_project.jpg"));
    expect(readImageDimensions(buffer, "hastest_project.jpg")).toEqual({ width: 800, height: 571 });
  });

  it("skips non-marker bytes while scanning for a JPEG start-of-frame segment", () => {
    const buffer = Buffer.from([
      0xff, 0xd8,
      0x00,
      0xff, 0xc0,
      0x00, 0x08,
      0x08,
      0x00, 0x2a,
      0x00, 0x63,
      0x00,
    ]);
    expect(readImageDimensions(buffer, "scanned.jpg")).toEqual({ width: 99, height: 42 });
  });

  it("skips standalone JPEG markers before a start-of-frame segment", () => {
    const buffer = Buffer.from([
      0xff, 0xd8,
      0xff, 0xd8,
      0xff, 0xc0,
      0x00, 0x08,
      0x08,
      0x00, 0x17,
      0x00, 0x2d,
      0x00,
    ]);
    expect(readImageDimensions(buffer, "markers.jpg")).toEqual({ width: 45, height: 23 });
  });

  it("reads extended VP8X WebP dimensions", () => {
    const buffer = createWebPHeader("VP8X");
    buffer.writeUInt32LE(10, 16);
    buffer.writeUIntLE(639, 24, 3);
    buffer.writeUIntLE(479, 27, 3);
    expect(readImageDimensions(buffer, "extended.webp")).toEqual({ width: 640, height: 480 });
  });

  it("reads lossless VP8L WebP dimensions", () => {
    const width = 321;
    const height = 257;
    const buffer = createWebPHeader("VP8L");
    buffer.writeUInt32LE(5, 16);
    buffer[20] = 0x2f;
    buffer.writeUInt32LE((((height - 1) << 14) | (width - 1)) >>> 0, 21);
    expect(readImageDimensions(buffer, "lossless.webp")).toEqual({ width, height });
  });

  it("rejects a VP8L header without the lossless signature", () => {
    const buffer = createWebPHeader("VP8L");
    buffer.writeUInt32LE(5, 16);
    buffer[20] = 0x00;
    expect(() => readImageDimensions(buffer, "invalid-lossless.webp")).toThrow(/Unsupported/);
  });

  it("rejects a truncated JPEG segment", () => {
    const buffer = Buffer.from([
      0xff, 0xd8,
      0xff, 0xc0,
      0x00, 0x10,
      0x08,
      0x00, 0x01,
      0x00, 0x01,
    ]);
    expect(() => readImageDimensions(buffer, "truncated.jpg")).toThrow(/Unsupported/);
  });

  it("rejects unsupported data", () => {
    expect(() => readImageDimensions(Buffer.from("not an image"), "bad.bin")).toThrow(/Unsupported/);
  });
});
