import { z } from "zod";
import { PNG } from "pngjs";
import { writeFile } from "node:fs/promises";
import type { ToolDef, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import {
  readFileInput,
  detectImageFormat,
  extractLsbValues,
  getBitPlane,
  bitsToBytes,
  bitsToString,
  stringToBits,
  setLsb,
  hexDump,
} from "../utils/binary.js";
import {
  shannonEntropy,
  histogram,
  chiSquareLsbTest,
  rsAnalysis,
  samplePairAnalysis,
  blockEntropy,
} from "../utils/stats.js";
import {
  parsePngChunks,
  getPngPixels,
  extractTextChunks,
  findPngAppendedData,
} from "../utils/png-parser.js";
import {
  parseJpegMarkers,
  getJpegPixels,
  extractQuantizationTables,
  parseExifData,
  extractComments,
  findJpegAppendedData,
} from "../utils/jpeg-parser.js";
import {
  parseBmp,
  findBmpAppendedData,
} from "../utils/bmp-parser.js";
import { STEGO_SIGNATURES } from "../data/stego-signatures.js";

// ─── Helpers ───

/** Extract pixel values for a single channel (0=R, 1=G, 2=B, 3=A) from RGBA buffer */
function channelValues(pixels: Buffer, channel: number, totalPixels: number): number[] {
  const vals: number[] = [];
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4 + channel;
    if (idx < pixels.length) vals.push(pixels[idx]);
  }
  return vals;
}

/** Parse a channels string like "r,g,b" into channel indices */
function parseChannels(channels?: string): number[] {
  if (!channels) return [0, 1, 2];
  const map: Record<string, number> = { r: 0, g: 1, b: 2, a: 3 };
  return channels
    .toLowerCase()
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c in map)
    .map((c) => map[c]);
}

/** Load pixels for any supported format, returns { width, height, data, format, rawBuffer } */
async function loadPixels(filePath: string): Promise<{
  width: number;
  height: number;
  data: Buffer;
  format: string;
  rawBuffer: Buffer;
}> {
  const raw = await readFileInput(filePath);
  const format = detectImageFormat(raw);

  if (format === "png") {
    const p = await getPngPixels(filePath);
    return { width: p.width, height: p.height, data: p.data, format, rawBuffer: p.rawBuffer };
  }
  if (format === "jpeg") {
    const j = await getJpegPixels(filePath);
    return { width: j.width, height: j.height, data: j.data, format, rawBuffer: j.rawBuffer };
  }
  if (format === "bmp") {
    const b = await parseBmp(filePath);
    return { width: b.width, height: b.height, data: b.data, format, rawBuffer: b.rawBuffer };
  }

  throw new Error(`Unsupported image format: ${format}`);
}

const CHANNEL_NAMES = ["Red", "Green", "Blue", "Alpha"] as const;

// ─── 1. img_detect ───

