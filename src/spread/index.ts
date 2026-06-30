import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, detectImageFormat } from "../utils/binary.js";
import {
  shannonEntropy,
  discreteFourierTransform,
  autocorrelation,
  patchworkTest,
} from "../utils/stats.js";
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

/** Extract single-channel values from RGBA pixel buffer */
function extractChannel(
  pixels: Buffer,
  width: number,
  height: number,
  channel: number,
): number[] {
  const total = width * height;
  const values: number[] = [];
  for (let i = 0; i < total; i++) {
    values.push(pixels[i * 4 + channel]);
  }
  return values;
}

/** Extract luminance values from RGBA pixel buffer */
function extractLuminance(pixels: Buffer, width: number, height: number): number[] {
  const total = width * height;
  const values: number[] = [];
  for (let i = 0; i < total; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    values.push(Math.round(0.299 * r + 0.587 * g + 0.114 * b));
  }
  return values;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Tool 1: spread_dft_analysis ───

const spreadDftAnalysis: ToolDef = {
  name: "spread_dft_analysis",
  description:
    "DFT magnitude spectrum analysis for spread spectrum steganography detection. Computes the Discrete Fourier Transform of pixel values and analyzes the frequency spectrum for hidden signals, unusual peaks, or spectral flatness anomalies that indicate spread spectrum embedding.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for DFT analysis"),
    channel: z.number().optional().describe("Color channel to analyze: 0=R, 1=G, 2=B (default: 0)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);
      const values = extractChannel(pixels, width, height, channel);

      // Run DFT on pixel values (row-major scan line)
      const dftResult = discreteFourierTransform(values, 1.0);

      // Analyze magnitude spectrum
      const magnitudes = Array.from(dftResult.magnitudes);
      const totalMag = magnitudes.reduce((a, b) => a + b, 0);
      const avgMag = magnitudes.length > 0 ? totalMag / magnitudes.length : 0;
      const maxMag = magnitudes.length > 0 ? Math.max(...magnitudes) : 0;

      // Count peaks above threshold (significant spectral components)
      const peakThreshold = avgMag * 5;
      const significantPeaks = magnitudes.filter((m) => m > peakThreshold).length;

      // Spectral flatness: 1.0 = white noise (flat spectrum), 0.0 = tonal
      // Spread spectrum stego tends to make the spectrum flatter
      const { spectralFlatness, dominantFrequencies } = dftResult;

      // Analyze magnitude distribution
      const magEntropy = shannonEntropy(
        magnitudes.map((m) => Math.min(255, Math.floor((m / maxMag) * 255))),
      );

      // Compute energy in different frequency bands
      const halfN = magnitudes.length;
      const bandSize = Math.floor(halfN / 4);
      const bands: Array<{ name: string; energy: number; percentage: number }> = [];

      for (let b = 0; b < 4; b++) {
        const start = b * bandSize;
        const end = b === 3 ? halfN : (b + 1) * bandSize;
        let bandEnergy = 0;
        for (let i = start; i < end; i++) {
          bandEnergy += magnitudes[i] * magnitudes[i];
        }
        const bandNames = ["Low freq (DC-25%)", "Mid-low (25-50%)", "Mid-high (50-75%)", "High freq (75-100%)"];
        const totalEnergy = magnitudes.reduce((a, m) => a + m * m, 0);
        bands.push({
          name: bandNames[b],
          energy: bandEnergy,
          percentage: totalEnergy > 0 ? (bandEnergy / totalEnergy) * 100 : 0,
        });
      }

      // Scoring
      let ssScore = 0;
      const indicators: string[] = [];

      if (spectralFlatness > 0.7) {
        ssScore += 3;
        indicators.push(`High spectral flatness: ${spectralFlatness.toFixed(4)} (noise-like spectrum suggests spread spectrum)`);
      } else if (spectralFlatness > 0.4) {
        ssScore += 1;
        indicators.push(`Moderate spectral flatness: ${spectralFlatness.toFixed(4)}`);
      }

      if (significantPeaks > 20) {
        ssScore += 1;
        indicators.push(`Many significant spectral peaks: ${significantPeaks} (possible spread spectrum carrier)`);
      }

      // High-frequency energy ratio (spread spectrum boosts high freq)
      const highFreqRatio = bands[3]?.percentage ?? 0;
      if (highFreqRatio > 30) {
        ssScore += 2;
        indicators.push(`High-frequency energy ratio: ${highFreqRatio.toFixed(1)}% (elevated, possible embedding)`);
      }

      if (magEntropy > 6.0) {
        ssScore += 1;
        indicators.push(`High magnitude spectrum entropy: ${magEntropy.toFixed(4)} bits`);
      }

      const verdict =
        ssScore >= 5 ? "likely_spread_spectrum" :
        ssScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `DFT Magnitude Spectrum Analysis: ${filePath}`,
        `Image: ${width}x${height}`,
        `Channel: ${channelName}`,
        `DFT size (after downsampling): ${magnitudes.length} frequency bins`,
        "",
        "Spectral Statistics:",
        `  Spectral flatness: ${spectralFlatness.toFixed(6)}`,
        `  Average magnitude: ${avgMag.toFixed(2)}`,
        `  Max magnitude: ${maxMag.toFixed(2)}`,
        `  Significant peaks (>5x avg): ${significantPeaks}`,
        `  Magnitude entropy: ${magEntropy.toFixed(4)} bits`,
        "",
        "Frequency Band Energy Distribution:",
      ];

      for (const band of bands) {
        const bar = "█".repeat(Math.round(band.percentage / 2));
        lines.push(`  ${band.name.padEnd(25)} ${band.percentage.toFixed(1).padStart(6)}% ${bar}`);
      }

      lines.push("");
      lines.push("Top Dominant Frequencies:");

      for (let i = 0; i < Math.min(10, dominantFrequencies.length); i++) {
        const df = dominantFrequencies[i];
        lines.push(`  #${i + 1}: bin=${df.index}, magnitude=${df.magnitude.toFixed(2)}, freq=${df.frequency.toFixed(6)}`);
      }

      lines.push("");
      lines.push(`Spread Spectrum Score: ${ssScore}/7`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_spread_spectrum") {
        lines.push("  Frequency spectrum shows signatures of spread spectrum embedding.");
      } else if (verdict === "suspicious") {
        lines.push("  Some spectral anomalies detected. Further analysis recommended.");
      } else {
        lines.push("  Frequency spectrum appears natural. No spread spectrum indicators.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 2: spread_correlation ───

const spreadCorrelation: ToolDef = {
  name: "spread_correlation",
  description:
    "Autocorrelation-based steganography detection. Computes the autocorrelation of pixel values to find periodic embedding patterns. Spread spectrum and watermarking methods often introduce periodic signals that appear as peaks in the autocorrelation function.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for autocorrelation analysis"),
    channel: z.number().optional().describe("Color channel to analyze: 0=R, 1=G, 2=B (default: 0)"),
    max_lag: z.number().optional().describe("Maximum lag to compute (default: 512)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const maxLag = (args.max_lag as number | undefined) ?? 512;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);
      const values = extractChannel(pixels, width, height, channel);

      // Compute autocorrelation
      const acResult = autocorrelation(values, maxLag);

      // Analyze peaks
      const peaks = acResult.peaks;
      const hasPeriodicity = acResult.isperiodic;
      const period = acResult.periodicity;

      // Compute summary statistics of autocorrelation values
      const acValues = Array.from(acResult.values);
      const acAbsMean = acValues.reduce((a, v) => a + Math.abs(v), 0) / acValues.length;

      // Check for unexpected peaks (not at multiples of image width)
      const unexpectedPeaks = peaks.filter((p) => {
        // Peaks at multiples of width are natural (row repetition)
        return p.lag % width !== 0;
      });

      // Scoring
      let corrScore = 0;
      const indicators: string[] = [];

      if (hasPeriodicity && period !== null && period !== width) {
        corrScore += 3;
        indicators.push(`Periodic signal detected with period ${period} (not matching image width ${width})`);
      }

      if (unexpectedPeaks.length > 3) {
        corrScore += 2;
        indicators.push(`${unexpectedPeaks.length} unexpected autocorrelation peaks found`);
      } else if (unexpectedPeaks.length > 0) {
        corrScore += 1;
        indicators.push(`${unexpectedPeaks.length} unexpected peak(s) at non-width-multiple lags`);
      }

      if (acAbsMean > 0.1) {
        corrScore += 1;
        indicators.push(`High average autocorrelation: ${acAbsMean.toFixed(4)} (strong overall correlation)`);
      }

      const verdict =
        corrScore >= 4 ? "likely_periodic_embedding" :
        corrScore >= 2 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `Autocorrelation Analysis: ${filePath}`,
        `Image: ${width}x${height}`,
        `Channel: ${channelName}`,
        `Max lag: ${maxLag}`,
        `Total values analyzed: ${values.length.toLocaleString()}`,
        "",
        "Autocorrelation Summary:",
        `  Peaks found (value > 0.3): ${peaks.length}`,
        `  Unexpected peaks (non-width lags): ${unexpectedPeaks.length}`,
        `  Periodicity detected: ${hasPeriodicity ? "YES" : "no"}`,
        `  Period: ${period !== null ? period : "none"}`,
        `  Average |autocorrelation|: ${acAbsMean.toFixed(6)}`,
        "",
      ];

      if (peaks.length > 0) {
        lines.push("Autocorrelation Peaks:");
        lines.push("─".repeat(50));
        for (const peak of peaks.slice(0, 20)) {
          const widthMultiple = peak.lag % width === 0 ? " (width multiple)" : " [unexpected]";
          lines.push(`  Lag ${peak.lag}: value=${peak.value.toFixed(4)}${widthMultiple}`);
        }
        if (peaks.length > 20) {
          lines.push(`  ... and ${peaks.length - 20} more peaks`);
        }
        lines.push("");
      }

      // ASCII plot of first portion of autocorrelation
      lines.push("Autocorrelation Function (first 40 lags):");
      const plotLags = Math.min(40, acValues.length);
      for (let i = 1; i < plotLags; i++) {
        const val = acValues[i];
        const barLen = Math.round(Math.abs(val) * 30);
        const bar = val >= 0 ? "█".repeat(barLen) : "░".repeat(barLen);
        const sign = val >= 0 ? "+" : "-";
        lines.push(`  ${String(i).padStart(4)} |${sign}${bar} ${val.toFixed(4)}`);
      }

      lines.push("");
      lines.push(`Correlation Score: ${corrScore}/6`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_periodic_embedding") {
        lines.push("  Strong periodic patterns detected that are inconsistent with natural image content.");
      } else if (verdict === "suspicious") {
        lines.push("  Some correlation anomalies present. May indicate periodic embedding.");
      } else {
        lines.push("  Autocorrelation appears natural. No periodic embedding patterns detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 3: spread_watermark_detect ───

const spreadWatermarkDetect: ToolDef = {
  name: "spread_watermark_detect",
  description:
    "Statistical watermark detection via variance comparison between image regions. Divides the image into blocks and compares pixel variance across regions. Watermarked regions tend to have altered variance patterns compared to natural image content, revealing the presence of additive watermarks.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for watermark detection"),
    block_size: z.number().optional().describe("Block size for region analysis (default: 32)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const blockSize = (args.block_size as number | undefined) ?? 32;

      const { width, height, data: pixels } = await loadPixels(filePath);
      const luminance = extractLuminance(pixels, width, height);

      const blocksX = Math.floor(width / blockSize);
      const blocksY = Math.floor(height / blockSize);
      const totalBlocks = blocksX * blocksY;

      if (totalBlocks < 4) {
        return text("Error: Image too small for block-based watermark analysis with the specified block size.");
      }

      // Compute variance for each block
      const blockVariances: number[] = [];
      const blockMeans: number[] = [];

      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          let sum = 0;
          let count = 0;

          for (let dy = 0; dy < blockSize; dy++) {
            for (let dx = 0; dx < blockSize; dx++) {
              const x = bx * blockSize + dx;
              const y = by * blockSize + dy;
              sum += luminance[y * width + x];
              count++;
            }
          }

          const mean = sum / count;
          let variance = 0;
          for (let dy = 0; dy < blockSize; dy++) {
            for (let dx = 0; dx < blockSize; dx++) {
              const x = bx * blockSize + dx;
              const y = by * blockSize + dy;
              const diff = luminance[y * width + x] - mean;
              variance += diff * diff;
            }
          }
          variance /= count;

          blockVariances.push(variance);
          blockMeans.push(mean);
        }
      }

      // Analyze variance distribution
      const avgVariance = blockVariances.reduce((a, b) => a + b, 0) / blockVariances.length;
      const varianceOfVariances = blockVariances.reduce(
        (a, v) => a + Math.pow(v - avgVariance, 2), 0,
      ) / blockVariances.length;
      const stdDevOfVariances = Math.sqrt(varianceOfVariances);

      // Coefficient of variation of block variances
      const cvVariance = avgVariance > 0 ? stdDevOfVariances / avgVariance : 0;

      // Count outlier blocks (variance significantly different from neighbors)
      let outlierBlocks = 0;
      for (let by = 1; by < blocksY - 1; by++) {
        for (let bx = 1; bx < blocksX - 1; bx++) {
          const idx = by * blocksX + bx;
          const neighbors = [
            blockVariances[(by - 1) * blocksX + bx],
            blockVariances[(by + 1) * blocksX + bx],
            blockVariances[by * blocksX + bx - 1],
            blockVariances[by * blocksX + bx + 1],
          ];
          const neighborAvg = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
          if (neighborAvg > 0 && Math.abs(blockVariances[idx] - neighborAvg) / neighborAvg > 0.5) {
            outlierBlocks++;
          }
        }
      }

      // Compare even/odd block variance groups (checkerboard pattern)
      let evenVarianceSum = 0;
      let oddVarianceSum = 0;
      let evenCount = 0;
      let oddCount = 0;

      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          const idx = by * blocksX + bx;
          if ((bx + by) % 2 === 0) {
            evenVarianceSum += blockVariances[idx];
            evenCount++;
          } else {
            oddVarianceSum += blockVariances[idx];
            oddCount++;
          }
        }
      }

      const evenAvg = evenCount > 0 ? evenVarianceSum / evenCount : 0;
      const oddAvg = oddCount > 0 ? oddVarianceSum / oddCount : 0;
      const checkerDiff = Math.abs(evenAvg - oddAvg);
      const checkerRatio = Math.max(evenAvg, oddAvg) > 0
        ? checkerDiff / Math.max(evenAvg, oddAvg)
        : 0;

      // Scoring
      let wmScore = 0;
      const indicators: string[] = [];

      if (cvVariance < 0.3 && totalBlocks > 16) {
        wmScore += 2;
        indicators.push(`Low coefficient of variation in block variances: ${cvVariance.toFixed(4)} (unnaturally uniform)`);
      }

      const outlierPercentage = (outlierBlocks / totalBlocks) * 100;
      if (outlierPercentage > 20) {
        wmScore += 2;
        indicators.push(`High percentage of outlier blocks: ${outlierPercentage.toFixed(1)}% (${outlierBlocks}/${totalBlocks})`);
      }

      if (checkerRatio > 0.1) {
        wmScore += 2;
        indicators.push(`Checkerboard pattern detected: even/odd variance ratio difference=${checkerRatio.toFixed(4)}`);
      }

      // Uniformity of variance across spatial regions
      // Split into quadrants
      const quadrantVariances: number[] = [];
      const halfBX = Math.floor(blocksX / 2);
      const halfBY = Math.floor(blocksY / 2);

      for (const [qy, qx] of [[0, 0], [0, halfBX], [halfBY, 0], [halfBY, halfBX]]) {
        let qSum = 0;
        let qCount = 0;
        for (let by = qy; by < qy + halfBY && by < blocksY; by++) {
          for (let bx = qx; bx < qx + halfBX && bx < blocksX; bx++) {
            qSum += blockVariances[by * blocksX + bx];
            qCount++;
          }
        }
        if (qCount > 0) quadrantVariances.push(qSum / qCount);
      }

      if (quadrantVariances.length === 4) {
        const qAvg = quadrantVariances.reduce((a, b) => a + b, 0) / 4;
        const qMaxDiff = Math.max(...quadrantVariances) - Math.min(...quadrantVariances);
        const qNormDiff = qAvg > 0 ? qMaxDiff / qAvg : 0;

        if (qNormDiff > 0.3) {
          wmScore += 1;
          indicators.push(`Large quadrant variance spread: ${qNormDiff.toFixed(4)}`);
        }
      }

      const verdict =
        wmScore >= 5 ? "likely_watermarked" :
        wmScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `Statistical Watermark Detection: ${filePath}`,
        `Image: ${width}x${height}`,
        `Block size: ${blockSize}x${blockSize}`,
        `Blocks analyzed: ${totalBlocks} (${blocksX}x${blocksY} grid)`,
        "",
        "Block Variance Statistics:",
        `  Average variance: ${avgVariance.toFixed(2)}`,
        `  Std dev of variances: ${stdDevOfVariances.toFixed(2)}`,
        `  Coefficient of variation: ${cvVariance.toFixed(4)}`,
        `  Outlier blocks: ${outlierBlocks}/${totalBlocks} (${outlierPercentage.toFixed(1)}%)`,
        "",
        "Checkerboard Pattern Test:",
        `  Even block avg variance: ${evenAvg.toFixed(2)}`,
        `  Odd block avg variance: ${oddAvg.toFixed(2)}`,
        `  Difference: ${checkerDiff.toFixed(2)}`,
        `  Normalized ratio: ${checkerRatio.toFixed(4)}`,
        "",
        "Quadrant Analysis:",
      ];

      const quadrantNames = ["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"];
      for (let i = 0; i < quadrantVariances.length; i++) {
        lines.push(`  ${quadrantNames[i]}: avg variance = ${quadrantVariances[i].toFixed(2)}`);
      }

      lines.push("");
      lines.push(`Watermark Score: ${wmScore}/7`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_watermarked") {
        lines.push("  Block variance patterns suggest the presence of an additive watermark.");
      } else if (verdict === "suspicious") {
        lines.push("  Some variance anomalies detected. May indicate watermarking.");
      } else {
        lines.push("  Block variances appear natural. No watermark indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 4: spread_noise_analysis ───

const spreadNoiseAnalysis: ToolDef = {
  name: "spread_noise_analysis",
  description:
    "Noise floor embedding detection. Compares noise levels across image regions to detect spread spectrum or additive noise-based steganography. Embedded data adds noise to cover pixels, and uneven noise distribution between smooth and textured regions can reveal hidden content.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for noise analysis"),
    block_size: z.number().optional().describe("Block size for noise estimation (default: 16)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const blockSize = (args.block_size as number | undefined) ?? 16;

      const { width, height, data: pixels } = await loadPixels(filePath);

      const blocksX = Math.floor(width / blockSize);
      const blocksY = Math.floor(height / blockSize);

      if (blocksX < 2 || blocksY < 2) {
        return text("Error: Image too small for noise analysis with the specified block size.");
      }

      // Estimate noise per block using the Laplacian operator
      // For each block, compute the sum of absolute Laplacian values as a noise indicator
      const blockNoises: number[] = [];
      const blockGradients: number[] = []; // average gradient magnitude

      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          let laplacianSum = 0;
          let gradientSum = 0;
          let samples = 0;

          for (let dy = 1; dy < blockSize - 1; dy++) {
            for (let dx = 1; dx < blockSize - 1; dx++) {
              const x = bx * blockSize + dx;
              const y = by * blockSize + dy;
              const idx = (y * width + x) * 4;

              // Use luminance
              const getL = (px: number, py: number) => {
                const i = (py * width + px) * 4;
                return 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
              };

              const center = getL(x, y);
              const top = getL(x, y - 1);
              const bottom = getL(x, y + 1);
              const left = getL(x - 1, y);
              const right = getL(x + 1, y);

              // Laplacian = sum of neighbors - 4 * center
              const laplacian = Math.abs(top + bottom + left + right - 4 * center);
              laplacianSum += laplacian;

              // Gradient magnitude (Sobel approximation)
              const gx = Math.abs(right - left);
              const gy = Math.abs(bottom - top);
              gradientSum += Math.sqrt(gx * gx + gy * gy);

              samples++;
            }
          }

          const avgNoise = samples > 0 ? laplacianSum / samples : 0;
          const avgGradient = samples > 0 ? gradientSum / samples : 0;
          blockNoises.push(avgNoise);
          blockGradients.push(avgGradient);
        }
      }

      // Classify blocks as smooth or textured based on gradient
      const avgGradient = blockGradients.reduce((a, b) => a + b, 0) / blockGradients.length;
      const smoothThreshold = avgGradient * 0.5;

      let smoothNoise = 0;
      let smoothCount = 0;
      let texturedNoise = 0;
      let texturedCount = 0;

      for (let i = 0; i < blockNoises.length; i++) {
        if (blockGradients[i] < smoothThreshold) {
          smoothNoise += blockNoises[i];
          smoothCount++;
        } else {
          texturedNoise += blockNoises[i];
          texturedCount++;
        }
      }

      const avgSmoothNoise = smoothCount > 0 ? smoothNoise / smoothCount : 0;
      const avgTexturedNoise = texturedCount > 0 ? texturedNoise / texturedCount : 0;

      // In natural images, smooth regions have much lower noise than textured regions
      // Spread spectrum embedding raises noise uniformly, reducing this ratio
      const noiseRatio = avgTexturedNoise > 0 ? avgSmoothNoise / avgTexturedNoise : 0;

      // Overall noise statistics
      const avgNoise = blockNoises.reduce((a, b) => a + b, 0) / blockNoises.length;
      const noiseStdDev = Math.sqrt(
        blockNoises.reduce((a, n) => a + Math.pow(n - avgNoise, 2), 0) / blockNoises.length,
      );
      const noiseCv = avgNoise > 0 ? noiseStdDev / avgNoise : 0;

      // Noise entropy
      const quantizedNoise = blockNoises.map((n) => Math.min(255, Math.floor(n)));
      const noiseEntropy = shannonEntropy(quantizedNoise);

      // Scoring
      let noiseScore = 0;
      const indicators: string[] = [];

      if (noiseRatio > 0.7 && smoothCount > 5) {
        noiseScore += 3;
        indicators.push(`High smooth/textured noise ratio: ${noiseRatio.toFixed(4)} (smooth regions have elevated noise)`);
      } else if (noiseRatio > 0.5 && smoothCount > 5) {
        noiseScore += 1;
        indicators.push(`Moderate smooth/textured noise ratio: ${noiseRatio.toFixed(4)}`);
      }

      if (noiseCv < 0.3 && blockNoises.length > 16) {
        noiseScore += 2;
        indicators.push(`Low noise coefficient of variation: ${noiseCv.toFixed(4)} (unnaturally uniform noise floor)`);
      }

      if (avgSmoothNoise > 5.0 && smoothCount > 5) {
        noiseScore += 1;
        indicators.push(`Elevated noise in smooth regions: ${avgSmoothNoise.toFixed(2)} (expected < 5.0 for natural images)`);
      }

      if (noiseEntropy > 5.0) {
        noiseScore += 1;
        indicators.push(`High noise entropy: ${noiseEntropy.toFixed(4)} bits`);
      }

      const verdict =
        noiseScore >= 5 ? "likely_noise_embedding" :
        noiseScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `Noise Floor Embedding Detection: ${filePath}`,
        `Image: ${width}x${height}`,
        `Block size: ${blockSize}x${blockSize}`,
        `Total blocks: ${blockNoises.length} (${blocksX}x${blocksY})`,
        "",
        "Block Classification:",
        `  Smooth blocks: ${smoothCount}`,
        `  Textured blocks: ${texturedCount}`,
        `  Gradient threshold: ${smoothThreshold.toFixed(2)}`,
        "",
        "Noise Statistics:",
        `  Overall avg noise (Laplacian): ${avgNoise.toFixed(2)}`,
        `  Noise std deviation: ${noiseStdDev.toFixed(2)}`,
        `  Noise CV: ${noiseCv.toFixed(4)}`,
        `  Noise entropy: ${noiseEntropy.toFixed(4)} bits`,
        "",
        "Smooth vs Textured Comparison:",
        `  Avg smooth region noise: ${avgSmoothNoise.toFixed(2)}`,
        `  Avg textured region noise: ${avgTexturedNoise.toFixed(2)}`,
        `  Smooth/textured ratio: ${noiseRatio.toFixed(4)}`,
        `  (Ratio > 0.7 with many smooth blocks suggests additive noise embedding)`,
        "",
        `Noise Score: ${noiseScore}/7`,
        "",
      ];

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_noise_embedding") {
        lines.push("  Noise distribution is inconsistent with natural images. Suggests additive noise or spread spectrum embedding.");
      } else if (verdict === "suspicious") {
        lines.push("  Some noise anomalies detected. May indicate spread spectrum or additive embedding.");
      } else {
        lines.push("  Noise distribution appears natural. No embedding indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 5: spread_patchwork ───

const spreadPatchwork: ToolDef = {
  name: "spread_patchwork",
  description:
    "Patchwork watermark detection using the patchwork statistical test. Splits pixel values into two pseudo-random groups and tests whether the mean difference between groups is statistically significant. A significant difference indicates a patchwork watermark was embedded by adding/subtracting a small value from selected pixels.",
  schema: {
    file_path: z.string().describe("Path to image file (PNG or JPEG) for patchwork detection"),
    channel: z.number().optional().describe("Color channel to test: 0=R, 1=G, 2=B (default: 0)"),
    seed: z.number().optional().describe("PRNG seed for group splitting (default: 42)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const channel = (args.channel as number | undefined) ?? 0;
      const seed = (args.seed as number | undefined) ?? 42;
      const channelNames = ["Red", "Green", "Blue"];
      const channelName = channelNames[channel] ?? `Channel ${channel}`;

      const { width, height, data: pixels } = await loadPixels(filePath);
      const values = extractChannel(pixels, width, height, channel);

      // Run patchwork test with default seed
      const result = patchworkTest(values, seed);

      // Run with multiple seeds to check for different watermark keys
      const additionalSeeds = [1, 7, 13, 31, 67, 97, 127, 251, 1024, 65537];
      const multiSeedResults: Array<{ seed: number; statistic: number; normalizedStatistic: number; pValue: number; detected: boolean }> = [];

      for (const s of additionalSeeds) {
        const r = patchworkTest(values, s);
        multiSeedResults.push({ seed: s, ...r });
      }

      const detectedSeeds = multiSeedResults.filter((r) => r.detected);

      // Overall statistics
      const overallMean = values.reduce((a, b) => a + b, 0) / values.length;
      const overallVariance = values.reduce((a, v) => a + Math.pow(v - overallMean, 2), 0) / values.length;

      // Scoring
      let patchScore = 0;
      const indicators: string[] = [];

      if (result.detected) {
        patchScore += 3;
        indicators.push(`Patchwork test DETECTED with seed ${seed}: z=${result.normalizedStatistic.toFixed(4)}, p=${result.pValue.toFixed(6)}`);
      }

      if (detectedSeeds.length > 0) {
        patchScore += 2;
        indicators.push(`Patchwork detected with ${detectedSeeds.length}/${additionalSeeds.length} additional seed(s)`);
      }

      if (Math.abs(result.normalizedStatistic) > 2.0 && !result.detected) {
        patchScore += 1;
        indicators.push(`Elevated z-statistic: ${result.normalizedStatistic.toFixed(4)} (borderline significance)`);
      }

      const verdict =
        patchScore >= 4 ? "likely_patchwork_watermark" :
        patchScore >= 2 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `Patchwork Watermark Detection: ${filePath}`,
        `Image: ${width}x${height} (${values.length.toLocaleString()} pixels)`,
        `Channel: ${channelName}`,
        "",
        "Pixel Statistics:",
        `  Mean: ${overallMean.toFixed(2)}`,
        `  Variance: ${overallVariance.toFixed(2)}`,
        `  Std dev: ${Math.sqrt(overallVariance).toFixed(2)}`,
        "",
        `Primary Patchwork Test (seed=${seed}):`,
        `  Group mean difference (statistic): ${result.statistic.toFixed(6)}`,
        `  Normalized z-statistic: ${result.normalizedStatistic.toFixed(4)}`,
        `  p-value: ${result.pValue.toFixed(6)}`,
        `  Detected (p < 0.01): ${result.detected ? "YES" : "no"}`,
        "",
        "Multi-Seed Analysis:",
        "─".repeat(70),
        `${"Seed".padEnd(10)} ${"Statistic".padEnd(14)} ${"Z-score".padEnd(12)} ${"p-value".padEnd(14)} ${"Detected"}`,
        "─".repeat(70),
      ];

      for (const r of multiSeedResults) {
        lines.push(
          `${String(r.seed).padEnd(10)} ` +
          `${r.statistic.toFixed(6).padEnd(14)} ` +
          `${r.normalizedStatistic.toFixed(4).padEnd(12)} ` +
          `${r.pValue.toFixed(6).padEnd(14)} ` +
          `${r.detected ? "YES" : "no"}`,
        );
      }

      lines.push("─".repeat(70));
      lines.push(`  Seeds with detection: ${detectedSeeds.length}/${additionalSeeds.length}`);
      lines.push("");

      lines.push(`Patchwork Score: ${patchScore}/6`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_patchwork_watermark") {
        lines.push("  Statistically significant patchwork watermark signatures detected.");
        lines.push("  Pixel values show systematic group-based modification.");
      } else if (verdict === "suspicious") {
        lines.push("  Some patchwork-like patterns present. May indicate a weak watermark or coincidental distribution.");
      } else {
        lines.push("  No patchwork watermark detected. Pixel group means are statistically equal.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Export All Tools ───

export const spreadTools: ToolDef[] = [
  spreadDftAnalysis,
  spreadCorrelation,
  spreadWatermarkDetect,
  spreadNoiseAnalysis,
  spreadPatchwork,
];
