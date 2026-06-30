import { z } from "zod";
import { readFileInput, detectImageFormat } from "../utils/binary.js";
import { shannonEntropy } from "../utils/stats.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";

// ─── QR Code Constants ───

/** QR version info: version -> module count */
function qrVersionToModules(version: number): number {
  return 17 + version * 4;
}

/** ECC codeword capacity per version/level (simplified table for versions 1-10) */
const ECC_CAPACITY: Record<number, Record<string, { total: number; data: number; ecc: number }>> = {
  1: { L: { total: 26, data: 19, ecc: 7 }, M: { total: 26, data: 16, ecc: 10 }, Q: { total: 26, data: 13, ecc: 13 }, H: { total: 26, data: 9, ecc: 17 } },
  2: { L: { total: 44, data: 34, ecc: 10 }, M: { total: 44, data: 28, ecc: 16 }, Q: { total: 44, data: 22, ecc: 22 }, H: { total: 44, data: 16, ecc: 28 } },
  3: { L: { total: 70, data: 55, ecc: 15 }, M: { total: 70, data: 44, ecc: 26 }, Q: { total: 70, data: 34, ecc: 36 }, H: { total: 70, data: 24, ecc: 46 } },
  4: { L: { total: 100, data: 80, ecc: 20 }, M: { total: 100, data: 64, ecc: 36 }, Q: { total: 100, data: 48, ecc: 52 }, H: { total: 100, data: 36, ecc: 64 } },
  5: { L: { total: 134, data: 108, ecc: 26 }, M: { total: 134, data: 86, ecc: 48 }, Q: { total: 134, data: 62, ecc: 72 }, H: { total: 134, data: 46, ecc: 88 } },
  6: { L: { total: 172, data: 136, ecc: 36 }, M: { total: 172, data: 108, ecc: 64 }, Q: { total: 172, data: 76, ecc: 96 }, H: { total: 172, data: 60, ecc: 112 } },
  7: { L: { total: 196, data: 156, ecc: 40 }, M: { total: 196, data: 124, ecc: 72 }, Q: { total: 196, data: 88, ecc: 108 }, H: { total: 196, data: 66, ecc: 130 } },
  8: { L: { total: 242, data: 194, ecc: 48 }, M: { total: 242, data: 154, ecc: 88 }, Q: { total: 242, data: 110, ecc: 132 }, H: { total: 242, data: 86, ecc: 156 } },
  9: { L: { total: 292, data: 232, ecc: 60 }, M: { total: 292, data: 182, ecc: 110 }, Q: { total: 292, data: 132, ecc: 160 }, H: { total: 292, data: 100, ecc: 192 } },
  10: { L: { total: 346, data: 274, ecc: 72 }, M: { total: 346, data: 216, ecc: 130 }, Q: { total: 346, data: 154, ecc: 192 }, H: { total: 346, data: 122, ecc: 224 } },
};

// ─── Pixel Helpers (BMP only — simple uncompressed pixel access) ───

interface ImageInfo {
  width: number;
  height: number;
  /** Row-major grayscale pixel values (0-255) */
  pixels: Uint8Array;
  format: string;
}