const imgDetect: ToolDef = {
  name: "img_detect",
  description:
    "Auto-detect steganography in an image. Runs chi-square, RS analysis, entropy, metadata, appended data, and tool signature checks. Returns a comprehensive JSON report.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { width, height, data: pixels, format, rawBuffer } = await loadPixels(filePath);
      const totalPixels = width * height;

      // Chi-square LSB test on R, G, B
      const chiResults: Record<string, unknown> = {};
      for (const ch of [0, 1, 2]) {
        const vals = channelValues(pixels, ch, totalPixels);
        chiResults[CHANNEL_NAMES[ch]] = chiSquareLsbTest(vals);
      }

      // RS analysis on R channel
      const rs = rsAnalysis(pixels, width, height, 0);

      // Overall entropy
      const overallEntropy = shannonEntropy(rawBuffer);

      // Appended data check
      let appendedData: { found: boolean; size?: number } = { found: false };
      if (format === "png") {
        const appended = findPngAppendedData(rawBuffer);
        if (appended) appendedData = { found: true, size: appended.length };
      } else if (format === "jpeg") {
        const appended = findJpegAppendedData(rawBuffer);
        if (appended) appendedData = { found: true, size: appended.length };
      } else if (format === "bmp") {
        const appended = findBmpAppendedData(rawBuffer);
        if (appended) appendedData = { found: true, size: appended.length };
      }

      // Metadata summary
      let metadataSummary: Record<string, unknown> = {};
      if (format === "png") {
        const chunks = parsePngChunks(rawBuffer);
        const textChunks = extractTextChunks(chunks);
        metadataSummary = {
          chunkTypes: chunks.map((c) => c.type),
          textEntries: textChunks.length,
          textChunks,
        };
      } else if (format === "jpeg") {
        const markers = parseJpegMarkers(rawBuffer);
        const app1 = markers.find((m) => m.marker === 0xffe1);
        const exif = app1 ? parseExifData(app1.data) : null;
        const comments = extractComments(markers);
        metadataSummary = {
          markerTypes: markers.map((m) => m.name),
          exif,
          comments,
        };
      }

      // Tool signature scan
      const matchedTools: string[] = [];
      for (const sig of STEGO_SIGNATURES) {
        if (!sig.fileTypes.includes(format === "jpeg" ? "jpg" : format)) continue;
        for (const pattern of sig.headerPatterns) {
          if (pattern.text) {
            if (rawBuffer.includes(Buffer.from(pattern.text, "utf-8"))) {
              matchedTools.push(`${sig.tool}: ${pattern.description}`);
            }
          }
          if (pattern.bytes && pattern.bytes.length > 0) {
            const needle = Buffer.from(pattern.bytes);
            if (rawBuffer.includes(needle)) {
              matchedTools.push(`${sig.tool}: ${pattern.description}`);
            }
          }
        }
      }

      // Aggregate verdict
      const verdicts: string[] = [];
      for (const [ch, result] of Object.entries(chiResults)) {
        const r = result as { verdict: string; embeddingProbability: number };
        if (r.verdict !== "clean") verdicts.push(`Chi-square ${ch}: ${r.verdict} (p=${r.embeddingProbability.toFixed(4)})`);
      }
      if (rs.verdict !== "clean") verdicts.push(`RS analysis: ${rs.verdict} (rate=${rs.estimatedEmbeddingRate.toFixed(4)})`);
      if (appendedData.found) verdicts.push(`Appended data found: ${appendedData.size} bytes`);
      if (matchedTools.length > 0) verdicts.push(`Tool signatures: ${matchedTools.join(", ")}`);

      const report = {
        file: filePath,
        format,
        dimensions: { width, height },
        fileSize: rawBuffer.length,
        overallEntropy,
        chiSquareAnalysis: chiResults,
        rsAnalysis: rs,
        appendedData,
        metadata: metadataSummary,
        toolSignatures: matchedTools,
        findings: verdicts,
        overallVerdict: verdicts.length === 0 ? "clean" : verdicts.length <= 2 ? "suspicious" : "likely_stego",
      };

      return json(report);
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 2. img_lsb_detect ───

const imgLsbDetect: ToolDef = {
  name: "img_lsb_detect",
  description:
    "Statistical LSB steganography detection. Runs chi-square and sample pair analysis on each color channel independently.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { width, height, data: pixels, format } = await loadPixels(filePath);
      const totalPixels = width * height;

      const results: Record<string, unknown> = {};

      for (const ch of [0, 1, 2]) {
        const vals = channelValues(pixels, ch, totalPixels);
        const chi = chiSquareLsbTest(vals);
        const spa = samplePairAnalysis(vals);

        results[CHANNEL_NAMES[ch]] = {
          chiSquare: chi,
          samplePairAnalysis: spa,
        };
      }

      // Combined verdict
      const allVerdicts = Object.values(results).map((r) => {
        const res = r as { chiSquare: { verdict: string }; samplePairAnalysis: { verdict: string } };
        return [res.chiSquare.verdict, res.samplePairAnalysis.verdict];
      }).flat();

      const stegoCount = allVerdicts.filter((v) => v === "likely_stego").length;
      const suspCount = allVerdicts.filter((v) => v === "suspicious").length;

      let overallVerdict = "clean";
      if (stegoCount >= 2) overallVerdict = "likely_stego";
      else if (stegoCount >= 1 || suspCount >= 2) overallVerdict = "suspicious";

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        channelAnalysis: results,
        overallVerdict,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 3. img_lsb_extract ───

const imgLsbExtract: ToolDef = {
  name: "img_lsb_extract",
  description:
    "Extract hidden data from image LSBs. Extracts bits from specified channels and bit plane, attempts UTF-8 decode, and shows hex dump.",
  schema: {
    file_path: z.string().describe("Path to image file"),
    channels: z
      .string()
      .optional()
      .describe("Channels to extract from: r,g,b,a (default: r,g,b)"),
    bit_plane: z
      .number()
      .optional()
      .describe("Bit plane 0-7 (default: 0=LSB)"),
    order: z
      .enum(["row", "column"])
      .optional()
      .describe("Pixel traversal order (default: row)"),
    max_bytes: z
      .number()
      .optional()
      .describe("Max bytes to extract (default: 8192)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const channels = parseChannels(args.channels as string | undefined);
      const bitPlane = (args.bit_plane as number | undefined) ?? 0;
      const order = (args.order as "row" | "column" | undefined) ?? "row";
      const maxBytes = (args.max_bytes as number | undefined) ?? 8192;

      const { width, height, data: pixels, format } = await loadPixels(filePath);

      const bits = extractLsbValues(pixels, width, height, channels, bitPlane, order, maxBytes * 8);
      const extractedBuffer = bitsToBytes(bits);

      // Try UTF-8 decode (filter out non-printable for display)
      let textContent: string;
      try {
        const decoded = extractedBuffer.toString("utf-8");
        // Check how much is printable
        const printable = decoded.replace(/[^\x20-\x7E\n\r\t]/g, "");
        const printableRatio = printable.length / decoded.length;
        textContent = printableRatio > 0.5
          ? `[${(printableRatio * 100).toFixed(1)}% printable]\n${decoded.substring(0, 2000)}`
          : `[Only ${(printableRatio * 100).toFixed(1)}% printable — likely binary/encrypted data]`;
      } catch {
        textContent = "[Not valid UTF-8]";
      }

      // Hex dump of first 256 bytes
      const hexPreview = hexDump(extractedBuffer, 0, Math.min(256, extractedBuffer.length));

      return json({
        file: filePath,
        format,
        extractionParams: {
          channels: channels.map((c) => CHANNEL_NAMES[c]),
          bitPlane,
          order,
          maxBytes,
        },
        extractedBytes: extractedBuffer.length,
        textContent,
        hexDump: hexPreview,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 4. img_lsb_embed ───

const imgLsbEmbed: ToolDef = {
  name: "img_lsb_embed",
  description:
    "Embed a message into an image using LSB steganography. Reads a PNG file, embeds the message into the least significant bits, and writes a new PNG file.",
  schema: {
    file_path: z.string().describe("Path to source PNG image file"),
    message: z.string().describe("Message to embed"),
    output_path: z.string().describe("Output file path for the stego image"),
    channels: z
      .string()
      .optional()
      .describe("Channels to embed into: r,g,b,a (default: r,g,b)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const message = args.message as string;
      const outputPath = args.output_path as string;
      const channels = parseChannels(args.channels as string | undefined);

      // Read the source PNG
      const raw = await readFileInput(filePath);
      const format = detectImageFormat(raw);
      if (format !== "png") {
        return text("Error: LSB embedding only supports PNG files. Convert to PNG first.");
      }

      const png = PNG.sync.read(raw);
      const { width, height, data: pixels } = png;
      const totalPixels = width * height;

      // Prepare message bits with a 32-bit length header
      const msgBits = stringToBits(message);
      const lenBits: number[] = [];
      const msgLen = msgBits.length;
      for (let i = 31; i >= 0; i--) {
        lenBits.push((msgLen >> i) & 1);
      }
      const allBits = [...lenBits, ...msgBits];

      // Check capacity
      const capacity = totalPixels * channels.length;
      if (allBits.length > capacity) {
        return text(
          `Error: Message too large. Need ${allBits.length} bits, but image can hold ${capacity} bits in specified channels.`,
        );
      }

      // Embed bits into pixel data
      let bitIdx = 0;
      for (let p = 0; p < totalPixels && bitIdx < allBits.length; p++) {
        const pixelOffset = p * 4;
        for (const ch of channels) {
          if (bitIdx >= allBits.length) break;
          pixels[pixelOffset + ch] = setLsb(pixels[pixelOffset + ch], allBits[bitIdx]);
          bitIdx++;
        }
      }

      // Write the output PNG
      const outPng = new PNG({ width, height });
      pixels.copy(outPng.data);
      const outBuffer = PNG.sync.write(outPng);
      await writeFile(outputPath, outBuffer);

      return json({
        status: "success",
        inputFile: filePath,
        outputFile: outputPath,
        dimensions: { width, height },
        messageLength: message.length,
        bitsEmbedded: allBits.length,
        capacityUsed: `${((allBits.length / capacity) * 100).toFixed(2)}%`,
        channels: channels.map((c) => CHANNEL_NAMES[c]),
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 5. img_bitplane ───

const imgBitplane: ToolDef = {
  name: "img_bitplane",
  description:
    "Extract and visualize a specific bit plane from an image channel. Shows dimensions, percentage of 1-bits, and an ASCII art preview of the first rows.",
  schema: {
    file_path: z.string().describe("Path to image file"),
    plane: z
      .number()
      .optional()
      .describe("Bit plane 0-7 (default: 0=LSB)"),
    channel: z
      .number()
      .optional()
      .describe("Channel: 0=R, 1=G, 2=B, 3=A (default: 0=Red)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const plane = (args.plane as number | undefined) ?? 0;
      const channel = (args.channel as number | undefined) ?? 0;

      const { width, height, data: pixels, format } = await loadPixels(filePath);
      const bitPlane = getBitPlane(pixels, width, height, plane, channel);

      // Stats
      const ones = bitPlane.reduce((sum, b) => sum + b, 0);
      const total = bitPlane.length;
      const onesPercent = ((ones / total) * 100).toFixed(2);

      // Entropy of the bit plane
      const planeEntropy = shannonEntropy(Array.from(bitPlane));

      // ASCII visualization: first 50 rows, scale width down if needed
      const maxDisplayWidth = 120;
      const displayRows = Math.min(50, height);
      const step = width > maxDisplayWidth ? Math.ceil(width / maxDisplayWidth) : 1;
      const displayWidth = Math.ceil(width / step);

      const lines: string[] = [];
      for (let y = 0; y < displayRows; y++) {
        let row = "";
        for (let x = 0; x < width; x += step) {
          row += bitPlane[y * width + x] ? "#" : ".";
        }
        lines.push(row);
      }

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        bitPlane: plane,
        channel: CHANNEL_NAMES[channel] ?? `Channel ${channel}`,
        stats: {
          totalBits: total,
          onesBits: ones,
          onesPercent: `${onesPercent}%`,
          entropy: planeEntropy,
        },
        visualization: {
          displayDimensions: `${displayWidth}x${displayRows}`,
          scaleFactor: step > 1 ? `1:${step} horizontal` : "1:1",
          note: height > 50 ? `Showing first 50 of ${height} rows` : "Showing all rows",
          ascii: lines.join("\n"),
        },
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 6. img_chi_square ───

const imgChiSquare: ToolDef = {
  name: "img_chi_square",
  description:
    "Chi-square steganalysis attack on each color channel independently. Detects LSB replacement by testing whether adjacent pixel value pairs are equalized.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { width, height, data: pixels, format } = await loadPixels(filePath);
      const totalPixels = width * height;

      const results: Record<string, unknown> = {};
      for (const ch of [0, 1, 2]) {
        const vals = channelValues(pixels, ch, totalPixels);
        results[CHANNEL_NAMES[ch]] = chiSquareLsbTest(vals);
      }

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        totalPixels,
        chiSquareResults: results,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 7. img_rs_analysis ───

const imgRsAnalysis: ToolDef = {
  name: "img_rs_analysis",
  description:
    "RS (Regular-Singular) steganalysis using the Fridrich-Goljan-Du method. Analyzes pixel groups to estimate LSB embedding rate per channel.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { width, height, data: pixels, format } = await loadPixels(filePath);

      const results: Record<string, unknown> = {};
      for (const ch of [0, 1, 2]) {
        results[CHANNEL_NAMES[ch]] = rsAnalysis(pixels, width, height, ch);
      }

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        rsResults: results,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 8. img_histogram ───

const imgHistogram: ToolDef = {
  name: "img_histogram",
  description:
    "Generate a pixel value histogram with anomaly detection. Detects Pairs-of-Values (PoV) anomalies that indicate LSB steganography.",
  schema: {
    file_path: z.string().describe("Path to image file"),
    channel: z
      .number()
      .optional()
      .describe("Channel: 0=R, 1=G, 2=B, 3=A (default: all RGB combined)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const selectedChannel = args.channel as number | undefined;

      const { width, height, data: pixels, format } = await loadPixels(filePath);
      const totalPixels = width * height;

      const channelsToAnalyze = selectedChannel !== undefined ? [selectedChannel] : [0, 1, 2];

      const results: Record<string, unknown> = {};

      for (const ch of channelsToAnalyze) {
        const vals = channelValues(pixels, ch, totalPixels);
        const hist = histogram(vals, 256);

        // PoV anomaly detection: pairs of adjacent values (2i, 2i+1) should differ naturally.
        // If many pairs have equal counts, it suggests LSB replacement.
        let equalPairs = 0;
        let totalPairs = 0;
        const povDetails: Array<{ pair: string; counts: [number, number]; equal: boolean }> = [];
        for (let i = 0; i < 256; i += 2) {
          totalPairs++;
          const isEqual = hist[i] === hist[i + 1];
          if (isEqual) equalPairs++;
          if (isEqual && hist[i] > 0) {
            povDetails.push({
              pair: `${i}-${i + 1}`,
              counts: [hist[i], hist[i + 1]],
              equal: true,
            });
          }
        }

        const equalPairRatio = equalPairs / totalPairs;
        const povAnomaly = equalPairRatio > 0.3 ? "suspicious" : equalPairRatio > 0.6 ? "likely_stego" : "clean";

        // Find peaks and gaps
        const maxCount = Math.max(...hist);
        const peaks = hist
          .map((count: number, value: number) => ({ value, count }))
          .filter((h: { count: number }) => h.count > maxCount * 0.5)
          .slice(0, 10);

        results[CHANNEL_NAMES[ch]] = {
          histogram: hist,
          min: Math.min(...vals),
          max: Math.max(...vals),
          mean: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
          uniqueValues: new Set(vals).size,
          peaks,
          povAnalysis: {
            equalPairs,
            totalPairs,
            equalPairRatio: equalPairRatio.toFixed(4),
            verdict: povAnomaly,
            suspiciousPairs: povDetails.slice(0, 20),
          },
        };
      }

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        totalPixels,
        histogramAnalysis: results,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 9. img_entropy_map ───

const imgEntropyMap: ToolDef = {
  name: "img_entropy_map",
  description:
    "Per-block entropy analysis of an image. Splits the image into blocks and calculates Shannon entropy per block, flagging high-entropy regions that may contain hidden data.",
  schema: {
    file_path: z.string().describe("Path to image file"),
    block_size: z
      .number()
      .optional()
      .describe("Block size in pixels (default: 64)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const blockSize = (args.block_size as number | undefined) ?? 64;

      const { width, height, data: pixels, format } = await loadPixels(filePath);

      // Analyze entropy per block (block = blockSize x blockSize pixels)
      const blocksX = Math.ceil(width / blockSize);
      const blocksY = Math.ceil(height / blockSize);
      const blockResults: Array<{
        x: number;
        y: number;
        entropy: number;
        classification: string;
      }> = [];

      let totalEntropy = 0;
      let highEntropyCount = 0;

      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          const blockBytes: number[] = [];
          const startX = bx * blockSize;
          const startY = by * blockSize;
          const endX = Math.min(startX + blockSize, width);
          const endY = Math.min(startY + blockSize, height);

          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const idx = (y * width + x) * 4;
              // Include R, G, B bytes
              if (idx + 2 < pixels.length) {
                blockBytes.push(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
              }
            }
          }

          const ent = shannonEntropy(blockBytes);
          totalEntropy += ent;

          let classification: string;
          if (ent < 1.0) classification = "low";
          else if (ent < 6.0) classification = "normal";
          else if (ent < 7.5) classification = "high";
          else classification = "encrypted";

          if (ent >= 7.0) highEntropyCount++;

          blockResults.push({ x: bx, y: by, entropy: parseFloat(ent.toFixed(4)), classification });
        }
      }

      const avgEntropy = totalEntropy / blockResults.length;
      const overallEntropy = shannonEntropy(pixels);

      // Build an ASCII entropy map
      const mapLines: string[] = [];
      for (let by = 0; by < blocksY; by++) {
        let line = "";
        for (let bx = 0; bx < blocksX; bx++) {
          const block = blockResults[by * blocksX + bx];
          if (block.entropy >= 7.5) line += "!";
          else if (block.entropy >= 7.0) line += "#";
          else if (block.entropy >= 6.0) line += "+";
          else if (block.entropy >= 3.0) line += ".";
          else line += " ";
        }
        mapLines.push(line);
      }

      // Flag anomalous blocks (significantly higher than average)
      const stdDev = Math.sqrt(
        blockResults.reduce((sum, b) => sum + Math.pow(b.entropy - avgEntropy, 2), 0) / blockResults.length,
      );
      const anomalousBlocks = blockResults
        .filter((b) => b.entropy > avgEntropy + 2 * stdDev)
        .map((b) => ({ position: `(${b.x}, ${b.y})`, entropy: b.entropy, classification: b.classification }));

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        blockSize,
        gridDimensions: { blocksX, blocksY },
        totalBlocks: blockResults.length,
        overallEntropy: parseFloat(overallEntropy.toFixed(4)),
        averageBlockEntropy: parseFloat(avgEntropy.toFixed(4)),
        entropyStdDev: parseFloat(stdDev.toFixed(4)),
        highEntropyBlocks: highEntropyCount,
        anomalousBlocks,
        entropyMap: {
          legend: "! = encrypted (>7.5), # = high (>7.0), + = elevated (>6.0), . = normal (>3.0), space = low",
          map: mapLines.join("\n"),
        },
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 10. img_metadata ───

const imgMetadata: ToolDef = {
  name: "img_metadata",
  description:
    "Deep metadata extraction from an image. For PNG: extracts text chunks, chunk list, IHDR info. For JPEG: extracts EXIF, comments, quantization tables, marker list.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const raw = await readFileInput(filePath);
      const format = detectImageFormat(raw);

      if (format === "png") {
        const chunks = parsePngChunks(raw);
        const textChunks = extractTextChunks(chunks);

        // IHDR details
        const ihdr = chunks.find((c) => c.type === "IHDR");
        let ihdrInfo: Record<string, unknown> = {};
        if (ihdr && ihdr.data.length >= 13) {
          ihdrInfo = {
            width: ihdr.data.readUInt32BE(0),
            height: ihdr.data.readUInt32BE(4),
            bitDepth: ihdr.data[8],
            colorType: ihdr.data[9],
            compressionMethod: ihdr.data[10],
            filterMethod: ihdr.data[11],
            interlaceMethod: ihdr.data[12],
          };
        }

        return json({
          file: filePath,
          format: "png",
          fileSize: raw.length,
          ihdr: ihdrInfo,
          chunks: chunks.map((c) => ({
            type: c.type,
            offset: c.offset,
            length: c.length,
          })),
          totalChunks: chunks.length,
          textMetadata: textChunks,
        });
      }

      if (format === "jpeg") {
        const markers = parseJpegMarkers(raw);
        const app1 = markers.find((m) => m.marker === 0xffe1);
        const exif = app1 ? parseExifData(app1.data) : null;
        const comments = extractComments(markers);
        const quantTables = extractQuantizationTables(markers);

        return json({
          file: filePath,
          format: "jpeg",
          fileSize: raw.length,
          markers: markers.map((m) => ({
            name: m.name,
            offset: m.offset,
            length: m.length,
          })),
          totalMarkers: markers.length,
          exif,
          comments,
          quantizationTables: quantTables.map((qt) => ({
            id: qt.id,
            precision: qt.precision === 0 ? "8-bit" : "16-bit",
            estimatedQuality: qt.estimatedQuality,
          })),
        });
      }

      if (format === "bmp") {
        const bmp = await parseBmp(filePath);
        return json({
          file: filePath,
          format: "bmp",
          fileSize: raw.length,
          width: bmp.width,
          height: bmp.height,
          bitDepth: bmp.bitDepth,
          compression: bmp.compressionName,
          headerSize: bmp.headerSize,
          dataOffset: bmp.dataOffset,
          imageSize: bmp.imageSize,
          colorsUsed: bmp.colorsUsed,
          paletteEntries: bmp.palette.length,
        });
      }

      return text(`Error: Unsupported format for metadata extraction: ${format}`);
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 11. img_appended_data ───

const imgAppendedData: ToolDef = {
  name: "img_appended_data",
  description:
    "Detect and extract data appended after the image EOF marker. Checks for hidden data past PNG IEND, JPEG EOI, or BMP file size boundary.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const raw = await readFileInput(filePath);
      const format = detectImageFormat(raw);

      let appended: Buffer | null = null;

      if (format === "png") {
        appended = findPngAppendedData(raw);
      } else if (format === "jpeg") {
        appended = findJpegAppendedData(raw);
      } else if (format === "bmp") {
        appended = findBmpAppendedData(raw);
      } else {
        return text(`Error: Unsupported format for appended data detection: ${format}`);
      }

      if (!appended || appended.length === 0) {
        return json({
          file: filePath,
          format,
          fileSize: raw.length,
          appendedData: false,
          message: "No data found after EOF marker.",
        });
      }

      // Analyze appended data
      const entropy = shannonEntropy(appended);
      const appendedFormat = detectImageFormat(appended);

      // Try UTF-8 decode
      let textPreview: string | null = null;
      const printable = appended
        .subarray(0, Math.min(500, appended.length))
        .toString("utf-8")
        .replace(/[^\x20-\x7E\n\r\t]/g, "");
      if (printable.length > appended.subarray(0, Math.min(500, appended.length)).length * 0.5) {
        textPreview = printable.substring(0, 500);
      }

      const hex = hexDump(appended, 0, Math.min(256, appended.length));

      return json({
        file: filePath,
        format,
        fileSize: raw.length,
        appendedData: true,
        appendedSize: appended.length,
        appendedOffset: raw.length - appended.length,
        entropy: parseFloat(entropy.toFixed(4)),
        embeddedFormat: appendedFormat !== "unknown" ? appendedFormat : null,
        textPreview,
        hexDump: hex,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 12. img_compare ───

const imgCompare: ToolDef = {
  name: "img_compare",
  description:
    "Pixel-by-pixel comparison of two images. Reports identical/different pixel counts, max difference, and which channels are affected. Useful for detecting steganographic modifications.",
  schema: {
    file_path_1: z.string().describe("Path to first image file"),
    file_path_2: z.string().describe("Path to second image file"),
  },
  async execute(args) {
    try {
      const filePath1 = args.file_path_1 as string;
      const filePath2 = args.file_path_2 as string;

      const img1 = await loadPixels(filePath1);
      const img2 = await loadPixels(filePath2);

      if (img1.width !== img2.width || img1.height !== img2.height) {
        return json({
          file1: filePath1,
          file2: filePath2,
          dimensionMismatch: true,
          dimensions1: { width: img1.width, height: img1.height },
          dimensions2: { width: img2.width, height: img2.height },
          message: "Images have different dimensions — cannot perform pixel comparison.",
        });
      }

      const { width, height } = img1;
      const totalPixels = width * height;
      let identicalPixels = 0;
      let differentPixels = 0;
      let maxDiff = 0;
      const channelDiffs = [0, 0, 0, 0]; // R, G, B, A
      const diffDistribution: number[] = new Array(256).fill(0);
      let totalAbsDiff = 0;

      // Track positions of largest diffs
      const biggestDiffs: Array<{ x: number; y: number; diff: number; channels: string[] }> = [];

      for (let p = 0; p < totalPixels; p++) {
        const idx = p * 4;
        let pixelDiff = 0;
        let isIdentical = true;
        const chanList: string[] = [];

        for (let ch = 0; ch < 4; ch++) {
          const d = Math.abs(img1.data[idx + ch] - img2.data[idx + ch]);
          if (d > 0) {
            isIdentical = false;
            channelDiffs[ch]++;
            chanList.push(CHANNEL_NAMES[ch]);
          }
          pixelDiff = Math.max(pixelDiff, d);
          totalAbsDiff += d;
        }

        if (isIdentical) {
          identicalPixels++;
        } else {
          differentPixels++;
          diffDistribution[Math.min(pixelDiff, 255)]++;
          if (pixelDiff > maxDiff) maxDiff = pixelDiff;

          // Keep top 10 biggest diffs
          if (biggestDiffs.length < 10 || pixelDiff > (biggestDiffs[biggestDiffs.length - 1]?.diff ?? 0)) {
            biggestDiffs.push({
              x: p % width,
              y: Math.floor(p / width),
              diff: pixelDiff,
              channels: chanList,
            });
            biggestDiffs.sort((a, b) => b.diff - a.diff);
            if (biggestDiffs.length > 10) biggestDiffs.pop();
          }
        }
      }

      // Check if only LSB changes (diff = 1 in most cases)
      const lsbOnlyChanges = diffDistribution[1];
      const lsbRatio = differentPixels > 0 ? lsbOnlyChanges / differentPixels : 0;

      return json({
        file1: filePath1,
        file2: filePath2,
        dimensions: { width, height },
        totalPixels,
        identicalPixels,
        differentPixels,
        differencePercent: `${((differentPixels / totalPixels) * 100).toFixed(4)}%`,
        maxDifference: maxDiff,
        meanAbsDifference: parseFloat((totalAbsDiff / (totalPixels * 4)).toFixed(4)),
        channelDifferences: {
          Red: channelDiffs[0],
          Green: channelDiffs[1],
          Blue: channelDiffs[2],
          Alpha: channelDiffs[3],
        },
        lsbAnalysis: {
          pixelsWithLsbOnlyChange: lsbOnlyChanges,
          lsbChangeRatio: parseFloat(lsbRatio.toFixed(4)),
          verdict: lsbRatio > 0.9 ? "likely_lsb_steganography" : lsbRatio > 0.5 ? "suspicious" : "not_lsb_pattern",
        },
        biggestDifferences: biggestDiffs,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 13. img_channel_analysis ───

const imgChannelAnalysis: ToolDef = {
  name: "img_channel_analysis",
  description:
    "Per-channel statistical analysis for R, G, B, and A channels. Reports mean, standard deviation, entropy, min, max, and unique value count for each channel.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { width, height, data: pixels, format } = await loadPixels(filePath);
      const totalPixels = width * height;

      const results: Record<string, unknown> = {};

      for (const ch of [0, 1, 2, 3]) {
        const vals = channelValues(pixels, ch, totalPixels);
        if (vals.length === 0) continue;

        const sum = vals.reduce((a, b) => a + b, 0);
        const mean = sum / vals.length;
        const variance = vals.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / vals.length;
        const stdDev = Math.sqrt(variance);
        const entropy = shannonEntropy(vals);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const uniqueValues = new Set(vals).size;

        // LSB distribution
        const lsbOnes = vals.filter((v) => v & 1).length;
        const lsbBalance = lsbOnes / vals.length;

        results[CHANNEL_NAMES[ch]] = {
          mean: parseFloat(mean.toFixed(4)),
          stdDev: parseFloat(stdDev.toFixed(4)),
          entropy: parseFloat(entropy.toFixed(4)),
          min,
          max,
          uniqueValues,
          lsbBalance: parseFloat(lsbBalance.toFixed(4)),
          lsbNote:
            Math.abs(lsbBalance - 0.5) < 0.01
              ? "LSB perfectly balanced (possible stego)"
              : Math.abs(lsbBalance - 0.5) < 0.03
                ? "LSB nearly balanced"
                : "LSB has natural bias",
        };
      }

      return json({
        file: filePath,
        format,
        dimensions: { width, height },
        totalPixels,
        channelStatistics: results,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 14. img_known_tools ───

const imgKnownTools: ToolDef = {
  name: "img_known_tools",
  description:
    "Scan image file bytes for known steganography tool signatures. Checks against a database of known patterns from tools like OpenStego, Steghide, JSteg, F5, and others.",
  schema: {
    file_path: z.string().describe("Path to image file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const raw = await readFileInput(filePath);
      const format = detectImageFormat(raw);
      const formatKey = format === "jpeg" ? "jpg" : format;

      const matches: Array<{
        tool: string;
        description: string;
        technique: string;
        matchedPatterns: string[];
        statisticalIndicators: string[];
      }> = [];

      const applicableTools: Array<{
        tool: string;
        description: string;
        fileTypes: string[];
      }> = [];

      for (const sig of STEGO_SIGNATURES) {
        if (!sig.fileTypes.includes(formatKey)) continue;

        applicableTools.push({
          tool: sig.tool,
          description: sig.description,
          fileTypes: sig.fileTypes,
        });

        const matchedPatterns: string[] = [];

        for (const pattern of sig.headerPatterns) {
          if (pattern.text) {
            const needle = Buffer.from(pattern.text, "utf-8");
            if (raw.includes(needle)) {
              matchedPatterns.push(`Text pattern "${pattern.text}" found: ${pattern.description}`);
            }
          }

          if (pattern.bytes && pattern.bytes.length > 0) {
            const needle = Buffer.from(pattern.bytes);

            if (pattern.offset === "end") {
              // Check at end of file
              const tail = raw.subarray(raw.length - needle.length - 16);
              if (tail.includes(needle)) {
                matchedPatterns.push(`Byte pattern at EOF: ${pattern.description}`);
              }
            } else if (pattern.offset === "any") {
              if (raw.includes(needle)) {
                matchedPatterns.push(`Byte pattern found: ${pattern.description}`);
              }
            } else if (typeof pattern.offset === "number") {
              const slice = raw.subarray(pattern.offset, pattern.offset + needle.length);
              if (slice.equals(needle)) {
                matchedPatterns.push(`Byte pattern at offset ${pattern.offset}: ${pattern.description}`);
              }
            }
          }
        }

        if (matchedPatterns.length > 0) {
          matches.push({
            tool: sig.tool,
            description: sig.description,
            technique: sig.technique,
            matchedPatterns,
            statisticalIndicators: sig.statisticalIndicators,
          });
        }
      }

      return json({
        file: filePath,
        format,
        fileSize: raw.length,
        signatureMatches: matches,
        matchCount: matches.length,
        applicableToolCount: applicableTools.length,
        applicableTools,
        verdict:
          matches.length > 0
            ? `${matches.length} tool signature(s) detected`
            : "No known tool signatures found (may still contain data — use statistical analysis)",
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── Export ───

export const imageTools: ToolDef[] = [
  imgDetect,
  imgLsbDetect,
  imgLsbExtract,
  imgLsbEmbed,
  imgBitplane,
  imgChiSquare,
  imgRsAnalysis,
  imgHistogram,
  imgEntropyMap,
  imgMetadata,
  imgAppendedData,
  imgCompare,
  imgChannelAnalysis,
  imgKnownTools,
];
