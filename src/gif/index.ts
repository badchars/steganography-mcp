import { z } from "zod";
import type { ToolDef } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump } from "../utils/binary.js";
import { shannonEntropy, blockEntropy, chiSquareTest } from "../utils/stats.js";
import {
  parseGif,
  findGifAppendedData,
  analyzeColorTable,
  extractSubBlocks,
  type ColorEntry,
  type GifParseResult,
} from "../utils/gif-parser.js";

// ─── Helpers ───

/** Load and parse a GIF file, returning both the raw buffer and parse result */
async function loadGifFile(filePath: string): Promise<{ buf: Buffer; gif: GifParseResult }> {
  const buf = await readFileInput(filePath);
  const gif = parseGif(buf);
  return { buf, gif };
}

/** Format a color entry as a hex string */
function colorHex(c: ColorEntry): string {
  return `#${c.r.toString(16).padStart(2, "0")}${c.g.toString(16).padStart(2, "0")}${c.b.toString(16).padStart(2, "0")}`;
}

/** Disposal method name */
function disposalName(method: number): string {
  switch (method) {
    case 0: return "none";
    case 1: return "do_not_dispose";
    case 2: return "restore_to_background";
    case 3: return "restore_to_previous";
    default: return `unknown(${method})`;
  }
}

// ─── 1. gif_detect ───

