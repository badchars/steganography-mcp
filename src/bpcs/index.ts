import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, detectImageFormat, getBitPlane } from "../utils/binary.js";
import { borderComplexity, shannonEntropy } from "../utils/stats.js";
import { getJpegPixels } from "../utils/jpeg-parser.js";
import { getPngPixels } from "../utils/png-parser.js";

// ─── Helpers ───

interface PixelData {
  width: number;
  height: number;
  data: Buffer;
}

/** Load pixels from either PNG or JPEG based on format detection */
async function loadPixels(filePath: string): Promise<PixelData> {
  const buf = await readFileInput(filePath);
  const fmt = detectImageFormat(buf);

  if (fmt === "jpeg") {
    const result = await getJpegPixels(filePath);
    return { width: result.width, height: result.height, data: result.data };
  } else if (fmt === "png") {
    const result = await getPngPixels(filePath);
    return { width: result.width, height: result.height, data: result.data };
  } else {
    throw new Error(`Unsupported image format: ${fmt}. Only PNG and JPEG are supported.`);
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Default BPCS block size */
const BPCS_BLOCK = 8;

/**
 * Extract an 8x8 block from a bit plane at the given block coordinates.
 * Returns null if the block extends beyond image boundaries.
 */
function extractBlock(
  bitPlane: Uint8Array,
  width: number,
  height: number,
  blockX: number,
  blockY: number,
  blockSize: number,
): Uint8Array | null {
  const startX = blockX * blockSize;
  const startY = blockY * blockSize;

  if (startX + blockSize > width || startY + blockSize > height) {
    return null;
  }

  const block = new Uint8Array(blockSize * blockSize);
  for (let dy = 0; dy < blockSize; dy++) {
    for (let dx = 0; dx < blockSize; dx++) {
      block[dy * blockSize + dx] = bitPlane[(startY + dy) * width + (startX + dx)];
    }
  }
  return block;
}

/**
 * Compute BPCS complexity map for a given channel and bit plane.
 * Returns per-block complexity values and classification.
 */
function computeComplexityMap(
  pixels: Buffer,
  width: number,
  height: number,
  channel: number,
  plane: number,
  threshold: number,
): {
  blocksX: number;
  blocksY: number;
  complexities: number[];
  complexCount: number;
  simpleCount: number;
} {
  const bitPlane = getBitPlane(pixels, width, height, plane, channel);
  const blocksX = Math.floor(width / BPCS_BLOCK);
  const blocksY = Math.floor(height / BPCS_BLOCK);

  const complexities: number[] = [];
  let complexCount = 0;
  let simpleCount = 0;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const block = extractBlock(bitPlane, width, height, bx, by, BPCS_BLOCK);
      if (!block) {
        complexities.push(0);
        simpleCount++;
        continue;
      }

      const result = borderComplexity(block, BPCS_BLOCK, BPCS_BLOCK, threshold);
      complexities.push(result.complexity);

      if (result.isComplex) {
        complexCount++;
      } else {
        simpleCount++;
      }
    }
  }

  return { blocksX, blocksY, complexities, complexCount, simpleCount };
}

// ─── Tool 1: bpcs_detect ───

