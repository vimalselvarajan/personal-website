import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readImageDimensions } from "@/lib/image-dimensions";

describe("image dimensions", () => {
  it("reads PNG dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/projects/power_supply.png"));
    expect(readImageDimensions(buffer, "power_supply.png")).toEqual({ width: 1255, height: 848 });
  });

  it("reads JPEG dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/projects/hastest_project.jpg"));
    expect(readImageDimensions(buffer, "hastest_project.jpg")).toEqual({ width: 800, height: 571 });
  });

  it("reads WebP dimensions", () => {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/projects/combat_chess_card.webp"));
    expect(readImageDimensions(buffer, "combat_chess_card.webp")).toEqual({ width: 608, height: 456 });
  });

  it("rejects unsupported data", () => {
    expect(() => readImageDimensions(Buffer.from("not an image"), "bad.bin")).toThrow(/Unsupported/);
  });
});