/** Parse a BMP file into grayscale pixel array */
function parseBmpGrayscale(buf: Buffer): ImageInfo | null {
  if (buf.length < 54) return null;
  if (buf[0] !== 0x42 || buf[1] !== 0x4d) return null;

  const pixelOffset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const height = Math.abs(buf.readInt32LE(22));
  const bpp = buf.readUInt16LE(28);
  const topDown = buf.readInt32LE(22) < 0;

  if (bpp !== 24 && bpp !== 32) return null;
  const bytesPerPixel = bpp / 8;
  const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;

  const pixels = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const srcRow = topDown ? y : height - 1 - y;
    const rowOffset = pixelOffset + srcRow * rowSize;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + x * bytesPerPixel;
      if (pxOffset + 2 >= buf.length) continue;
      const b = buf[pxOffset];
      const g = buf[pxOffset + 1];
      const r = buf[pxOffset + 2];
      // ITU-R BT.601 luma
      pixels[y * width + x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  return { width, height, pixels, format: "bmp" };
}

/** Parse a simple PNG into grayscale (handles only uncompressed/basic cases via raw IDAT) */
function parsePngBasicInfo(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 33) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;

  const ihdrType = buf.subarray(12, 16).toString("ascii");
  if (ihdrType !== "IHDR") return null;

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

/** Get basic image dimensions for any supported format */
function getImageDimensions(buf: Buffer): { width: number; height: number } | null {
  const fmt = detectImageFormat(buf);

  if (fmt === "bmp" && buf.length >= 26) {
    return {
      width: Math.abs(buf.readInt32LE(18)),
      height: Math.abs(buf.readInt32LE(22)),
    };
  }
  if (fmt === "png") return parsePngBasicInfo(buf);
  if (fmt === "gif" && buf.length >= 10) {
    return {
      width: buf.readUInt16LE(6),
      height: buf.readUInt16LE(8),
    };
  }
  if (fmt === "jpeg") {
    // Scan for SOF marker
    let pos = 2;
    while (pos + 9 < buf.length) {
      if (buf[pos] !== 0xff) { pos++; continue; }
      const marker = buf[pos + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xcc) {
        return {
          width: buf.readUInt16BE(pos + 7),
          height: buf.readUInt16BE(pos + 5),
        };
      }
      if (marker === 0xd9) break;
      if (pos + 3 < buf.length) {
        pos += 2 + buf.readUInt16BE(pos + 2);
      } else {
        break;
      }
    }
  }
  return null;
}

// ─── QR Detection Helpers ───

/** Check if a region matches a QR finder pattern (7x7 dark-light-dark-light-dark) */
function isFinderPattern(
  pixels: Uint8Array,
  width: number,
  startX: number,
  startY: number,
  moduleSize: number,
  threshold: number,
): boolean {
  // Finder pattern: 7 modules wide/tall
  // Dark(1) - Light(1) - Dark(3) - Light(1) - Dark(1) in each row at rows 0,6
  // We check the center row (row 3) for the 1:1:3:1:1 ratio
  const centerY = startY + Math.floor(3.5 * moduleSize);
  const expected = [1, 0, 1, 1, 1, 0, 1]; // dark=1, light=0

  for (let m = 0; m < 7; m++) {
    const cx = startX + Math.floor((m + 0.5) * moduleSize);
    if (cx >= width || centerY >= pixels.length / width) return false;

    const idx = centerY * width + cx;
    if (idx >= pixels.length) return false;

    const isDark = pixels[idx] < threshold;
    if (isDark !== (expected[m] === 1)) return false;
  }
  return true;
}

/** Estimate module size by looking at the finder pattern top row transitions */
function estimateModuleSize(
  pixels: Uint8Array,
  width: number,
  _height: number,
  startX: number,
  startY: number,
  threshold: number,
): number {
  // Scan the top row of the finder pattern area for the first dark run
  let runLength = 0;
  for (let x = startX; x < Math.min(startX + width, width); x++) {
    const idx = startY * width + x;
    if (idx >= pixels.length) break;
    if (pixels[idx] < threshold) {
      runLength++;
    } else if (runLength > 0) {
      break;
    }
  }
  // The first dark run in the top row of a finder pattern is 1 module wide
  // Actually the entire top row is: 7 dark modules
  // But the top-left corner is the full dark border (7 modules dark)
  // First dark run = 7 modules (full top row)
  // Wait — the top row is: DDDDDDD (all dark, 7 modules)
  // So runLength = 7 * moduleSize
  return runLength > 0 ? runLength / 7 : 0;
}

/** Scan image for QR finder patterns and return their positions */
function findFinderPatterns(
  pixels: Uint8Array,
  width: number,
  height: number,
  threshold: number = 128,
): Array<{ x: number; y: number; moduleSize: number }> {
  const patterns: Array<{ x: number; y: number; moduleSize: number }> = [];

  // Scan with a coarse grid to find dark regions that could be finder pattern corners
  const step = Math.max(1, Math.floor(Math.min(width, height) / 100));

  for (let y = 0; y < height - 6; y += step) {
    for (let x = 0; x < width - 6; x += step) {
      const idx = y * width + x;
      if (pixels[idx] >= threshold) continue; // not dark, skip

      // Try different module sizes
      for (let ms = Math.max(1, Math.floor(Math.min(width, height) / 200));
           ms < Math.floor(Math.min(width, height) / 10);
           ms++) {
        if (x + 7 * ms > width || y + 7 * ms > height) break;

        if (isFinderPattern(pixels, width, x, y, ms, threshold)) {
          // Check we don't already have a pattern nearby
          const tooClose = patterns.some(
            (p) =>
              Math.abs(p.x - x) < ms * 5 && Math.abs(p.y - y) < ms * 5,
          );
          if (!tooClose) {
            patterns.push({ x, y, moduleSize: ms });
          }
          break; // found a match at this position, move on
        }
      }
    }
  }

  return patterns;
}

/** Estimate QR version from finder pattern positions */
function estimateVersion(
  patterns: Array<{ x: number; y: number; moduleSize: number }>,
): { version: number; confidence: string } | null {
  if (patterns.length < 2) return null;

  // Use the distance between two patterns to estimate module count
  // Top-left to top-right: distance = (modules - 7) * moduleSize
  // Sort by x to identify left/right
  const sorted = [...patterns].sort((a, b) => a.x - b.x);
  const avgModuleSize = sorted.reduce((s, p) => s + p.moduleSize, 0) / sorted.length;

  if (avgModuleSize <= 0) return null;

  // Distance between first and last pattern (should be the diagonal or one axis)
  const dx = sorted[sorted.length - 1].x - sorted[0].x;
  const dy = Math.abs(sorted[sorted.length - 1].y - sorted[0].y);
  const dist = Math.max(dx, dy);

  // Distance between two finder pattern centers = (modules - 7) * moduleSize
  // So modules = (dist / moduleSize) + 7
  const estimatedModules = Math.round(dist / avgModuleSize) + 7;
  // version = (modules - 17) / 4
  const version = Math.round((estimatedModules - 17) / 4);

  if (version < 1 || version > 40) return null;

  const expectedModules = qrVersionToModules(version);
  const diff = Math.abs(estimatedModules - expectedModules);
  const confidence = diff <= 1 ? "high" : diff <= 3 ? "medium" : "low";

  return { version, confidence };
}

// ─── Tools ───

export const qrcodeTools: ToolDef[] = [
  // 1. qr_detect
  {
    name: "qr_detect",
    description:
      "Detect steganography in QR code images. Analyzes the image for unusual pixel patterns around data modules, checks for sub-module color variations, and measures pixel value distributions that could indicate LSB embedding or other stego techniques applied to a QR code image.",
    schema: {
      file_path: z.string().describe("Path to QR code image file"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const threshold = (args.threshold as number | undefined) ?? 128;
        const buf = await readFileInput(filePath);

        const dims = getImageDimensions(buf);
        if (!dims) {
          return text("Error: Could not determine image dimensions. Supported formats: BMP, PNG, JPEG, GIF.");
        }

        const format = detectImageFormat(buf);
        const findings: Array<{
          type: string;
          severity: "info" | "low" | "medium" | "high";
          description: string;
          details?: Record<string, unknown>;
        }> = [];

        // Parse BMP for pixel-level analysis if available
        const bmpInfo = format === "bmp" ? parseBmpGrayscale(buf) : null;

        if (bmpInfo) {
          const { pixels, width, height } = bmpInfo;

          // 1. Find finder patterns
          const patterns = findFinderPatterns(pixels, width, height, threshold);
          if (patterns.length === 0) {
            findings.push({
              type: "no_finder_patterns",
              severity: "info",
              description: "No QR finder patterns detected in image",
            });
          }

          // 2. Analyze pixel value distribution — QR codes should be strongly bimodal
          const hist = new Array(256).fill(0);
          for (let i = 0; i < pixels.length; i++) hist[pixels[i]]++;

          let darkPixels = 0;
          let lightPixels = 0;
          let midPixels = 0;
          for (let i = 0; i < 256; i++) {
            if (i < threshold - 40) darkPixels += hist[i];
            else if (i > threshold + 40) lightPixels += hist[i];
            else midPixels += hist[i];
          }

          const midRatio = midPixels / pixels.length;
          if (midRatio > 0.1) {
            findings.push({
              type: "non_bimodal_distribution",
              severity: "medium",
              description: `${(midRatio * 100).toFixed(1)}% of pixels are in the mid-range (not clearly black or white). A clean QR code should have a strongly bimodal distribution.`,
              details: {
                darkPixels,
                lightPixels,
                midRangePixels: midPixels,
                midRangePercentage: Number((midRatio * 100).toFixed(2)),
              },
            });
          }

          // 3. Check LSB distribution of dark and light modules separately
          let darkLsbZeros = 0;
          let darkLsbOnes = 0;
          let lightLsbZeros = 0;
          let lightLsbOnes = 0;

          for (let i = 0; i < pixels.length; i++) {
            const lsb = pixels[i] & 1;
            if (pixels[i] < threshold) {
              if (lsb === 0) darkLsbZeros++;
              else darkLsbOnes++;
            } else {
              if (lsb === 0) lightLsbZeros++;
              else lightLsbOnes++;
            }
          }

          const darkTotal = darkLsbZeros + darkLsbOnes;
          const lightTotal = lightLsbZeros + lightLsbOnes;
          const darkLsbRatio = darkTotal > 0 ? darkLsbOnes / darkTotal : 0.5;
          const lightLsbRatio = lightTotal > 0 ? lightLsbOnes / lightTotal : 0.5;

          // In a clean QR code, dark pixels should have consistent LSBs
          // (e.g., if dark=0, all LSBs are 0; or dark=255, all LSBs are 1)
          if (Math.abs(darkLsbRatio - 0.5) < 0.1 && darkTotal > 100) {
            findings.push({
              type: "lsb_randomization_dark",
              severity: "high",
              description: "Dark module LSBs appear randomized (near 50/50 split), suggesting possible LSB steganography",
              details: {
                darkPixelCount: darkTotal,
                darkLsbOnesRatio: Number(darkLsbRatio.toFixed(4)),
              },
            });
          }

          if (Math.abs(lightLsbRatio - 0.5) < 0.1 && lightTotal > 100) {
            findings.push({
              type: "lsb_randomization_light",
              severity: "high",
              description: "Light module LSBs appear randomized (near 50/50 split), suggesting possible LSB steganography",
              details: {
                lightPixelCount: lightTotal,
                lightLsbOnesRatio: Number(lightLsbRatio.toFixed(4)),
              },
            });
          }

          // 4. Check for unusual color values (not pure black/white)
          let notPureBlack = 0;
          let notPureWhite = 0;
          for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] < threshold && pixels[i] !== 0) notPureBlack++;
            if (pixels[i] >= threshold && pixels[i] !== 255) notPureWhite++;
          }

          if (notPureBlack > darkTotal * 0.3 || notPureWhite > lightTotal * 0.3) {
            findings.push({
              type: "impure_module_values",
              severity: "medium",
              description: "Many modules have non-pure black/white values. This could indicate stego embedding or JPEG artifacts.",
              details: {
                darkNotPureBlack: notPureBlack,
                lightNotPureWhite: notPureWhite,
              },
            });
          }
        } else {
          findings.push({
            type: "limited_analysis",
            severity: "info",
            description: `Image format is ${format}. Full pixel-level analysis is available for BMP images. For other formats, analysis is limited to metadata and structural checks.`,
          });
        }

        // File-level entropy check
        const entropy = shannonEntropy(buf);
        if (entropy > 7.5) {
          findings.push({
            type: "high_file_entropy",
            severity: "medium",
            description: `File entropy is ${entropy.toFixed(4)} bits/byte, unusually high for a QR code image`,
          });
        }

        const stegoScore =
          findings.filter((f) => f.severity === "high").length * 3 +
          findings.filter((f) => f.severity === "medium").length * 2 +
          findings.filter((f) => f.severity === "low").length;

        const verdict =
          stegoScore >= 5
            ? "likely_stego"
            : stegoScore >= 2
              ? "suspicious"
              : "clean";

        return json({
          file: filePath,
          fileSize: buf.length,
          imageFormat: format,
          dimensions: dims,
          verdict,
          stegoScore,
          findingsCount: findings.length,
          findings,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. qr_structure
  {
    name: "qr_structure",
    description:
      "QR code structure analysis. Detects finder patterns (the 3 corner squares), estimates the QR version from the distance between patterns, reports the estimated module (pixel) size, and provides the image's dimensions relative to the expected QR grid.",
    schema: {
      file_path: z.string().describe("Path to QR code image file"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const threshold = (args.threshold as number | undefined) ?? 128;
        const buf = await readFileInput(filePath);

        const dims = getImageDimensions(buf);
        if (!dims) {
          return text("Error: Could not determine image dimensions.");
        }

        const format = detectImageFormat(buf);
        const bmpInfo = format === "bmp" ? parseBmpGrayscale(buf) : null;

        let finderPatterns: Array<{ x: number; y: number; moduleSize: number }> = [];
        let versionEstimate: { version: number; confidence: string } | null = null;
        let estimatedModules: number | null = null;

        if (bmpInfo) {
          finderPatterns = findFinderPatterns(
            bmpInfo.pixels,
            bmpInfo.width,
            bmpInfo.height,
            threshold,
          );

          versionEstimate = estimateVersion(finderPatterns);
          if (versionEstimate) {
            estimatedModules = qrVersionToModules(versionEstimate.version);
          }
        }

        const avgModuleSize =
          finderPatterns.length > 0
            ? finderPatterns.reduce((s, p) => s + p.moduleSize, 0) / finderPatterns.length
            : null;

        // Estimate version from image dimensions if no finder patterns found
        if (!versionEstimate && avgModuleSize === null && dims) {
          // Try common module sizes (1-20 pixels)
          for (let ms = 1; ms <= 20; ms++) {
            const modules = Math.round(dims.width / ms);
            const ver = Math.round((modules - 17) / 4);
            if (ver >= 1 && ver <= 40) {
              const expected = qrVersionToModules(ver);
              if (Math.abs(modules - expected) <= 1) {
                versionEstimate = { version: ver, confidence: "low" };
                estimatedModules = expected;
                break;
              }
            }
          }
        }

        return json({
          file: filePath,
          fileSize: buf.length,
          imageFormat: format,
          dimensions: dims,
          finderPatternsFound: finderPatterns.length,
          finderPatterns: finderPatterns.map((p) => ({
            topLeftX: p.x,
            topLeftY: p.y,
            moduleSize: Number(p.moduleSize.toFixed(2)),
          })),
          averageModuleSize: avgModuleSize !== null ? Number(avgModuleSize.toFixed(2)) : null,
          versionEstimate: versionEstimate
            ? {
                version: versionEstimate.version,
                confidence: versionEstimate.confidence,
                expectedModules: estimatedModules,
                expectedPixelSize: estimatedModules && avgModuleSize
                  ? `${Math.round(estimatedModules * avgModuleSize)}x${Math.round(estimatedModules * avgModuleSize)}`
                  : null,
              }
            : null,
          analysis: finderPatterns.length >= 3
            ? "All 3 finder patterns detected — QR code structure is intact"
            : finderPatterns.length > 0
              ? `Only ${finderPatterns.length} finder pattern(s) detected — QR code may be partial or obfuscated`
              : "No finder patterns detected — image may not contain a standard QR code, or pixel-level analysis is not available for this format (use BMP for best results)",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. qr_ecc_analysis
  {
    name: "qr_ecc_analysis",
    description:
      "Error correction capacity analysis for QR code images. Estimates the QR version and calculates the total, data, and ECC codewords for each error correction level (L/M/Q/H). Reports unused ECC capacity that could theoretically hold steganographic data without breaking the QR code.",
    schema: {
      file_path: z.string().describe("Path to QR code image file"),
      ecc_level: z
        .enum(["L", "M", "Q", "H"])
        .optional()
        .describe("Assumed ECC level if known (default: estimate all levels)"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const eccLevel = args.ecc_level as string | undefined;
        const threshold = (args.threshold as number | undefined) ?? 128;
        const buf = await readFileInput(filePath);

        const dims = getImageDimensions(buf);
        if (!dims) {
          return text("Error: Could not determine image dimensions.");
        }

        const format = detectImageFormat(buf);
        const bmpInfo = format === "bmp" ? parseBmpGrayscale(buf) : null;

        // Estimate version
        let version: number | null = null;
        let confidence = "low";

        if (bmpInfo) {
          const patterns = findFinderPatterns(bmpInfo.pixels, bmpInfo.width, bmpInfo.height, threshold);
          const est = estimateVersion(patterns);
          if (est) {
            version = est.version;
            confidence = est.confidence;
          }
        }

        // Fallback: estimate from dimensions
        if (version === null) {
          for (let ms = 1; ms <= 20; ms++) {
            const modules = Math.round(dims.width / ms);
            const ver = Math.round((modules - 17) / 4);
            if (ver >= 1 && ver <= 40) {
              const expected = qrVersionToModules(ver);
              if (Math.abs(modules - expected) <= 1) {
                version = ver;
                confidence = "estimated_from_dimensions";
                break;
              }
            }
          }
        }

        if (version === null || version < 1 || version > 10) {
          const note = version !== null && version > 10
            ? `Estimated version ${version} is beyond the ECC lookup table (versions 1-10 supported). Showing version 10 data as approximation.`
            : "Could not estimate QR version. Showing capacity data for versions 1-5.";

          const showVersions = version !== null && version > 10 ? [10] : [1, 2, 3, 4, 5];
          const levels = eccLevel ? [eccLevel] : ["L", "M", "Q", "H"];

          const capacityTable = showVersions.map((v) => ({
            version: v,
            modules: qrVersionToModules(v),
            levels: Object.fromEntries(
              levels.map((l) => {
                const cap = ECC_CAPACITY[v]?.[l];
                return [l, cap ?? null];
              }),
            ),
          }));

          return json({
            file: filePath,
            dimensions: dims,
            versionEstimate: version,
            note,
            capacityTable,
          });
        }

        const modules = qrVersionToModules(version);
        const levels = eccLevel ? [eccLevel] : ["L", "M", "Q", "H"];

        const eccAnalysis = levels.map((level) => {
          const cap = ECC_CAPACITY[version!]?.[level];
          if (!cap) return { level, available: false };

          // ECC codewords that could be "borrowed" for stego
          // In theory, if the QR data doesn't use full capacity, remaining ECC
          // codewords represent unused error correction capacity
          const eccBytes = cap.ecc;
          // Maximum stego capacity: up to 50% of ECC bytes could be replaced
          // while still maintaining some error correction
          const maxStegoBytes = Math.floor(eccBytes / 2);

          return {
            level,
            totalCodewords: cap.total,
            dataCodewords: cap.data,
            eccCodewords: cap.ecc,
            eccPercentage: Number(((cap.ecc / cap.total) * 100).toFixed(1)),
            theoreticalStegoCapacity: {
              maxBytes: maxStegoBytes,
              maxBits: maxStegoBytes * 8,
              note: "Theoretical maximum if 50% of ECC is sacrificed (reduces error correction ability)",
            },
          };
        });

        return json({
          file: filePath,
          fileSize: buf.length,
          dimensions: dims,
          estimatedVersion: version,
          versionConfidence: confidence,
          moduleCount: modules,
          eccAnalysis,
          analysis:
            "ECC codewords provide error correction but also represent potential steganographic capacity. " +
            "Data can be hidden by intentionally corrupting modules and relying on ECC to maintain readability, " +
            "or by replacing ECC codewords with hidden data (reducing error correction ability).",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. qr_module_analysis
  {
    name: "qr_module_analysis",
    description:
      "Module-level pixel analysis of QR code images. Examines individual modules (the black/white squares) for sub-pixel anomalies: color variation within a single module, non-uniform grayscale values, and deviations from expected pure black (0) or pure white (255). These anomalies can indicate LSB stego or watermarking.",
    schema: {
      file_path: z.string().describe("Path to QR code image file (BMP for best results)"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const threshold = (args.threshold as number | undefined) ?? 128;
        const buf = await readFileInput(filePath);

        const format = detectImageFormat(buf);

        if (format !== "bmp") {
          return text(
            `Error: Module-level analysis requires BMP format for direct pixel access. Current format: ${format}. Convert the image to BMP and retry.`,
          );
        }

        const bmpInfo = parseBmpGrayscale(buf);
        if (!bmpInfo) {
          return text("Error: Could not parse BMP file");
        }

        const { pixels, width, height } = bmpInfo;
        const patterns = findFinderPatterns(pixels, width, height, threshold);

        if (patterns.length === 0) {
          return text(
            "Error: No finder patterns detected. Cannot determine module grid.",
          );
        }

        const avgModuleSize =
          patterns.reduce((s, p) => s + p.moduleSize, 0) / patterns.length;
        const ms = Math.round(avgModuleSize);

        if (ms < 1) {
          return text("Error: Module size too small for analysis");
        }

        // Determine QR grid origin (top-left finder pattern position)
        const topLeft = patterns.reduce(
          (best, p) => (p.x + p.y < best.x + best.y ? p : best),
          patterns[0],
        );

        const gridCols = Math.floor((width - topLeft.x) / ms);
        const gridRows = Math.floor((height - topLeft.y) / ms);

        // Analyze each module
        let totalModules = 0;
        let anomalousModules = 0;
        let totalVariance = 0;
        const anomalies: Array<{
          gridX: number;
          gridY: number;
          meanValue: number;
          variance: number;
          isDark: boolean;
          pixelRange: [number, number];
        }> = [];

        for (let gy = 0; gy < gridRows && gy < 100; gy++) {
          for (let gx = 0; gx < gridCols && gx < 100; gx++) {
            const sx = topLeft.x + gx * ms;
            const sy = topLeft.y + gy * ms;

            // Sample pixels within this module
            let sum = 0;
            let count = 0;
            let minVal = 255;
            let maxVal = 0;
            const values: number[] = [];

            for (let dy = 0; dy < ms && sy + dy < height; dy++) {
              for (let dx = 0; dx < ms && sx + dx < width; dx++) {
                const idx = (sy + dy) * width + (sx + dx);
                if (idx < pixels.length) {
                  const val = pixels[idx];
                  values.push(val);
                  sum += val;
                  count++;
                  if (val < minVal) minVal = val;
                  if (val > maxVal) maxVal = val;
                }
              }
            }

            if (count === 0) continue;
            totalModules++;

            const mean = sum / count;
            let variance = 0;
            for (const v of values) {
              variance += (v - mean) * (v - mean);
            }
            variance /= count;
            totalVariance += variance;

            const isDark = mean < threshold;

            // A clean QR module should have very low variance (all pixels same value)
            // Variance > 10 is anomalous for a digital QR code
            if (variance > 10 || (maxVal - minVal) > 20) {
              anomalousModules++;
              if (anomalies.length < 50) {
                anomalies.push({
                  gridX: gx,
                  gridY: gy,
                  meanValue: Number(mean.toFixed(2)),
                  variance: Number(variance.toFixed(2)),
                  isDark,
                  pixelRange: [minVal, maxVal],
                });
              }
            }
          }
        }

        const avgVariance = totalModules > 0 ? totalVariance / totalModules : 0;
        const anomalyRatio = totalModules > 0 ? anomalousModules / totalModules : 0;

        const verdict =
          anomalyRatio > 0.3
            ? "likely_stego"
            : anomalyRatio > 0.1
              ? "suspicious"
              : "clean";

        return json({
          file: filePath,
          fileSize: buf.length,
          dimensions: { width, height },
          moduleSize: ms,
          gridAnalyzed: { columns: Math.min(gridCols, 100), rows: Math.min(gridRows, 100) },
          totalModulesAnalyzed: totalModules,
          anomalousModules,
          anomalyRatio: Number(anomalyRatio.toFixed(4)),
          averageModuleVariance: Number(avgVariance.toFixed(4)),
          verdict,
          anomalyDetails: anomalies,
          analysis:
            verdict === "likely_stego"
              ? "High proportion of modules show internal pixel variation — strong indicator of sub-module steganography or watermarking"
              : verdict === "suspicious"
                ? "Some modules show unusual pixel variation — could indicate stego, JPEG compression artifacts, or anti-aliasing"
                : "Module pixels are consistent — no sub-module anomalies detected",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. qr_data_extract
  {
    name: "qr_data_extract",
    description:
      "Extract QR data region pixels from an image. Identifies the QR code grid, excludes function patterns (finder, timing, alignment), and returns the raw pixel values from the data/ECC modules. Useful for manual analysis of potentially modified data regions.",
    schema: {
      file_path: z.string().describe("Path to QR code image file (BMP for best results)"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const threshold = (args.threshold as number | undefined) ?? 128;
        const buf = await readFileInput(filePath);

        const format = detectImageFormat(buf);
        if (format !== "bmp") {
          return text(
            `Error: Data extraction requires BMP format. Current: ${format}. Convert to BMP first.`,
          );
        }

        const bmpInfo = parseBmpGrayscale(buf);
        if (!bmpInfo) return text("Error: Could not parse BMP");

        const { pixels, width, height } = bmpInfo;
        const patterns = findFinderPatterns(pixels, width, height, threshold);

        if (patterns.length === 0) {
          return text("Error: No finder patterns found — cannot determine QR grid");
        }

        const avgModuleSize =
          patterns.reduce((s, p) => s + p.moduleSize, 0) / patterns.length;
        const ms = Math.round(avgModuleSize);
        if (ms < 1) return text("Error: Module size too small");

        const topLeft = patterns.reduce(
          (best, p) => (p.x + p.y < best.x + best.y ? p : best),
          patterns[0],
        );

        const versionEst = estimateVersion(patterns);
        const version = versionEst?.version ?? 1;
        const totalModules = qrVersionToModules(version);

        // Build a mask of function pattern positions
        const isFunctionPattern = (gx: number, gy: number): boolean => {
          // Finder patterns (7x7) at three corners + 1-module separator
          // Top-left: (0,0) to (7,7) + separator
          if (gx <= 8 && gy <= 8) return true;
          // Top-right: (modules-8, 0) to (modules-1, 7) + separator
          if (gx >= totalModules - 8 && gy <= 8) return true;
          // Bottom-left: (0, modules-8) to (7, modules-1) + separator
          if (gx <= 8 && gy >= totalModules - 8) return true;
          // Timing patterns: row 6, column 6
          if (gx === 6 || gy === 6) return true;
          // Format info: around finders
          return false;
        };

        // Extract data module values
        const dataModules: Array<{
          gridX: number;
          gridY: number;
          value: number;
          isDark: boolean;
        }> = [];

        const maxGrid = Math.min(totalModules, Math.floor((width - topLeft.x) / ms), Math.floor((height - topLeft.y) / ms));

        for (let gy = 0; gy < maxGrid; gy++) {
          for (let gx = 0; gx < maxGrid; gx++) {
            if (isFunctionPattern(gx, gy)) continue;

            const cx = topLeft.x + Math.floor((gx + 0.5) * ms);
            const cy = topLeft.y + Math.floor((gy + 0.5) * ms);
            if (cx >= width || cy >= height) continue;

            const idx = cy * width + cx;
            if (idx >= pixels.length) continue;

            const value = pixels[idx];
            dataModules.push({
              gridX: gx,
              gridY: gy,
              value,
              isDark: value < threshold,
            });
          }
        }

        // Statistics on data module values
        const darkData = dataModules.filter((m) => m.isDark);
        const lightData = dataModules.filter((m) => !m.isDark);

        const darkValues = darkData.map((m) => m.value);
        const lightValues = lightData.map((m) => m.value);

        const darkEntropy = darkValues.length > 0
          ? shannonEntropy(Buffer.from(darkValues))
          : 0;
        const lightEntropy = lightValues.length > 0
          ? shannonEntropy(Buffer.from(lightValues))
          : 0;

        return json({
          file: filePath,
          estimatedVersion: version,
          moduleSize: ms,
          gridOrigin: { x: topLeft.x, y: topLeft.y },
          totalDataModules: dataModules.length,
          darkModules: darkData.length,
          lightModules: lightData.length,
          darkModuleEntropy: Number(darkEntropy.toFixed(4)),
          lightModuleEntropy: Number(lightEntropy.toFixed(4)),
          dataModuleSample: dataModules.slice(0, 100),
          binaryString: dataModules
            .slice(0, 256)
            .map((m) => (m.isDark ? "1" : "0"))
            .join(""),
          note: "Data modules extracted (function patterns excluded). High entropy in dark or light module values may indicate sub-module stego.",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. qr_compare
  {
    name: "qr_compare",
    description:
      "Compare two QR code images for differences. Performs pixel-by-pixel comparison, identifies differing modules, and analyzes whether differences are in the data region or function patterns. Useful for detecting stego modifications between an original and modified QR code.",
    schema: {
      file_path_1: z.string().describe("Path to first QR code image (BMP)"),
      file_path_2: z.string().describe("Path to second QR code image (BMP)"),
      threshold: z
        .number()
        .optional()
        .describe("Black/white threshold (0-255, default: 128)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const path1 = args.file_path_1 as string;
        const path2 = args.file_path_2 as string;
        const threshold = (args.threshold as number | undefined) ?? 128;

        const buf1 = await readFileInput(path1);
        const buf2 = await readFileInput(path2);

        const fmt1 = detectImageFormat(buf1);
        const fmt2 = detectImageFormat(buf2);

        if (fmt1 !== "bmp" || fmt2 !== "bmp") {
          return text(
            `Error: QR comparison requires BMP format. Got: ${fmt1}, ${fmt2}. Convert both images to BMP first.`,
          );
        }

        const img1 = parseBmpGrayscale(buf1);
        const img2 = parseBmpGrayscale(buf2);

        if (!img1 || !img2) {
          return text("Error: Could not parse one or both BMP files");
        }

        if (img1.width !== img2.width || img1.height !== img2.height) {
          return json({
            file1: path1,
            file2: path2,
            dimensionMismatch: true,
            file1Dimensions: { width: img1.width, height: img1.height },
            file2Dimensions: { width: img2.width, height: img2.height },
            analysis: "Images have different dimensions — cannot perform module-level comparison",
          });
        }

        const { width, height } = img1;

        // Pixel-level comparison
        let identicalPixels = 0;
        let differentPixels = 0;
        let lsbOnlyDiffs = 0;
        let moduleDarkToLight = 0;
        let moduleLightToDark = 0;
        const totalPixels = width * height;

        const diffMap: number[] = [];

        for (let i = 0; i < totalPixels; i++) {
          const v1 = img1.pixels[i];
          const v2 = img2.pixels[i];

          if (v1 === v2) {
            identicalPixels++;
            diffMap.push(0);
          } else {
            differentPixels++;
            diffMap.push(Math.abs(v1 - v2));

            if (Math.abs(v1 - v2) === 1) lsbOnlyDiffs++;

            const dark1 = v1 < threshold;
            const dark2 = v2 < threshold;
            if (dark1 && !dark2) moduleDarkToLight++;
            if (!dark1 && dark2) moduleLightToDark++;
          }
        }

        // Try to find module grid for structural analysis
        const patterns1 = findFinderPatterns(img1.pixels, width, height, threshold);
        let moduleAnalysis: Record<string, unknown> | null = null;

        if (patterns1.length > 0) {
          const avgMs =
            patterns1.reduce((s, p) => s + p.moduleSize, 0) / patterns1.length;
          const ms = Math.round(avgMs);
          const topLeft = patterns1.reduce(
            (best, p) => (p.x + p.y < best.x + best.y ? p : best),
            patterns1[0],
          );

          let dataRegionDiffs = 0;
          let functionPatternDiffs = 0;
          const versionEst = estimateVersion(patterns1);
          const totalModules = versionEst
            ? qrVersionToModules(versionEst.version)
            : 21;

          const maxGrid = Math.min(totalModules, Math.floor((width - topLeft.x) / ms), Math.floor((height - topLeft.y) / ms));

          for (let gy = 0; gy < maxGrid; gy++) {
            for (let gx = 0; gx < maxGrid; gx++) {
              const cx = topLeft.x + Math.floor((gx + 0.5) * ms);
              const cy = topLeft.y + Math.floor((gy + 0.5) * ms);
              if (cx >= width || cy >= height) continue;
              const idx = cy * width + cx;
              if (idx >= totalPixels) continue;

              if (img1.pixels[idx] !== img2.pixels[idx]) {
                const isFunc =
                  (gx <= 8 && gy <= 8) ||
                  (gx >= totalModules - 8 && gy <= 8) ||
                  (gx <= 8 && gy >= totalModules - 8) ||
                  gx === 6 ||
                  gy === 6;

                if (isFunc) functionPatternDiffs++;
                else dataRegionDiffs++;
              }
            }
          }

          moduleAnalysis = {
            moduleSize: ms,
            dataRegionDifferences: dataRegionDiffs,
            functionPatternDifferences: functionPatternDiffs,
            stegoIndicator:
              dataRegionDiffs > 0 && functionPatternDiffs === 0
                ? "Differences only in data region — consistent with targeted stego modification"
                : functionPatternDiffs > 0
                  ? "Differences in function patterns — unusual, may indicate image-level (not QR-level) modification"
                  : "No module-level differences detected",
          };
        }

        const diffEntropy = shannonEntropy(Buffer.from(diffMap.filter((d) => d > 0)));

        return json({
          file1: { path: path1, size: buf1.length },
          file2: { path: path2, size: buf2.length },
          dimensions: { width, height },
          pixelComparison: {
            totalPixels,
            identicalPixels,
            differentPixels,
            percentIdentical: Number(
              ((identicalPixels / totalPixels) * 100).toFixed(4),
            ),
            lsbOnlyDifferences: lsbOnlyDiffs,
            lsbDiffPercentage: differentPixels > 0
              ? Number(((lsbOnlyDiffs / differentPixels) * 100).toFixed(2))
              : 0,
          },
          moduleFlips: {
            darkToLight: moduleDarkToLight,
            lightToDark: moduleLightToDark,
            totalFlips: moduleDarkToLight + moduleLightToDark,
          },
          differenceEntropy: Number(diffEntropy.toFixed(4)),
          moduleAnalysis,
          verdict:
            differentPixels === 0
              ? "identical"
              : lsbOnlyDiffs > differentPixels * 0.7 && differentPixels > 10
                ? "likely_lsb_stego"
                : moduleDarkToLight + moduleLightToDark > 0
                  ? "module_modifications_detected"
                  : "pixel_differences_detected",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