const gifDetect: ToolDef = {
  name: "gif_detect",
  description:
    "Auto-detect steganography in a GIF file. Analyzes the global color table for LSB patterns, checks for appended data after the trailer, inspects comment extensions, and reports frame count and animation info.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, gif } = await loadGifFile(filePath);

      const findings: string[] = [];

      // Palette analysis
      let paletteInfo: Record<string, unknown> = { hasGlobalColorTable: false };
      if (gif.header.hasGlobalColorTable && gif.globalColorTable.length > 0) {
        const analysis = analyzeColorTable(gif.globalColorTable);
        paletteInfo = {
          hasGlobalColorTable: true,
          entries: gif.globalColorTable.length,
          uniqueColors: analysis.uniqueColors,
          duplicates: analysis.duplicates.length,
          isSorted: analysis.isSorted,
          unusedEntries: analysis.unusedEntries,
        };

        // Check LSB pattern randomness
        const allLsb = [
          ...analysis.lsbPattern.r,
          ...analysis.lsbPattern.g,
          ...analysis.lsbPattern.b,
        ];
        const lsbOnes = allLsb.filter((b) => b === 1).length;
        const lsbBalance = allLsb.length > 0 ? lsbOnes / allLsb.length : 0;
        const balanceDeviation = Math.abs(lsbBalance - 0.5);

        if (balanceDeviation < 0.02) {
          findings.push(`Palette LSB suspiciously balanced (${lsbBalance.toFixed(4)}) — possible palette LSB stego`);
        }

        if (analysis.duplicates.length > gif.globalColorTable.length * 0.1) {
          findings.push(`${analysis.duplicates.length} duplicate color entries — possible palette manipulation`);
        }
      }

      // Appended data check
      let appendedInfo: Record<string, unknown> = { found: false };
      if (gif.trailingData && gif.trailingData.length > 0) {
        appendedInfo = {
          found: true,
          size: gif.trailingData.length,
          entropy: parseFloat(shannonEntropy(gif.trailingData).toFixed(4)),
        };
        findings.push(`Appended data after GIF trailer: ${gif.trailingData.length} bytes`);
      }

      // Comment extensions
      if (gif.comments.length > 0) {
        const totalCommentSize = gif.comments.reduce((a, c) => a + c.length, 0);
        if (totalCommentSize > 256) {
          findings.push(`Large comment data: ${totalCommentSize} bytes in ${gif.comments.length} comment(s) — possible data hiding`);
        }
      }

      // Frame count anomaly (single-frame with animation extensions)
      const hasGraphicsControl = gif.extensions.some((e) => e.type === "graphics_control");
      if (gif.frameCount === 1 && hasGraphicsControl) {
        findings.push("Single-frame GIF with graphics control extension — unusual");
      }

      // Overall entropy
      const overallEntropy = shannonEntropy(buf);

      const overallVerdict =
        findings.length === 0
          ? "clean"
          : findings.length <= 2
            ? "suspicious"
            : "likely_stego";

      return json({
        file: filePath,
        format: `GIF${gif.header.version}`,
        fileSize: buf.length,
        dimensions: { width: gif.header.width, height: gif.header.height },
        isAnimated: gif.isAnimated,
        frameCount: gif.frameCount,
        overallEntropy: parseFloat(overallEntropy.toFixed(4)),
        palette: paletteInfo,
        appendedData: appendedInfo,
        comments: gif.comments.length > 0 ? gif.comments : [],
        appExtensions: gif.appExtensions.map((e) => ({
          identifier: e.appIdentifier,
          authCode: e.appAuthCode,
          dataSize: e.data.length,
        })),
        findings,
        overallVerdict,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 2. gif_palette ───

const gifPalette: ToolDef = {
  name: "gif_palette",
  description:
    "Analyze the GIF global color table for steganographic indicators. Reports sort order, duplicate entries, unused slots, color distribution, and luminance profile.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { gif } = await loadGifFile(filePath);

      if (!gif.header.hasGlobalColorTable || gif.globalColorTable.length === 0) {
        return json({
          file: filePath,
          hasGlobalColorTable: false,
          message: "No global color table present in this GIF.",
        });
      }

      const colors = gif.globalColorTable;
      const analysis = analyzeColorTable(colors);

      // Luminance distribution
      const luminances = colors.map((c) => c.r * 0.299 + c.g * 0.587 + c.b * 0.114);
      const lumEntropy = shannonEntropy(luminances.map((l) => Math.round(l)));

      // Check for adjacent colors differing only in LSB
      let lsbAdjacentPairs = 0;
      for (let i = 0; i < colors.length - 1; i++) {
        const a = colors[i];
        const b = colors[i + 1];
        const rDiff = Math.abs(a.r - b.r);
        const gDiff = Math.abs(a.g - b.g);
        const bDiff = Math.abs(a.b - b.b);
        if (rDiff <= 1 && gDiff <= 1 && bDiff <= 1 && (rDiff + gDiff + bDiff) > 0) {
          lsbAdjacentPairs++;
        }
      }

      // Color table hex dump (first 32 entries)
      const palettePreview = colors.slice(0, 32).map((c, i) => ({
        index: i,
        hex: colorHex(c),
        rgb: `(${c.r}, ${c.g}, ${c.b})`,
        lsb: `${c.r & 1}${c.g & 1}${c.b & 1}`,
      }));

      return json({
        file: filePath,
        totalEntries: colors.length,
        uniqueColors: analysis.uniqueColors,
        duplicates: analysis.duplicates.map((d) => ({
          indices: d.indices,
          color: colorHex(d.color),
        })),
        unusedEntries: analysis.unusedEntries,
        isSorted: analysis.isSorted,
        lsbAdjacentPairs,
        lsbAdjacentPairsNote:
          lsbAdjacentPairs > colors.length * 0.2
            ? "Many adjacent palette entries differ only in LSB — suspicious"
            : "Adjacent pair LSB pattern appears normal",
        luminanceEntropy: parseFloat(lumEntropy.toFixed(4)),
        palettePreview,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 3. gif_palette_lsb ───

const gifPaletteLsb: ToolDef = {
  name: "gif_palette_lsb",
  description:
    "Extract and analyze LSB patterns from GIF color table entries. Reports per-channel LSB bit strings, balance ratios, and chi-square test results for LSB uniformity.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { gif } = await loadGifFile(filePath);

      if (!gif.header.hasGlobalColorTable || gif.globalColorTable.length === 0) {
        return json({
          file: filePath,
          hasGlobalColorTable: false,
          message: "No global color table present in this GIF.",
        });
      }

      const colors = gif.globalColorTable;
      const analysis = analyzeColorTable(colors);

      const channelNames = ["Red", "Green", "Blue"] as const;
      const patterns = [analysis.lsbPattern.r, analysis.lsbPattern.g, analysis.lsbPattern.b];

      const channelResults: Record<string, unknown> = {};

      for (let ch = 0; ch < 3; ch++) {
        const bits = patterns[ch];
        const ones = bits.filter((b) => b === 1).length;
        const balance = bits.length > 0 ? ones / bits.length : 0;

        // Chi-square test: compare observed 0/1 distribution against expected uniform
        const observed = [bits.length - ones, ones]; // [zeros, ones]
        const expected = [bits.length / 2, bits.length / 2];
        const chi = chiSquareTest(observed, expected);

        // Extract as binary string
        const bitString = bits.join("");

        // Try to decode as ASCII (3 bits per color entry across palette)
        let decodedText: string | null = null;
        if (bits.length >= 8) {
          const byteCount = Math.floor(bits.length / 8);
          const bytes: number[] = [];
          for (let i = 0; i < byteCount; i++) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
              byte = (byte << 1) | (bits[i * 8 + b] ?? 0);
            }
            bytes.push(byte);
          }
          const decoded = Buffer.from(bytes).toString("utf-8");
          const printable = decoded.replace(/[^\x20-\x7E]/g, "");
          if (printable.length > bytes.length * 0.5) {
            decodedText = printable;
          }
        }

        channelResults[channelNames[ch]] = {
          bitString: bitString.length > 128 ? bitString.substring(0, 128) + "..." : bitString,
          totalBits: bits.length,
          ones,
          zeros: bits.length - ones,
          balance: parseFloat(balance.toFixed(4)),
          chiSquare: {
            statistic: parseFloat(chi.chiSquare.toFixed(4)),
            pValue: parseFloat(chi.pValue.toFixed(6)),
          },
          verdict:
            Math.abs(balance - 0.5) < 0.02
              ? "suspicious — near-perfect LSB balance"
              : "normal",
          decodedText,
        };
      }

      // Combined LSB: interleave R, G, B LSBs
      const combinedBits: number[] = [];
      for (let i = 0; i < colors.length; i++) {
        combinedBits.push(
          analysis.lsbPattern.r[i],
          analysis.lsbPattern.g[i],
          analysis.lsbPattern.b[i],
        );
      }
      const combinedOnes = combinedBits.filter((b) => b === 1).length;
      const combinedBalance = combinedBits.length > 0 ? combinedOnes / combinedBits.length : 0;

      // Decode combined LSB stream
      let combinedDecoded: string | null = null;
      if (combinedBits.length >= 8) {
        const byteCount = Math.floor(combinedBits.length / 8);
        const bytes: number[] = [];
        for (let i = 0; i < byteCount; i++) {
          let byte = 0;
          for (let b = 0; b < 8; b++) {
            byte = (byte << 1) | (combinedBits[i * 8 + b] ?? 0);
          }
          bytes.push(byte);
        }
        const decoded = Buffer.from(bytes).toString("utf-8");
        const printable = decoded.replace(/[^\x20-\x7E]/g, "");
        if (printable.length > bytes.length * 0.3) {
          combinedDecoded = printable.substring(0, 500);
        }
      }

      return json({
        file: filePath,
        paletteEntries: colors.length,
        perChannel: channelResults,
        combined: {
          totalBits: combinedBits.length,
          ones: combinedOnes,
          balance: parseFloat(combinedBalance.toFixed(4)),
          decodedText: combinedDecoded,
          verdict:
            Math.abs(combinedBalance - 0.5) < 0.015
              ? "suspicious — combined LSB stream is very balanced"
              : "normal",
        },
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 4. gif_frame_analysis ───

const gifFrameAnalysis: ToolDef = {
  name: "gif_frame_analysis",
  description:
    "Analyze multi-frame GIF animation properties. Reports per-frame size, delay times, disposal methods, local color tables, and anomalies in frame dimensions or compression.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { gif } = await loadGifFile(filePath);

      // Collect graphics control info per frame
      const graphicsControls = gif.extensions.filter((e) => e.type === "graphics_control");

      const frameDetails = gif.images.map((img, i) => {
        const gc = i < graphicsControls.length ? graphicsControls[i] : null;

        return {
          frame: i,
          position: { left: img.left, top: img.top },
          dimensions: { width: img.width, height: img.height },
          hasLocalColorTable: img.hasLocalColorTable,
          localColorTableSize: img.localColorTableSize,
          interlaced: img.interlaced,
          sorted: img.sorted,
          lzwMinCodeSize: img.lzwMinCodeSize,
          compressedDataSize: img.compressedData.length,
          subBlockCount: img.subBlockSizes.length,
          delayTime: gc?.delayTime ?? null,
          disposalMethod: gc?.disposalMethod !== undefined
            ? disposalName(gc.disposalMethod)
            : null,
          transparentFlag: gc?.transparentFlag ?? false,
          transparentColorIndex: gc?.transparentColorIndex ?? null,
        };
      });

      // Frame size statistics
      const frameSizes = gif.images.map((img) => img.compressedData.length);
      const meanSize = frameSizes.length > 0
        ? frameSizes.reduce((a, b) => a + b, 0) / frameSizes.length
        : 0;
      const sizeVariance = frameSizes.length > 0
        ? frameSizes.reduce((a, s) => a + Math.pow(s - meanSize, 2), 0) / frameSizes.length
        : 0;

      // Delay time statistics
      const delays = graphicsControls
        .map((gc) => gc.delayTime)
        .filter((d): d is number => d !== undefined);

      const findings: string[] = [];

      // Check for frames with very different sizes
      if (frameSizes.length > 1) {
        const stdDev = Math.sqrt(sizeVariance);
        for (let i = 0; i < frameSizes.length; i++) {
          if (stdDev > 0 && Math.abs(frameSizes[i] - meanSize) > 3 * stdDev) {
            findings.push(`Frame ${i} size (${frameSizes[i]}) is a statistical outlier`);
          }
        }
      }

      // Check for frames with local color tables (uncommon and suspicious)
      const framesWithLct = gif.images.filter((img) => img.hasLocalColorTable).length;
      if (framesWithLct > 0) {
        findings.push(`${framesWithLct} frame(s) have local color tables — potential data hiding channel`);
      }

      return json({
        file: filePath,
        isAnimated: gif.isAnimated,
        frameCount: gif.frameCount,
        canvasDimensions: { width: gif.header.width, height: gif.header.height },
        frames: frameDetails,
        frameSizeStats: {
          min: frameSizes.length > 0 ? Math.min(...frameSizes) : 0,
          max: frameSizes.length > 0 ? Math.max(...frameSizes) : 0,
          mean: parseFloat(meanSize.toFixed(2)),
          stdDev: parseFloat(Math.sqrt(sizeVariance).toFixed(2)),
        },
        delayTimes: delays,
        findings,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 5. gif_comment ───

const gifComment: ToolDef = {
  name: "gif_comment",
  description:
    "Extract and analyze GIF comment extensions. Comments can be used to hide data within a GIF file. Reports all comment text, sizes, and entropy.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, gif } = await loadGifFile(filePath);

      const commentExtensions = gif.extensions.filter((e) => e.type === "comment");

      if (commentExtensions.length === 0 && gif.comments.length === 0) {
        return json({
          file: filePath,
          commentCount: 0,
          message: "No comment extensions found in this GIF.",
        });
      }

      const commentDetails = gif.comments.map((comment, i) => {
        const commentBuf = Buffer.from(comment, "utf-8");
        const entropy = shannonEntropy(commentBuf);
        const printable = comment.replace(/[^\x20-\x7E\n\r\t]/g, "");
        const printableRatio = comment.length > 0 ? printable.length / comment.length : 0;

        return {
          index: i,
          text: comment.substring(0, 2000),
          length: comment.length,
          entropy: parseFloat(entropy.toFixed(4)),
          printableRatio: parseFloat(printableRatio.toFixed(4)),
          hexDump: comment.length > 0
            ? hexDump(commentBuf, 0, Math.min(128, commentBuf.length))
            : null,
          suspicious:
            entropy > 7.0
              ? "High entropy — possible encrypted/encoded data"
              : printableRatio < 0.5
                ? "Low printable ratio — possible binary data"
                : comment.length > 256
                  ? "Unusually large comment"
                  : null,
        };
      });

      const totalSize = gif.comments.reduce((a, c) => a + c.length, 0);

      return json({
        file: filePath,
        commentCount: gif.comments.length,
        totalCommentSize: totalSize,
        comments: commentDetails,
        verdict:
          totalSize > 1024
            ? "Large comment data — potential data hiding"
            : commentDetails.some((c) => c.suspicious !== null)
              ? "Suspicious comment content detected"
              : "Comments appear normal",
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 6. gif_appext ───

const gifAppext: ToolDef = {
  name: "gif_appext",
  description:
    "Analyze GIF application extensions. Inspects NETSCAPE and other application extension blocks for anomalies or hidden data payloads.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { gif } = await loadGifFile(filePath);

      const appExts = gif.appExtensions;

      if (appExts.length === 0) {
        return json({
          file: filePath,
          extensionCount: 0,
          message: "No application extensions found in this GIF.",
        });
      }

      const extDetails = appExts.map((ext, i) => {
        const entropy = shannonEntropy(ext.data);
        const isNetscape = ext.appIdentifier === "NETSCAPE" && ext.appAuthCode === "2.0";

        // For NETSCAPE extension, parse loop count
        let loopCount: number | null = null;
        if (isNetscape && ext.data.length >= 3) {
          loopCount = ext.data[1] | (ext.data[2] << 8);
        }

        // Check for suspicious data size
        const suspicious =
          !isNetscape && ext.data.length > 32
            ? "Non-standard extension with large data payload"
            : isNetscape && ext.data.length > 5
              ? "NETSCAPE extension with extra data beyond loop count"
              : null;

        return {
          index: i,
          identifier: ext.appIdentifier ?? "unknown",
          authCode: ext.appAuthCode ?? "unknown",
          isNetscape,
          loopCount,
          dataSize: ext.data.length,
          entropy: parseFloat(entropy.toFixed(4)),
          hexDump: hexDump(ext.data, 0, Math.min(128, ext.data.length)),
          suspicious,
        };
      });

      // Check for unknown/non-standard extensions
      const nonStandard = extDetails.filter(
        (e) => !e.isNetscape && e.identifier !== "XMP Data" && e.identifier !== "ICCRGBG1",
      );

      return json({
        file: filePath,
        extensionCount: appExts.length,
        extensions: extDetails,
        nonStandardExtensions: nonStandard.length,
        verdict:
          nonStandard.length > 0
            ? "Non-standard application extensions detected — inspect for hidden data"
            : "Application extensions appear normal",
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 7. gif_lzw_analysis ───

const gifLzwAnalysis: ToolDef = {
  name: "gif_lzw_analysis",
  description:
    "Analyze LZW compressed sub-block sizes and entropy in GIF image data. Checks individual sub-block sizes for anomalies and patterns that may indicate steganographic manipulation of the compressed stream.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { gif } = await loadGifFile(filePath);

      if (gif.images.length === 0) {
        return json({
          file: filePath,
          message: "No image frames found in this GIF.",
        });
      }

      const frameAnalysis = gif.images.map((img, i) => {
        const subSizes = img.subBlockSizes;
        const compressedData = img.compressedData;

        // Sub-block size statistics
        const meanBlockSize = subSizes.length > 0
          ? subSizes.reduce((a, b) => a + b, 0) / subSizes.length
          : 0;
        const sizeVariance = subSizes.length > 0
          ? subSizes.reduce((a, s) => a + Math.pow(s - meanBlockSize, 2), 0) / subSizes.length
          : 0;

        // Count how many blocks are full (255 bytes) vs partial
        const fullBlocks = subSizes.filter((s) => s === 255).length;
        const partialBlocks = subSizes.filter((s) => s > 0 && s < 255).length;

        // Entropy of the compressed data
        const dataEntropy = shannonEntropy(compressedData);

        // Block-level entropy (treat each sub-block as a sample)
        const subBlockEntropies: number[] = [];
        let offset = 0;
        for (const sz of subSizes) {
          if (offset + sz <= compressedData.length) {
            const block = compressedData.subarray(offset, offset + sz);
            subBlockEntropies.push(shannonEntropy(block));
          }
          offset += sz;
        }

        const meanBlockEntropy = subBlockEntropies.length > 0
          ? subBlockEntropies.reduce((a, b) => a + b, 0) / subBlockEntropies.length
          : 0;

        // Check for anomalous sub-block sizes (non-255 blocks in the middle)
        const anomalousBlocks: Array<{ index: number; size: number }> = [];
        for (let j = 0; j < subSizes.length - 1; j++) {
          // In normal GIF, all middle blocks should be 255; non-255 in middle is suspicious
          if (subSizes[j] < 255 && subSizes[j] > 0) {
            anomalousBlocks.push({ index: j, size: subSizes[j] });
          }
        }

        return {
          frame: i,
          lzwMinCodeSize: img.lzwMinCodeSize,
          compressedDataSize: compressedData.length,
          subBlockCount: subSizes.length,
          fullBlocks,
          partialBlocks,
          meanBlockSize: parseFloat(meanBlockSize.toFixed(2)),
          blockSizeStdDev: parseFloat(Math.sqrt(sizeVariance).toFixed(2)),
          dataEntropy: parseFloat(dataEntropy.toFixed(4)),
          meanBlockEntropy: parseFloat(meanBlockEntropy.toFixed(4)),
          anomalousMiddleBlocks: anomalousBlocks.length > 0
            ? anomalousBlocks.slice(0, 20)
            : [],
          subBlockSizePreview: subSizes.slice(0, 30),
        };
      });

      // Cross-frame consistency check
      const findings: string[] = [];
      if (frameAnalysis.length > 1) {
        const entropies = frameAnalysis.map((f) => f.dataEntropy);
        const meanEnt = entropies.reduce((a, b) => a + b, 0) / entropies.length;
        const entStdDev = Math.sqrt(
          entropies.reduce((a, e) => a + Math.pow(e - meanEnt, 2), 0) / entropies.length,
        );

        for (let i = 0; i < entropies.length; i++) {
          if (entStdDev > 0 && Math.abs(entropies[i] - meanEnt) > 2.5 * entStdDev) {
            findings.push(`Frame ${i} entropy (${entropies[i].toFixed(4)}) is an outlier`);
          }
        }
      }

      // Check for unusual LZW minimum code sizes
      for (const frame of frameAnalysis) {
        if (frame.lzwMinCodeSize < 2 || frame.lzwMinCodeSize > 12) {
          findings.push(`Frame ${frame.frame} has unusual LZW min code size: ${frame.lzwMinCodeSize}`);
        }
        if (frame.anomalousMiddleBlocks.length > 0) {
          findings.push(`Frame ${frame.frame} has ${frame.anomalousMiddleBlocks.length} non-full sub-blocks in middle of stream`);
        }
      }

      return json({
        file: filePath,
        frameCount: gif.frameCount,
        frames: frameAnalysis,
        findings,
        verdict:
          findings.length > 0
            ? "LZW stream anomalies detected — investigate further"
            : "LZW compression appears normal",
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 8. gif_structure ───

const gifStructure: ToolDef = {
  name: "gif_structure",
  description:
    "Visualize the GIF block structure. Shows all blocks (header, color tables, extensions, image descriptors, trailer) with offsets and sizes for forensic analysis.",
  schema: {
    file_path: z.string().describe("Path to GIF image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, gif } = await loadGifFile(filePath);

      // Reconstruct the block structure by walking the raw buffer
      const blocks: Array<{
        type: string;
        offset: string;
        size: number;
        details?: string;
      }> = [];

      // Header
      blocks.push({
        type: "Header",
        offset: "0x000000",
        size: 6,
        details: `GIF${gif.header.version}`,
      });

      // Logical Screen Descriptor
      blocks.push({
        type: "Logical Screen Descriptor",
        offset: "0x000006",
        size: 7,
        details: `${gif.header.width}x${gif.header.height}, color_res=${gif.header.colorResolution}`,
      });

      // Global Color Table
      if (gif.header.hasGlobalColorTable) {
        const gctSize = gif.header.globalColorTableSize * 3;
        blocks.push({
          type: "Global Color Table",
          offset: `0x${(13).toString(16).padStart(6, "0")}`,
          size: gctSize,
          details: `${gif.header.globalColorTableSize} entries, sorted=${gif.header.sorted}`,
        });
      }

      // Extensions
      for (const ext of gif.extensions) {
        const typeName =
          ext.type === "graphics_control"
            ? "Graphics Control Extension"
            : ext.type === "comment"
              ? "Comment Extension"
              : ext.type === "application"
                ? `Application Extension (${ext.appIdentifier ?? "unknown"})`
                : ext.type === "plain_text"
                  ? "Plain Text Extension"
                  : `Unknown Extension (0x${ext.label.toString(16)})`;

        let details: string | undefined;
        if (ext.type === "graphics_control") {
          details = `disposal=${ext.disposalMethod}, delay=${ext.delayTime}cs, transparent=${ext.transparentFlag}`;
        } else if (ext.type === "comment") {
          details = `${ext.data.length} bytes: "${ext.data.toString("utf-8").substring(0, 50)}"`;
        } else if (ext.type === "application") {
          details = `${ext.appIdentifier}/${ext.appAuthCode}, ${ext.data.length} bytes`;
        }

        blocks.push({
          type: typeName,
          offset: "—",
          size: ext.data.length,
          details,
        });
      }

      // Image Descriptors
      for (let i = 0; i < gif.images.length; i++) {
        const img = gif.images[i];
        let details = `${img.width}x${img.height} at (${img.left},${img.top}), lzw_min=${img.lzwMinCodeSize}`;
        if (img.hasLocalColorTable) {
          details += `, local_ct=${img.localColorTableSize}`;
        }
        if (img.interlaced) {
          details += ", interlaced";
        }

        blocks.push({
          type: `Image Descriptor #${i}`,
          offset: "—",
          size: 10 + (img.hasLocalColorTable ? img.localColorTableSize * 3 : 0) + 1 + img.compressedData.length,
          details,
        });
      }

      // Trailer
      blocks.push({
        type: "Trailer",
        offset: "—",
        size: 1,
        details: "0x3B",
      });

      // Trailing data
      if (gif.trailingData && gif.trailingData.length > 0) {
        blocks.push({
          type: "Trailing Data (after trailer)",
          offset: `0x${(buf.length - gif.trailingData.length).toString(16).padStart(6, "0")}`,
          size: gif.trailingData.length,
          details: "Data after GIF trailer — potential steganographic payload",
        });
      }

      // Build text tree view
      const treeLines = blocks.map((b) => {
        const sizeStr = b.size.toLocaleString();
        const base = `[${b.type}] offset=${b.offset} size=${sizeStr}`;
        return b.details ? `${base} — ${b.details}` : base;
      });

      return json({
        file: filePath,
        fileSize: buf.length,
        version: `GIF${gif.header.version}`,
        totalBlocks: blocks.length,
        blocks,
        structure: treeLines.join("\n"),
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── Export ───

export const gifTools: ToolDef[] = [
  gifDetect,
  gifPalette,
  gifPaletteLsb,
  gifFrameAnalysis,
  gifComment,
  gifAppext,
  gifLzwAnalysis,
  gifStructure,
];