const bpcsDetect: ToolDef = {
  name: "bpcs_detect",
  description:
    "Auto-detect BPCS (Bit-Plane Complexity Segmentation) steganographic embedding. Computes the complexity map across all bit planes and channels, then checks for an abnormally high ratio of complex blocks — the signature of BPCS embedding which replaces complex bit-plane regions with hidden data.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for BPCS detection"),
    threshold: z.number().optional().describe("Complexity threshold (0.0-1.0, default: 0.3)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const threshold = (args.threshold as number | undefined) ?? 0.3;

      const { width, height, data: pixels } = await loadPixels(filePath);

      const channelNames = ["Red", "Green", "Blue"];
      const planeResults: Array<{
        channel: string;
        plane: number;
        complexCount: number;
        simpleCount: number;
        totalBlocks: number;
        complexRatio: number;
        avgComplexity: number;
      }> = [];

      let globalComplexCount = 0;
      let globalTotalBlocks = 0;

      // Analyze all 8 bit planes for R, G, B channels
      for (let ch = 0; ch < 3; ch++) {
        for (let plane = 0; plane < 8; plane++) {
          const map = computeComplexityMap(pixels, width, height, ch, plane, threshold);
          const totalBlocks = map.complexCount + map.simpleCount;
          const complexRatio = totalBlocks > 0 ? map.complexCount / totalBlocks : 0;
          const avgComplexity = map.complexities.length > 0
            ? map.complexities.reduce((a, b) => a + b, 0) / map.complexities.length
            : 0;

          planeResults.push({
            channel: channelNames[ch],
            plane,
            complexCount: map.complexCount,
            simpleCount: map.simpleCount,
            totalBlocks,
            complexRatio,
            avgComplexity,
          });

          globalComplexCount += map.complexCount;
          globalTotalBlocks += totalBlocks;
        }
      }

      const globalComplexRatio = globalTotalBlocks > 0 ? globalComplexCount / globalTotalBlocks : 0;

      // BPCS signature 1: Higher bit planes (MSB) should have low complexity
      // Abnormally high complexity in MSB planes is suspicious
      const msbResults = planeResults.filter((r) => r.plane >= 6);
      const lsbResults = planeResults.filter((r) => r.plane <= 1);
      const msbAvgRatio = msbResults.length > 0
        ? msbResults.reduce((a, r) => a + r.complexRatio, 0) / msbResults.length
        : 0;
      const lsbAvgRatio = lsbResults.length > 0
        ? lsbResults.reduce((a, r) => a + r.complexRatio, 0) / lsbResults.length
        : 0;

      // BPCS signature 2: Complexity distribution across planes
      // Normal images: complexity decreases from LSB to MSB
      // BPCS-embedded: complexity is high across multiple planes
      let decreasingTrend = true;
      for (let ch = 0; ch < 3; ch++) {
        const channelPlanes = planeResults.filter((r) => r.channel === channelNames[ch]);
        for (let i = 1; i < channelPlanes.length; i++) {
          if (channelPlanes[i].complexRatio > channelPlanes[i - 1].complexRatio + 0.1) {
            decreasingTrend = false;
          }
        }
      }

      // BPCS signature 3: Uniformity of complex block distribution
      // BPCS replaces complex blocks uniformly, making complexity very uniform
      const allRatios = planeResults.map((r) => r.complexRatio);
      const ratioMean = allRatios.reduce((a, b) => a + b, 0) / allRatios.length;
      const ratioStdDev = Math.sqrt(
        allRatios.reduce((a, r) => a + Math.pow(r - ratioMean, 2), 0) / allRatios.length,
      );
      const ratioCv = ratioMean > 0 ? ratioStdDev / ratioMean : 0;

      // Scoring
      let bpcsScore = 0;
      const indicators: string[] = [];

      if (globalComplexRatio > 0.6) {
        bpcsScore += 3;
        indicators.push(`Very high overall complex block ratio: ${(globalComplexRatio * 100).toFixed(1)}%`);
      } else if (globalComplexRatio > 0.45) {
        bpcsScore += 1;
        indicators.push(`Elevated complex block ratio: ${(globalComplexRatio * 100).toFixed(1)}%`);
      }

      if (msbAvgRatio > 0.3) {
        bpcsScore += 2;
        indicators.push(`MSB planes (6-7) have high complexity: ${(msbAvgRatio * 100).toFixed(1)}% (unusual for natural images)`);
      }

      if (!decreasingTrend) {
        bpcsScore += 1;
        indicators.push("Complexity does not decrease monotonically from LSB to MSB (non-natural pattern)");
      }

      if (ratioCv < 0.2 && planeResults.length > 8) {
        bpcsScore += 1;
        indicators.push(`Low complexity ratio variation across planes: CV=${ratioCv.toFixed(4)} (unnaturally uniform)`);
      }

      const verdict =
        bpcsScore >= 5 ? "likely_bpcs" :
        bpcsScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `BPCS Steganography Detection: ${filePath}`,
        `Image: ${width}x${height}`,
        `Block size: ${BPCS_BLOCK}x${BPCS_BLOCK}`,
        `Threshold: ${threshold}`,
        "",
        "Overall Statistics:",
        `  Total blocks analyzed: ${globalTotalBlocks.toLocaleString()} (24 bit planes x ${planeResults[0]?.totalBlocks ?? 0} blocks)`,
        `  Complex blocks: ${globalComplexCount.toLocaleString()} (${(globalComplexRatio * 100).toFixed(1)}%)`,
        `  MSB plane avg complexity ratio: ${(msbAvgRatio * 100).toFixed(1)}%`,
        `  LSB plane avg complexity ratio: ${(lsbAvgRatio * 100).toFixed(1)}%`,
        `  Complexity ratio CV: ${ratioCv.toFixed(4)}`,
        `  Decreasing MSB->LSB trend: ${decreasingTrend ? "yes (natural)" : "NO (suspicious)"}`,
        "",
        "Per-Plane Complexity Map:",
        "─".repeat(80),
        `${"Channel".padEnd(8)} ${"Plane".padEnd(7)} ${"Complex".padEnd(10)} ${"Simple".padEnd(10)} ${"Ratio".padEnd(8)} ${"Avg Complexity".padEnd(15)} ${"Bar"}`,
        "─".repeat(80),
      ];

      for (const r of planeResults) {
        const bar = "█".repeat(Math.round(r.complexRatio * 30));
        lines.push(
          `${r.channel.padEnd(8)} ` +
          `${String(r.plane).padEnd(7)} ` +
          `${r.complexCount.toString().padEnd(10)} ` +
          `${r.simpleCount.toString().padEnd(10)} ` +
          `${(r.complexRatio * 100).toFixed(1).padStart(5)}%  ` +
          `${r.avgComplexity.toFixed(3).padStart(13)}  ` +
          `${bar}`,
        );
      }

      lines.push("─".repeat(80));
      lines.push("");
      lines.push(`BPCS Score: ${bpcsScore}/7`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_bpcs") {
        lines.push("  BPCS embedding signatures detected. Bit plane complexity patterns are inconsistent with natural images.");
      } else if (verdict === "suspicious") {
        lines.push("  Some BPCS-like patterns present. Further analysis recommended.");
      } else {
        lines.push("  Bit plane complexity appears natural. No BPCS embedding indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 2: bpcs_complexity_map ───

const bpcsComplexityMap: ToolDef = {
  name: "bpcs_complexity_map",
  description:
    "Generate a detailed complexity map of all bit planes for a given channel. Computes border complexity for each 8x8 block across all 8 bit planes, producing a spatial map showing where complex (potentially data-carrying) regions are located in the image.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for complexity mapping"),
    channel: z.number().optional().describe("Color channel: 0=R, 1=G, 2=B (default: 0)"),
    threshold: z.number().optional().describe("Complexity threshold (0.0-1.0, default: 0.3)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const threshold = (args.threshold as number | undefined) ?? 0.3;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);

      const blocksX = Math.floor(width / BPCS_BLOCK);
      const blocksY = Math.floor(height / BPCS_BLOCK);

      const lines: string[] = [
        `BPCS Complexity Map: ${filePath}`,
        `Image: ${width}x${height}`,
        `Channel: ${channelName}`,
        `Block size: ${BPCS_BLOCK}x${BPCS_BLOCK}`,
        `Grid: ${blocksX}x${blocksY} blocks`,
        `Threshold: ${threshold}`,
        "",
      ];

      for (let plane = 7; plane >= 0; plane--) {
        const map = computeComplexityMap(pixels, width, height, channel, plane, threshold);
        const totalBlocks = map.complexCount + map.simpleCount;
        const ratio = totalBlocks > 0 ? map.complexCount / totalBlocks : 0;

        lines.push(`── Bit Plane ${plane} (${plane === 7 ? "MSB" : plane === 0 ? "LSB" : `bit ${plane}`}) ──`);
        lines.push(`  Complex: ${map.complexCount}/${totalBlocks} (${(ratio * 100).toFixed(1)}%)`);
        lines.push("");

        // ASCII spatial map (limited to first 60 columns for readability)
        const displayCols = Math.min(blocksX, 60);
        const displayRows = Math.min(blocksY, 30);

        lines.push("  Spatial complexity map ('#' = complex, '.' = simple):");
        lines.push(`  ${"".padStart(displayCols + 4, "─")}`);

        for (let by = 0; by < displayRows; by++) {
          let row = "  ";
          for (let bx = 0; bx < displayCols; bx++) {
            const idx = by * blocksX + bx;
            if (map.complexities[idx] >= threshold) {
              row += "#";
            } else {
              row += ".";
            }
          }
          if (blocksX > displayCols) row += "...";
          lines.push(row);
        }

        if (blocksY > displayRows) {
          lines.push(`  ... (${blocksY - displayRows} more rows)`);
        }

        lines.push("");

        // Complexity distribution for this plane
        const complexityBins = new Array(10).fill(0);
        for (const c of map.complexities) {
          const bin = Math.min(9, Math.floor(c * 10));
          complexityBins[bin]++;
        }

        lines.push("  Complexity distribution:");
        for (let b = 0; b < 10; b++) {
          const binStart = (b / 10).toFixed(1);
          const binEnd = ((b + 1) / 10).toFixed(1);
          const count = complexityBins[b];
          const bar = "█".repeat(Math.round((count / totalBlocks) * 40));
          lines.push(`    ${binStart}-${binEnd}: ${String(count).padStart(6)} ${bar}`);
        }

        lines.push("");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 3: bpcs_threshold ───

const bpcsThreshold: ToolDef = {
  name: "bpcs_threshold",
  description:
    "Complexity threshold analysis for BPCS steganalysis. Tests multiple threshold values and analyzes how the complex/simple block ratio changes. Finds the optimal threshold boundary where BPCS embedding would be most detectable, and identifies threshold ranges that produce suspicious ratios.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for threshold analysis"),
    channel: z.number().optional().describe("Color channel: 0=R, 1=G, 2=B (default: 0)"),
    plane: z.number().optional().describe("Bit plane to analyze: 0=LSB, 7=MSB (default: 0)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const plane = (args.plane as number | undefined) ?? 0;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);

      // Test thresholds from 0.05 to 0.95
      const thresholds = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];

      const results: Array<{
        threshold: number;
        complexCount: number;
        simpleCount: number;
        totalBlocks: number;
        complexRatio: number;
        avgComplexity: number;
      }> = [];

      // Also compute complexity values once for analysis
      const bitPlane = getBitPlane(pixels, width, height, plane, channel);
      const blocksX = Math.floor(width / BPCS_BLOCK);
      const blocksY = Math.floor(height / BPCS_BLOCK);
      const allComplexities: number[] = [];

      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          const block = extractBlock(bitPlane, width, height, bx, by, BPCS_BLOCK);
          if (block) {
            const result = borderComplexity(block, BPCS_BLOCK, BPCS_BLOCK, 0.5);
            allComplexities.push(result.complexity);
          }
        }
      }

      for (const t of thresholds) {
        const complexCount = allComplexities.filter((c) => c >= t).length;
        const simpleCount = allComplexities.length - complexCount;
        const totalBlocks = allComplexities.length;
        const complexRatio = totalBlocks > 0 ? complexCount / totalBlocks : 0;
        const avgComplexity = allComplexities.length > 0
          ? allComplexities.reduce((a, b) => a + b, 0) / allComplexities.length
          : 0;

        results.push({ threshold: t, complexCount, simpleCount, totalBlocks, complexRatio, avgComplexity });
      }

      // Find the threshold with the steepest drop in complex ratio
      // This is the optimal BPCS boundary
      let maxDrop = 0;
      let optimalThreshold = 0.3;

      for (let i = 1; i < results.length; i++) {
        const drop = results[i - 1].complexRatio - results[i].complexRatio;
        if (drop > maxDrop) {
          maxDrop = drop;
          optimalThreshold = (results[i - 1].threshold + results[i].threshold) / 2;
        }
      }

      // Find the "natural" threshold where complex ratio matches typical BPCS expectations
      // Typical natural images: ~45-55% complex at threshold 0.3
      // BPCS-embedded: may show >60% complex even at higher thresholds
      const at030 = results.find((r) => r.threshold === 0.30);
      const at050 = results.find((r) => r.threshold === 0.50);

      // Complexity distribution statistics
      const complexityMean = allComplexities.length > 0
        ? allComplexities.reduce((a, b) => a + b, 0) / allComplexities.length
        : 0;
      const complexityStdDev = Math.sqrt(
        allComplexities.reduce((a, c) => a + Math.pow(c - complexityMean, 2), 0) / allComplexities.length,
      );
      const complexityEntropy = shannonEntropy(
        allComplexities.map((c) => Math.min(255, Math.floor(c * 255))),
      );

      const lines: string[] = [
        `BPCS Threshold Analysis: ${filePath}`,
        `Image: ${width}x${height}`,
        `Channel: ${channelName}, Bit plane: ${plane} (${plane === 0 ? "LSB" : plane === 7 ? "MSB" : `bit ${plane}`})`,
        `Block size: ${BPCS_BLOCK}x${BPCS_BLOCK}`,
        `Total blocks: ${allComplexities.length}`,
        "",
        "Complexity Statistics:",
        `  Mean complexity: ${complexityMean.toFixed(4)}`,
        `  Std deviation: ${complexityStdDev.toFixed(4)}`,
        `  Complexity entropy: ${complexityEntropy.toFixed(4)} bits`,
        "",
        "Threshold Sweep:",
        "─".repeat(85),
        `${"Threshold".padEnd(12)} ${"Complex".padEnd(10)} ${"Simple".padEnd(10)} ${"Ratio".padEnd(8)} ${"Bar".padEnd(35)} ${"Note"}`,
        "─".repeat(85),
      ];

      for (const r of results) {
        const bar = "█".repeat(Math.round(r.complexRatio * 30));
        let note = "";
        if (Math.abs(r.threshold - optimalThreshold) < 0.03) {
          note = "<-- optimal";
        } else if (r.threshold === 0.30) {
          note = "(standard)";
        }

        lines.push(
          `${r.threshold.toFixed(2).padEnd(12)} ` +
          `${r.complexCount.toString().padEnd(10)} ` +
          `${r.simpleCount.toString().padEnd(10)} ` +
          `${(r.complexRatio * 100).toFixed(1).padStart(5)}%  ` +
          `${bar.padEnd(35)} ` +
          `${note}`,
        );
      }

      lines.push("─".repeat(85));
      lines.push("");
      lines.push(`Optimal threshold (steepest ratio drop): ${optimalThreshold.toFixed(2)}`);
      lines.push(`Max drop between adjacent thresholds: ${(maxDrop * 100).toFixed(1)}%`);
      lines.push("");

      // Analysis
      lines.push("Analysis:");

      if (at030 && at030.complexRatio > 0.60) {
        lines.push(`  [!] At threshold 0.30: ${(at030.complexRatio * 100).toFixed(1)}% complex blocks (>60% is suspicious for BPCS)`);
      } else if (at030) {
        lines.push(`  [OK] At threshold 0.30: ${(at030.complexRatio * 100).toFixed(1)}% complex blocks (within normal range)`);
      }

      if (at050 && at050.complexRatio > 0.40) {
        lines.push(`  [!] At threshold 0.50: ${(at050.complexRatio * 100).toFixed(1)}% complex blocks (high — data may be embedded in complex regions)`);
      } else if (at050) {
        lines.push(`  [OK] At threshold 0.50: ${(at050.complexRatio * 100).toFixed(1)}% complex blocks (normal)`);
      }

      if (maxDrop < 0.05) {
        lines.push("  [?] Very gradual threshold curve — complexity is distributed uniformly (possible BPCS)");
      } else if (maxDrop > 0.2) {
        lines.push("  [OK] Sharp threshold boundary — natural image complexity distribution");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 4: bpcs_extract ───

const bpcsExtract: ToolDef = {
  name: "bpcs_extract",
  description:
    "Extract data from BPCS complex regions. Gathers bits from all blocks that exceed the complexity threshold in the specified bit plane, assembling them in raster-scan order. The extracted bytes are analyzed for structure including magic bytes, entropy, and printable text content.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for BPCS extraction"),
    channel: z.number().optional().describe("Color channel: 0=R, 1=G, 2=B (default: 0)"),
    plane: z.number().optional().describe("Bit plane: 0=LSB, 7=MSB (default: 0)"),
    threshold: z.number().optional().describe("Complexity threshold (0.0-1.0, default: 0.3)"),
    max_bytes: z.number().optional().describe("Maximum bytes to extract (default: 4096)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const plane = (args.plane as number | undefined) ?? 0;
      const threshold = (args.threshold as number | undefined) ?? 0.3;
      const maxBytes = (args.max_bytes as number | undefined) ?? 4096;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);

      const bitPlane = getBitPlane(pixels, width, height, plane, channel);
      const blocksX = Math.floor(width / BPCS_BLOCK);
      const blocksY = Math.floor(height / BPCS_BLOCK);

      // Collect bits from complex blocks in raster order
      const extractedBits: number[] = [];
      let complexBlocksUsed = 0;
      const maxBits = maxBytes * 8;

      for (let by = 0; by < blocksY && extractedBits.length < maxBits; by++) {
        for (let bx = 0; bx < blocksX && extractedBits.length < maxBits; bx++) {
          const block = extractBlock(bitPlane, width, height, bx, by, BPCS_BLOCK);
          if (!block) continue;

          const result = borderComplexity(block, BPCS_BLOCK, BPCS_BLOCK, threshold);
          if (!result.isComplex) continue;

          // Extract all bits from this complex block
          for (let i = 0; i < block.length && extractedBits.length < maxBits; i++) {
            extractedBits.push(block[i]);
          }
          complexBlocksUsed++;
        }
      }

      // Convert bits to bytes
      const extractedBytes = Buffer.alloc(Math.floor(extractedBits.length / 8));
      for (let i = 0; i < extractedBytes.length; i++) {
        let byte = 0;
        for (let b = 0; b < 8; b++) {
          byte = (byte << 1) | (extractedBits[i * 8 + b] & 1);
        }
        extractedBytes[i] = byte;
      }

      // Analyze extracted data
      const dataEntropy = shannonEntropy(extractedBytes);

      // Check for magic bytes
      const fmt = detectImageFormat(extractedBytes);

      // Check for printable ASCII content
      let printableCount = 0;
      let nullCount = 0;
      for (const b of extractedBytes) {
        if (b >= 0x20 && b <= 0x7e) printableCount++;
        if (b === 0x00) nullCount++;
      }
      const printableRatio = extractedBytes.length > 0 ? printableCount / extractedBytes.length : 0;
      const nullRatio = extractedBytes.length > 0 ? nullCount / extractedBytes.length : 0;

      // Try to find text content
      let textPreview = "";
      if (printableRatio > 0.7) {
        const raw = extractedBytes.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, ".");
        textPreview = raw.substring(0, 200);
      }

      // Hex dump of first portion
      const hexLines: string[] = [];
      const hexBytes = Math.min(256, extractedBytes.length);
      for (let i = 0; i < hexBytes; i += 16) {
        const addr = i.toString(16).padStart(8, "0");
        const hexParts: string[] = [];
        let ascii = "";
        for (let j = 0; j < 16; j++) {
          const idx = i + j;
          if (idx < hexBytes) {
            hexParts.push(extractedBytes[idx].toString(16).padStart(2, "0"));
            ascii += extractedBytes[idx] >= 0x20 && extractedBytes[idx] <= 0x7e
              ? String.fromCharCode(extractedBytes[idx])
              : ".";
          } else {
            hexParts.push("  ");
            ascii += " ";
          }
        }
        hexLines.push(`${addr}  ${hexParts.join(" ")}  |${ascii}|`);
      }

      const lines: string[] = [
        `BPCS Data Extraction: ${filePath}`,
        `Image: ${width}x${height}`,
        `Channel: ${channelName}, Bit plane: ${plane}`,
        `Threshold: ${threshold}`,
        "",
        "Extraction Summary:",
        `  Complex blocks used: ${complexBlocksUsed}`,
        `  Bits extracted: ${extractedBits.length.toLocaleString()}`,
        `  Bytes extracted: ${extractedBytes.length.toLocaleString()} (${formatSize(extractedBytes.length)})`,
        "",
        "Extracted Data Analysis:",
        `  Entropy: ${dataEntropy.toFixed(4)} bits`,
        `  Printable ASCII: ${(printableRatio * 100).toFixed(1)}%`,
        `  Null bytes: ${(nullRatio * 100).toFixed(1)}%`,
        `  Detected format: ${fmt !== "unknown" ? fmt.toUpperCase() : "none/unknown"}`,
        "",
      ];

      if (fmt !== "unknown") {
        lines.push(`  [!] Extracted data appears to be a ${fmt.toUpperCase()} file!`);
        lines.push("");
      }

      if (textPreview.length > 0) {
        lines.push("Text Content Preview:");
        lines.push(`  "${textPreview}${extractedBytes.length > 200 ? "..." : ""}"`);
        lines.push("");
      }

      if (dataEntropy > 7.5) {
        lines.push("  [!] Very high entropy — data appears encrypted or compressed");
      } else if (dataEntropy > 6.0) {
        lines.push("  [?] Moderately high entropy — may contain structured data");
      } else if (dataEntropy < 1.0 && extractedBytes.length > 10) {
        lines.push("  [i] Very low entropy — likely padding or empty data");
      }

      lines.push("");
      lines.push("Hex Dump (first 256 bytes):");
      lines.push("─".repeat(76));
      lines.push(...hexLines);
      lines.push("─".repeat(76));

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 5: bpcs_capacity ───

const bpcsCapacity: ToolDef = {
  name: "bpcs_capacity",
  description:
    "Estimate BPCS embedding capacity. Counts the number of complex blocks at various thresholds across all bit planes and channels, then calculates the maximum data that could be hidden using BPCS. Reports capacity in bits, bytes, and as a percentage of the image size.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for capacity estimation"),
    threshold: z.number().optional().describe("Complexity threshold (0.0-1.0, default: 0.3)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const threshold = (args.threshold as number | undefined) ?? 0.3;

      const buf = await readFileInput(filePath);
      const { width, height, data: pixels } = await loadPixels(filePath);

      const channelNames = ["Red", "Green", "Blue"];
      const bitsPerBlock = BPCS_BLOCK * BPCS_BLOCK; // 64 bits per 8x8 block

      const channelCapacities: Array<{
        channel: string;
        planes: Array<{
          plane: number;
          complexBlocks: number;
          totalBlocks: number;
          capacityBits: number;
        }>;
        totalCapacityBits: number;
      }> = [];

      let grandTotalCapacity = 0;
      let grandTotalBlocks = 0;
      let grandComplexBlocks = 0;

      for (let ch = 0; ch < 3; ch++) {
        const planes: Array<{
          plane: number;
          complexBlocks: number;
          totalBlocks: number;
          capacityBits: number;
        }> = [];

        let channelTotal = 0;

        for (let plane = 0; plane < 8; plane++) {
          const map = computeComplexityMap(pixels, width, height, ch, plane, threshold);
          const capacityBits = map.complexCount * bitsPerBlock;
          const totalBlocks = map.complexCount + map.simpleCount;

          planes.push({
            plane,
            complexBlocks: map.complexCount,
            totalBlocks,
            capacityBits,
          });

          channelTotal += capacityBits;
          grandTotalBlocks += totalBlocks;
          grandComplexBlocks += map.complexCount;
        }

        grandTotalCapacity += channelTotal;

        channelCapacities.push({
          channel: channelNames[ch],
          planes,
          totalCapacityBits: channelTotal,
        });
      }

      const grandTotalBytes = Math.floor(grandTotalCapacity / 8);
      const imageRawSize = width * height * 3; // 3 channels, 8 bits each
      const capacityPercentage = imageRawSize > 0 ? (grandTotalBytes / imageRawSize) * 100 : 0;
      const complexRatio = grandTotalBlocks > 0 ? grandComplexBlocks / grandTotalBlocks : 0;

      // Effective capacity (subtracting conjugation map overhead — roughly 1 bit per block)
      const overheadBits = grandComplexBlocks; // 1 conjugation map bit per complex block
      const effectiveCapacityBits = grandTotalCapacity - overheadBits;
      const effectiveCapacityBytes = Math.floor(Math.max(0, effectiveCapacityBits) / 8);

      const lines: string[] = [
        `BPCS Embedding Capacity Estimation: ${filePath}`,
        `Image: ${width}x${height}`,
        `File size: ${formatSize(buf.length)}`,
        `Block size: ${BPCS_BLOCK}x${BPCS_BLOCK} (${bitsPerBlock} bits/block)`,
        `Threshold: ${threshold}`,
        "",
        "Capacity Summary:",
        `  Total blocks analyzed: ${grandTotalBlocks.toLocaleString()}`,
        `  Complex blocks: ${grandComplexBlocks.toLocaleString()} (${(complexRatio * 100).toFixed(1)}%)`,
        `  Raw capacity: ${grandTotalCapacity.toLocaleString()} bits = ${grandTotalBytes.toLocaleString()} bytes (${formatSize(grandTotalBytes)})`,
        `  Effective capacity (minus conjugation map): ${effectiveCapacityBits.toLocaleString()} bits = ${effectiveCapacityBytes.toLocaleString()} bytes (${formatSize(effectiveCapacityBytes)})`,
        `  Capacity as % of raw image: ${capacityPercentage.toFixed(2)}%`,
        "",
        "Per-Channel Breakdown:",
        "─".repeat(90),
        `${"Channel".padEnd(10)} ${"Plane".padEnd(7)} ${"Complex".padEnd(10)} ${"Total".padEnd(10)} ${"Ratio".padEnd(8)} ${"Capacity".padEnd(15)} ${"Bar"}`,
        "─".repeat(90),
      ];

      for (const cc of channelCapacities) {
        for (const p of cc.planes) {
          const ratio = p.totalBlocks > 0 ? p.complexBlocks / p.totalBlocks : 0;
          const capacityStr = formatSize(Math.floor(p.capacityBits / 8));
          const bar = "█".repeat(Math.round(ratio * 20));
          lines.push(
            `${cc.channel.padEnd(10)} ` +
            `${String(p.plane).padEnd(7)} ` +
            `${p.complexBlocks.toString().padEnd(10)} ` +
            `${p.totalBlocks.toString().padEnd(10)} ` +
            `${(ratio * 100).toFixed(1).padStart(5)}%  ` +
            `${capacityStr.padEnd(15)} ` +
            `${bar}`,
          );
        }

        const channelBytes = Math.floor(cc.totalCapacityBits / 8);
        lines.push(`  ${cc.channel} total: ${formatSize(channelBytes)} (${cc.totalCapacityBits.toLocaleString()} bits)`);
        lines.push("");
      }

      lines.push("─".repeat(90));
      lines.push("");

      // Threshold comparison
      const thresholdComparison = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
      lines.push("Capacity at Different Thresholds (all channels, all planes):");
      lines.push("─".repeat(50));

      for (const t of thresholdComparison) {
        let totalCap = 0;
        for (let ch = 0; ch < 3; ch++) {
          for (let plane = 0; plane < 8; plane++) {
            const map = computeComplexityMap(pixels, width, height, ch, plane, t);
            totalCap += map.complexCount * bitsPerBlock;
          }
        }
        const capBytes = Math.floor(totalCap / 8);
        const marker = Math.abs(t - threshold) < 0.01 ? " <-- current" : "";
        lines.push(`  Threshold ${t.toFixed(1)}: ${formatSize(capBytes).padEnd(12)} (${totalCap.toLocaleString()} bits)${marker}`);
      }

      lines.push("─".repeat(50));
      lines.push("");
      lines.push("Note: BPCS capacity depends heavily on image content. Natural images with");
      lines.push("more texture/detail have higher capacity. The effective capacity is lower");
      lines.push("than raw capacity due to conjugation map overhead (~1 bit per block).");

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Export All Tools ───

export const bpcsTools: ToolDef[] = [
  bpcsDetect,
  bpcsComplexityMap,
  bpcsThreshold,
  bpcsExtract,
  bpcsCapacity,
];
