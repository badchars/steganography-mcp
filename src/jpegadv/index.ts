import { z } from "zod";
import type { ToolDef, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, detectImageFormat, hexDump } from "../utils/binary.js";
import { shannonEntropy, chiSquareTest, histogram, blockEntropy } from "../utils/stats.js";
import {
  parseJpegMarkers,
  extractDctCoefficients,
  extractComments,
  extractQuantizationTables,
  analyzeSosEntropy,
  getJpegPixels,
} from "../utils/jpeg-parser.js";
import * as jpeg from "jpeg-js";

// ─── Helpers ───

function ensureJpeg(buf: Buffer, filePath: string): void {
  const fmt = detectImageFormat(buf);
  if (fmt !== "jpeg") {
    throw new Error(`Not a JPEG file (detected: ${fmt}). Path: ${filePath}`);
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Build a histogram of values in a given range [min, max].
 * Returns an array of size (max - min + 1) with counts.
 */
function rangeHistogram(values: number[], min: number, max: number): number[] {
  const size = max - min + 1;
  const hist = new Array(size).fill(0) as number[];
  for (const v of values) {
    const idx = v - min;
    if (idx >= 0 && idx < size) {
      hist[idx]++;
    }
  }
  return hist;
}

// ─── Tool 1: jpegadv_f5_detect ───

const jpegadvF5Detect: ToolDef = {
  name: "jpegadv_f5_detect",
  description:
    "F5 steganography detection. F5 embeds data by decrementing the absolute values of DCT " +
    "coefficients toward zero (shrinkage). Detects the characteristic excess of zeros relative " +
    "to near-zero coefficients and the histogram dip at +/-1 that F5 matrix embedding produces.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file to analyze for F5 steganography"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const { coefficients, quantTables } = extractDctCoefficients(buf);

      if (coefficients.length === 0) {
        return text("Error: No DCT coefficient data found in JPEG (missing SOS segment).");
      }

      // Build coefficient histogram in range [-128, 127]
      const hist = rangeHistogram(coefficients, -128, 127);
      const zeroIdx = 128; // index of value 0 in the histogram

      // F5 signature 1: Zero coefficient count is abnormally high
      // F5 decrements |coeff|, causing +-1 values to become 0 (shrinkage)
      const zeroCount = hist[zeroIdx];
      const totalCoeffs = coefficients.length;
      const zeroPercentage = (zeroCount / totalCoeffs) * 100;

      // F5 signature 2: Asymmetry around zero
      // F5 only decrements absolute values, so positive values shift toward 0 disproportionately
      let positiveSum = 0;
      let negativeSum = 0;
      let positiveCount = 0;
      let negativeCount = 0;

      for (let i = 0; i < 128; i++) {
        negativeSum += hist[i] * (128 - i);
        negativeCount += hist[i];
      }
      for (let i = 129; i < 256; i++) {
        positiveSum += hist[i] * (i - 128);
        positiveCount += hist[i];
      }

      const positiveMean = positiveCount > 0 ? positiveSum / positiveCount : 0;
      const negativeMean = negativeCount > 0 ? negativeSum / negativeCount : 0;
      const asymmetry = Math.abs(positiveMean - negativeMean);

      // F5 signature 3: Histogram shrinkage at +-1
      // In clean JPEG: count(+-1) > count(+-2) (natural Laplacian distribution)
      // After F5: count(+-1) < count(+-2) because +-1 values are moved to 0
      const countMinus1 = hist[zeroIdx - 1];
      const countPlus1 = hist[zeroIdx + 1];
      const countMinus2 = hist[zeroIdx - 2];
      const countPlus2 = hist[zeroIdx + 2];

      const plus1Shrinkage = countPlus2 > 0 ? countPlus1 / countPlus2 : 0;
      const minus1Shrinkage = countMinus2 > 0 ? countMinus1 / countMinus2 : 0;

      // F5 signature 4: SOS entropy analysis
      const markers = parseJpegMarkers(buf);
      const sosEntropy = analyzeSosEntropy(markers);

      // Scoring
      let f5Score = 0;
      const indicators: string[] = [];

      if (zeroPercentage > 40) {
        f5Score += 2;
        indicators.push(`High zero coefficient ratio: ${zeroPercentage.toFixed(1)}% (threshold: 40%)`);
      } else if (zeroPercentage > 30) {
        f5Score += 1;
        indicators.push(`Elevated zero coefficient ratio: ${zeroPercentage.toFixed(1)}%`);
      }

      if (plus1Shrinkage < 0.8 && countPlus2 > 10) {
        f5Score += 2;
        indicators.push(
          `Histogram shrinkage at +1: ratio=${plus1Shrinkage.toFixed(3)} ` +
          `(count[+1]=${countPlus1}, count[+2]=${countPlus2})`,
        );
      }

      if (minus1Shrinkage < 0.8 && countMinus2 > 10) {
        f5Score += 2;
        indicators.push(
          `Histogram shrinkage at -1: ratio=${minus1Shrinkage.toFixed(3)} ` +
          `(count[-1]=${countMinus1}, count[-2]=${countMinus2})`,
        );
      }

      if (asymmetry > 5) {
        f5Score += 1;
        indicators.push(`Asymmetric distribution around zero: delta=${asymmetry.toFixed(2)}`);
      }

      if (sosEntropy.entropy < 6.5) {
        f5Score += 1;
        indicators.push(`Low SOS entropy: ${sosEntropy.entropy.toFixed(4)} bits`);
      }

      const verdict =
        f5Score >= 5 ? "likely_f5_stego" :
        f5Score >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `F5 Steganography Detection: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Total approximate coefficients: ${totalCoeffs.toLocaleString()}`,
        `Quantization tables: ${quantTables.length}`,
        "",
        "DCT Coefficient Distribution:",
        `  Zero count: ${zeroCount.toLocaleString()} (${zeroPercentage.toFixed(2)}%)`,
        `  Positive coefficients: ${positiveCount.toLocaleString()} (mean magnitude: ${positiveMean.toFixed(2)})`,
        `  Negative coefficients: ${negativeCount.toLocaleString()} (mean magnitude: ${negativeMean.toFixed(2)})`,
        `  Asymmetry (|pos_mean - neg_mean|): ${asymmetry.toFixed(2)}`,
        "",
        "Histogram Shrinkage Analysis:",
        `  count[+1]=${countPlus1}, count[+2]=${countPlus2}, ratio=${plus1Shrinkage.toFixed(3)}`,
        `  count[-1]=${countMinus1}, count[-2]=${countMinus2}, ratio=${minus1Shrinkage.toFixed(3)}`,
        `  (ratio < 0.8 indicates F5 shrinkage at +-1 values)`,
        "",
        "SOS Entropy:",
        `  Entropy: ${sosEntropy.entropy.toFixed(4)} bits`,
        `  Zero-byte %: ${sosEntropy.zeroBytePercentage.toFixed(2)}%`,
        "",
        `F5 Score: ${f5Score}/8`,
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
      if (verdict === "likely_f5_stego") {
        lines.push("  F5 matrix embedding signatures detected. The image likely contains F5-embedded data.");
      } else if (verdict === "suspicious") {
        lines.push("  Some F5-like signatures present. Further analysis recommended.");
      } else {
        lines.push("  No significant F5 steganography indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 2: jpegadv_jsteg_detect ───

const jpegadvJstegDetect: ToolDef = {
  name: "jpegadv_jsteg_detect",
  description:
    "JSteg steganography detection. JSteg replaces the LSB of non-zero, non-one DCT " +
    "coefficients. Uses chi-square test on coefficient value pairs (2k, 2k+1) to detect " +
    "the equalization that JSteg embedding produces. Includes sliding window analysis on " +
    "sequential AC coefficients.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file to analyze for JSteg steganography"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const { coefficients } = extractDctCoefficients(buf);

      if (coefficients.length === 0) {
        return text("Error: No DCT coefficient data found in JPEG (missing SOS segment).");
      }

      const hist = rangeHistogram(coefficients, -128, 127);

      // JSteg signature 1: Non-zero, non-one AC coefficient LSB balance
      // JSteg replaces LSBs, so even/odd counts in eligible coefficients become ~equal
      let nonZeroCount = 0;
      let nonZeroEven = 0;
      let nonZeroOdd = 0;
      const nonZeroValues: number[] = [];

      for (const c of coefficients) {
        if (c !== 0 && c !== 1 && c !== -1) {
          nonZeroCount++;
          nonZeroValues.push(c);
          if (Math.abs(c) % 2 === 0) {
            nonZeroEven++;
          } else {
            nonZeroOdd++;
          }
        }
      }

      const evenOddRatio = nonZeroCount > 0
        ? Math.min(nonZeroEven, nonZeroOdd) / Math.max(nonZeroEven, nonZeroOdd)
        : 0;

      // JSteg signature 2: Chi-square test on coefficient value pairs (2k, 2k+1)
      // Skip 0 and +-1 (JSteg preserves these)
      const pairObserved: number[] = [];
      const pairExpected: number[] = [];

      for (let v = -128; v <= 126; v += 2) {
        if (v === 0 || v === -1) continue;
        const idx1 = v + 128;
        const idx2 = v + 1 + 128;
        const total = hist[idx1] + hist[idx2];
        if (total > 4) {
          pairObserved.push(hist[idx1]);
          pairExpected.push(total / 2);
          pairObserved.push(hist[idx2]);
          pairExpected.push(total / 2);
        }
      }

      const chiResult = chiSquareTest(pairObserved, pairExpected);

      // Lower chi-square = more equalized pairs = more likely JSteg
      const normalizedChi = chiResult.degreesOfFreedom > 0
        ? chiResult.chiSquare / chiResult.degreesOfFreedom
        : 0;

      // JSteg signature 3: Coefficient distribution around zero preserved
      const zeroIdx = 128;
      const zeroCount = hist[zeroIdx];
      const oneCount = hist[zeroIdx + 1];
      const minusOneCount = hist[zeroIdx - 1];

      // JSteg signature 4: LSB entropy of non-zero coefficients
      const lsbValues = nonZeroValues.map((v) => Math.abs(v) & 1);
      const lsbEntropy = lsbValues.length > 0 ? shannonEntropy(lsbValues) : 0;

      // Sliding window chi-square on sequential coefficients
      const windowSize = Math.min(1024, Math.floor(nonZeroValues.length / 4));
      const windowResults: Array<{ offset: number; pValue: number }> = [];
      if (windowSize >= 64) {
        const step = Math.max(windowSize, 1);
        for (let start = 0; start + windowSize <= nonZeroValues.length; start += step) {
          const window = nonZeroValues.slice(start, start + windowSize);
          const wHist = rangeHistogram(window, -128, 127);
          const wObs: number[] = [];
          const wExp: number[] = [];
          for (let v = -128; v <= 126; v += 2) {
            if (v === 0 || v === -1) continue;
            const i1 = v + 128;
            const i2 = v + 1 + 128;
            const t = wHist[i1] + wHist[i2];
            if (t > 2) {
              wObs.push(wHist[i1]);
              wExp.push(t / 2);
              wObs.push(wHist[i2]);
              wExp.push(t / 2);
            }
          }
          if (wObs.length > 4) {
            const wr = chiSquareTest(wObs, wExp);
            windowResults.push({ offset: start, pValue: wr.pValue });
          }
        }
      }

      // Scoring
      let jstegScore = 0;
      const indicators: string[] = [];

      if (evenOddRatio > 0.95 && nonZeroCount > 100) {
        jstegScore += 3;
        indicators.push(`Near-perfect even/odd balance in non-zero AC coefficients: ratio=${evenOddRatio.toFixed(4)}`);
      } else if (evenOddRatio > 0.90 && nonZeroCount > 100) {
        jstegScore += 1;
        indicators.push(`High even/odd balance: ratio=${evenOddRatio.toFixed(4)}`);
      }

      if (normalizedChi < 1.5 && chiResult.degreesOfFreedom > 10) {
        jstegScore += 3;
        indicators.push(`Low normalized chi-square on coefficient pairs: ${normalizedChi.toFixed(3)} (equalized pairs)`);
      } else if (normalizedChi < 3.0 && chiResult.degreesOfFreedom > 10) {
        jstegScore += 1;
        indicators.push(`Moderately low chi-square: ${normalizedChi.toFixed(3)}`);
      }

      if (lsbEntropy > 0.98) {
        jstegScore += 2;
        indicators.push(`High LSB entropy of non-zero coefficients: ${lsbEntropy.toFixed(4)} (near-random)`);
      }

      const verdict =
        jstegScore >= 5 ? "likely_jsteg" :
        jstegScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `JSteg Steganography Detection: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Total approximate coefficients: ${coefficients.length.toLocaleString()}`,
        "",
        "Non-Zero AC Coefficient Analysis:",
        `  Non-zero (excluding +-1): ${nonZeroCount.toLocaleString()}`,
        `  Even values: ${nonZeroEven.toLocaleString()}`,
        `  Odd values: ${nonZeroOdd.toLocaleString()}`,
        `  Even/odd ratio: ${evenOddRatio.toFixed(4)} (1.0 = perfectly balanced)`,
        "",
        "Coefficient Pair Chi-Square Test:",
        `  Chi-square statistic: ${chiResult.chiSquare.toFixed(2)}`,
        `  Degrees of freedom: ${chiResult.degreesOfFreedom}`,
        `  p-value: ${chiResult.pValue.toFixed(6)}`,
        `  Normalized (chi2/df): ${normalizedChi.toFixed(3)}`,
        `  (Lower normalized values indicate JSteg-like pair equalization)`,
        "",
        "Zero Coefficient Preservation:",
        `  Zero count: ${zeroCount.toLocaleString()}`,
        `  +1 count: ${oneCount.toLocaleString()}`,
        `  -1 count: ${minusOneCount.toLocaleString()}`,
        "",
        "LSB Analysis of Non-Zero Coefficients:",
        `  LSB entropy: ${lsbEntropy.toFixed(4)} bits (1.0 = perfectly random)`,
        "",
      ];

      if (windowResults.length > 0) {
        lines.push("Sliding Window Chi-Square (per-window p-values):");
        for (const wr of windowResults) {
          const flag = wr.pValue > 0.95 ? " <-- equalized" : "";
          lines.push(`  offset ${wr.offset}: p=${wr.pValue.toFixed(6)}${flag}`);
        }
        lines.push("");
      }

      lines.push(`JSteg Score: ${jstegScore}/8`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_jsteg") {
        lines.push("  JSteg embedding signatures detected. Non-zero AC coefficient LSBs show equalization.");
      } else if (verdict === "suspicious") {
        lines.push("  Some JSteg-like patterns present. Further analysis recommended.");
      } else {
        lines.push("  No significant JSteg steganography indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 3: jpegadv_outguess_detect ───

const jpegadvOutguessDetect: ToolDef = {
  name: "jpegadv_outguess_detect",
  description:
    "OutGuess steganography detection. OutGuess embeds data in DCT coefficients and adjusts " +
    "unused coefficients to preserve first-order statistics. Detects by analyzing second-order " +
    "statistics (inter-block coefficient correlations) that OutGuess disrupts, and checks for " +
    "preserved histogram with disrupted spatial correlations.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file to analyze for OutGuess steganography"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const { coefficients } = extractDctCoefficients(buf);
      const markers = parseJpegMarkers(buf);

      if (coefficients.length === 0) {
        return text("Error: No DCT coefficient data found in JPEG (missing SOS segment).");
      }

      const hist = rangeHistogram(coefficients, -128, 127);

      // OutGuess signature 1: Unnaturally smooth first-order histogram
      // OutGuess preserves first-order statistics, making the histogram *too* smooth
      const diffs: number[] = [];
      for (let i = 1; i < 256; i++) {
        if (hist[i] > 0 || hist[i - 1] > 0) {
          diffs.push(Math.abs(hist[i] - hist[i - 1]));
        }
      }
      const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
      const diffVariance = diffs.length > 0
        ? diffs.reduce((a, b) => a + Math.pow(b - avgDiff, 2), 0) / diffs.length
        : 0;

      // OutGuess signature 2: Second-order statistics anomaly
      // Compute differences between adjacent pair sums; OutGuess over-correction
      // disrupts the natural relationship between consecutive histogram bins
      const secondOrderDiffs: number[] = [];
      for (let i = 0; i < 254; i += 2) {
        const pairSum1 = hist[i] + hist[i + 1];
        const pairSum2 = hist[i + 2] + hist[i + 3];
        if (pairSum1 > 0 && pairSum2 > 0) {
          secondOrderDiffs.push(Math.abs(pairSum1 - pairSum2));
        }
      }
      const avgSecondOrder = secondOrderDiffs.length > 0
        ? secondOrderDiffs.reduce((a, b) => a + b, 0) / secondOrderDiffs.length
        : 0;

      // OutGuess signature 3: Inter-block correlation disruption
      // Compare coefficients at corresponding positions in consecutive 64-coefficient blocks
      // OutGuess adjustment breaks the natural correlation between adjacent blocks
      let correlationSum = 0;
      let correlationCount = 0;
      const blockSize = 64;
      for (let b = 0; b + blockSize * 2 <= coefficients.length; b += blockSize) {
        for (let j = 0; j < blockSize && j < 16; j++) {
          const v1 = coefficients[b + j];
          const v2 = coefficients[b + blockSize + j];
          correlationSum += Math.abs(v1 - v2);
          correlationCount++;
        }
      }
      const avgBlockCorrelation = correlationCount > 0 ? correlationSum / correlationCount : 0;

      // OutGuess signature 4: Local histogram smoothness in mid-range
      const midStart = 100; // ~ -28 in coefficient space
      const midEnd = 156;   // ~ +28 in coefficient space
      let localSmoothness = 0;
      let localSamples = 0;
      for (let i = midStart + 1; i < midEnd; i++) {
        if (hist[i] > 0) {
          const expectedSmooth = (hist[i - 1] + hist[i + 1]) / 2;
          if (expectedSmooth > 0) {
            localSmoothness += Math.abs(hist[i] - expectedSmooth) / expectedSmooth;
            localSamples++;
          }
        }
      }
      const avgLocalDeviation = localSamples > 0 ? localSmoothness / localSamples : 0;

      // OutGuess signature 5: Check comments for OutGuess signature
      const comments = extractComments(markers);
      const hasOutguessComment = comments.some((c) =>
        c.toLowerCase().includes("outguess") || c.toLowerCase().includes("niels provos"),
      );

      // OutGuess signature 6: Coefficient entropy
      const coeffEntropy = shannonEntropy(coefficients.map((c) => ((c % 256) + 256) % 256));

      // Scoring
      let outguessScore = 0;
      const indicators: string[] = [];

      if (diffVariance < avgDiff * 0.5 && avgDiff > 5) {
        outguessScore += 2;
        indicators.push(`Unnaturally smooth histogram: variance=${diffVariance.toFixed(2)} vs avgDiff=${avgDiff.toFixed(2)}`);
      }

      if (avgSecondOrder < avgDiff * 0.3 && avgDiff > 5) {
        outguessScore += 2;
        indicators.push(`Low second-order differences: ${avgSecondOrder.toFixed(2)} (over-correction artifact)`);
      }

      if (avgLocalDeviation < 0.15 && localSamples > 10) {
        outguessScore += 2;
        indicators.push(`Very low local histogram deviation: ${avgLocalDeviation.toFixed(4)} (artificial smoothness)`);
      }

      if (hasOutguessComment) {
        outguessScore += 3;
        indicators.push("OutGuess signature found in JPEG comments");
      }

      if (coeffEntropy > 7.8) {
        outguessScore += 1;
        indicators.push(`High coefficient entropy: ${coeffEntropy.toFixed(4)} bits`);
      }

      const verdict =
        outguessScore >= 5 ? "likely_outguess" :
        outguessScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `OutGuess Steganography Detection: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Coefficients analyzed: ${coefficients.length.toLocaleString()}`,
        "",
        "First-Order Histogram Smoothness:",
        `  Average bin-to-bin difference: ${avgDiff.toFixed(2)}`,
        `  Difference variance: ${diffVariance.toFixed(2)}`,
        `  (OutGuess produces lower variance due to statistical correction)`,
        "",
        "Second-Order Statistics:",
        `  Average second-order difference: ${avgSecondOrder.toFixed(2)}`,
        `  (Low values suggest OutGuess over-correction)`,
        "",
        "Inter-Block Correlation:",
        `  Average inter-block difference: ${avgBlockCorrelation.toFixed(2)}`,
        `  Blocks compared: ${Math.floor(correlationCount / 16)}`,
        `  (OutGuess adjustment disrupts natural block correlations)`,
        "",
        "Local Histogram Smoothness (mid-range):",
        `  Average local deviation: ${avgLocalDeviation.toFixed(4)}`,
        `  Samples analyzed: ${localSamples}`,
        `  (Values < 0.15 indicate artificial smoothing)`,
        "",
        "Coefficient Entropy:",
        `  Entropy: ${coeffEntropy.toFixed(4)} bits`,
        "",
        "Comment Analysis:",
        `  Comments found: ${comments.length}`,
        `  OutGuess signature in comments: ${hasOutguessComment ? "YES" : "no"}`,
        "",
        `OutGuess Score: ${outguessScore}/10`,
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
      if (verdict === "likely_outguess") {
        lines.push("  OutGuess embedding signatures detected. Histogram shows artificial statistical correction.");
      } else if (verdict === "suspicious") {
        lines.push("  Some OutGuess-like patterns present. Further analysis recommended.");
      } else {
        lines.push("  No significant OutGuess steganography indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 4: jpegadv_pvd_detect ───

const jpegadvPvdDetect: ToolDef = {
  name: "jpegadv_pvd_detect",
  description:
    "Pixel Value Differencing (PVD) steganography detection applied to JPEG. PVD encodes " +
    "data in the differences between adjacent pixel values. Detects by analyzing the " +
    "distribution of pixel differences for the staircase pattern at PVD range boundaries " +
    "(Wu-Tsai ranges). Works on decoded pixel data via jpeg-js.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file to analyze for PVD steganography"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      // Decode JPEG to raw pixels
      const decoded = jpeg.decode(buf, {
        useTArray: true,
        formatAsRGBA: true,
        tolerantDecoding: true,
        maxMemoryUsageInMB: 256,
      });
      const { width, height, data: pixels } = decoded;

      // Extract luminance channel values Y = 0.299R + 0.587G + 0.114B
      const totalPixels = width * height;
      const yValues: number[] = [];
      for (let i = 0; i < totalPixels; i++) {
        const r = pixels[i * 4];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];
        yValues.push(Math.round(0.299 * r + 0.587 * g + 0.114 * b));
      }

      // Compute horizontal differences between adjacent pixels
      const hDiffs: number[] = [];
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width - 1; col++) {
          const idx = row * width + col;
          hDiffs.push(Math.abs(yValues[idx] - yValues[idx + 1]));
        }
      }

      // Compute vertical differences
      const vDiffs: number[] = [];
      for (let row = 0; row < height - 1; row++) {
        for (let col = 0; col < width; col++) {
          const idx = row * width + col;
          vDiffs.push(Math.abs(yValues[idx] - yValues[idx + width]));
        }
      }

      // Build difference histograms
      const hHist = histogram(hDiffs, 256);
      const vHist = histogram(vDiffs, 256);

      // PVD range boundaries (Wu & Tsai standard ranges)
      const pvdBoundaries = [8, 16, 32, 64, 128];

      // PVD signature 1: Step artifacts at range boundaries
      let boundaryArtifacts = 0;
      const boundaryAnalysis: Array<{
        boundary: number;
        leftCount: number;
        rightCount: number;
        ratio: number;
      }> = [];

      for (const b of pvdBoundaries) {
        if (b < 255) {
          const leftCount = hHist[b - 1] + hHist[b];
          const rightCount = hHist[b + 1] + (b + 2 < 256 ? hHist[b + 2] : 0);
          const ratio = rightCount > 0 ? leftCount / rightCount : 0;
          boundaryAnalysis.push({ boundary: b, leftCount, rightCount, ratio });
          if (ratio > 3.0 && leftCount > 20) {
            boundaryArtifacts++;
          }
        }
      }

      // PVD signature 2: Difference histogram roughness
      const diffHistSmooth: number[] = [];
      for (let i = 1; i < 200; i++) {
        if (hHist[i] > 0) {
          const expected = (hHist[i - 1] + hHist[i + 1]) / 2;
          if (expected > 0) {
            diffHistSmooth.push(Math.abs(hHist[i] - expected) / expected);
          }
        }
      }
      const avgRoughness = diffHistSmooth.length > 0
        ? diffHistSmooth.reduce((a, b) => a + b, 0) / diffHistSmooth.length
        : 0;

      // PVD signature 3: Entropy of difference values
      const diffEntropy = shannonEntropy(hDiffs.map((d) => Math.min(d, 255)));

      // PVD signature 4: Horizontal vs vertical difference distribution divergence (KL)
      let hvDivergence = 0;
      for (let i = 0; i < 256; i++) {
        const p = hDiffs.length > 0 ? hHist[i] / hDiffs.length : 0;
        const q = vDiffs.length > 0 ? vHist[i] / vDiffs.length : 0;
        if (p > 0 && q > 0) {
          hvDivergence += p * Math.log2(p / q);
        }
      }

      // Scoring
      let pvdScore = 0;
      const indicators: string[] = [];

      if (boundaryArtifacts >= 3) {
        pvdScore += 3;
        indicators.push(`Step artifacts at ${boundaryArtifacts}/${pvdBoundaries.length} PVD range boundaries`);
      } else if (boundaryArtifacts >= 1) {
        pvdScore += 1;
        indicators.push(`Step artifacts at ${boundaryArtifacts} PVD range boundary(ies)`);
      }

      if (avgRoughness > 0.5) {
        pvdScore += 2;
        indicators.push(`High difference histogram roughness: ${avgRoughness.toFixed(4)}`);
      }

      if (Math.abs(hvDivergence) > 0.5) {
        pvdScore += 2;
        indicators.push(`Horizontal/vertical difference divergence: ${hvDivergence.toFixed(4)} (possible directional embedding)`);
      }

      if (diffEntropy > 6.5) {
        pvdScore += 1;
        indicators.push(`High difference entropy: ${diffEntropy.toFixed(4)} bits`);
      }

      const verdict =
        pvdScore >= 5 ? "likely_pvd" :
        pvdScore >= 3 ? "suspicious" :
        "clean";

      const lines: string[] = [
        `PVD Steganography Detection: ${filePath}`,
        `Image: ${width}x${height}`,
        `Horizontal differences analyzed: ${hDiffs.length.toLocaleString()}`,
        `Vertical differences analyzed: ${vDiffs.length.toLocaleString()}`,
        "",
        "Difference Histogram Statistics:",
        `  Difference entropy: ${diffEntropy.toFixed(4)} bits`,
        `  Average roughness: ${avgRoughness.toFixed(4)}`,
        `  H/V divergence (KL): ${hvDivergence.toFixed(4)}`,
        "",
        "PVD Range Boundary Analysis:",
      ];

      for (const ba of boundaryAnalysis) {
        const flag = ba.ratio > 3.0 && ba.leftCount > 20 ? " [!]" : "";
        lines.push(
          `  Boundary ${ba.boundary}: left=${ba.leftCount}, right=${ba.rightCount}, ratio=${ba.ratio.toFixed(2)}${flag}`,
        );
      }

      lines.push("");
      lines.push(`PVD Score: ${pvdScore}/8`);
      lines.push("");

      if (indicators.length > 0) {
        lines.push("Indicators:");
        for (const ind of indicators) {
          lines.push(`  [!] ${ind}`);
        }
        lines.push("");
      }

      lines.push(`Verdict: ${verdict.toUpperCase()}`);
      if (verdict === "likely_pvd") {
        lines.push("  PVD embedding signatures detected. Difference histogram shows range boundary artifacts.");
      } else if (verdict === "suspicious") {
        lines.push("  Some PVD-like patterns present. Further analysis recommended.");
      } else {
        lines.push("  No significant PVD steganography indicators detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 5: jpegadv_chi_sliding ───

const jpegadvChiSliding: ToolDef = {
  name: "jpegadv_chi_sliding",
  description:
    "Sliding window chi-square analysis over sequential DCT coefficients. Divides the " +
    "coefficient stream into windows of configurable size and runs chi-square pair analysis " +
    "on each window. Returns per-window p-values and detection results to map where " +
    "embedding starts and stops.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file for sliding window chi-square analysis"),
    window_size: z
      .number()
      .optional()
      .describe("Number of coefficients per window (default: auto-calculated from file size)"),
    window_count: z
      .number()
      .optional()
      .describe("Number of windows to divide the data into (default: 20, max: 50)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const requestedWindowSize = args.window_size as number | undefined;
      const windowCount = Math.min((args.window_count as number | undefined) ?? 20, 50);
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const { coefficients } = extractDctCoefficients(buf);

      if (coefficients.length === 0) {
        return text("Error: No DCT coefficient data found in JPEG (missing SOS segment).");
      }

      // Filter to non-zero, non-one coefficients (same as JSteg target population)
      const eligible = coefficients.filter((c) => c !== 0 && c !== 1 && c !== -1);

      if (eligible.length < 256) {
        return text("Error: Not enough eligible DCT coefficients for sliding window analysis.");
      }

      const effectiveWindowSize = requestedWindowSize ?? Math.floor(eligible.length / windowCount);
      const minWindow = Math.max(effectiveWindowSize, 128);

      const windowResults: Array<{
        windowIndex: number;
        startOffset: number;
        endOffset: number;
        coeffCount: number;
        chiSquare: number;
        pValue: number;
        verdict: string;
      }> = [];

      for (let w = 0; w < windowCount; w++) {
        const start = w * effectiveWindowSize;
        const end = Math.min(start + effectiveWindowSize, eligible.length);
        if (end - start < minWindow && w > 0) break;

        const windowCoeffs = eligible.slice(start, end);
        const wHist = rangeHistogram(windowCoeffs, -128, 127);

        const wObs: number[] = [];
        const wExp: number[] = [];
        for (let v = -128; v <= 126; v += 2) {
          if (v === 0 || v === -1) continue;
          const i1 = v + 128;
          const i2 = v + 1 + 128;
          const t = wHist[i1] + wHist[i2];
          if (t > 2) {
            wObs.push(wHist[i1]);
            wExp.push(t / 2);
            wObs.push(wHist[i2]);
            wExp.push(t / 2);
          }
        }

        if (wObs.length > 4) {
          const result = chiSquareTest(wObs, wExp);
          const normalizedChi = result.degreesOfFreedom > 0
            ? result.chiSquare / result.degreesOfFreedom
            : 0;

          const wVerdict =
            result.pValue > 0.95 ? "likely_stego" :
            result.pValue > 0.5 ? "suspicious" :
            normalizedChi < 1.5 ? "suspicious" :
            "clean";

          windowResults.push({
            windowIndex: w,
            startOffset: start,
            endOffset: end,
            coeffCount: windowCoeffs.length,
            chiSquare: result.chiSquare,
            pValue: result.pValue,
            verdict: wVerdict,
          });
        }
      }

      // Find transition point (where p-value drops from high to low)
      let transitionIdx = -1;
      for (let i = 1; i < windowResults.length; i++) {
        if (windowResults[i - 1].pValue > 0.5 && windowResults[i].pValue < 0.3) {
          transitionIdx = i;
          break;
        }
      }

      const lines: string[] = [
        `Sliding Window Chi-Square Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Total coefficients: ${coefficients.length.toLocaleString()}`,
        `Eligible coefficients (non-zero, non-one): ${eligible.length.toLocaleString()}`,
        `Window size: ${effectiveWindowSize.toLocaleString()} coefficients`,
        `Windows analyzed: ${windowResults.length}`,
        "",
        "Per-Window Results:",
        "-".repeat(95),
        `${"Win".padEnd(5)} ${"Start".padEnd(10)} ${"End".padEnd(10)} ${"Count".padEnd(8)} ${"Chi2".padEnd(12)} ${"p-value".padEnd(12)} ${"Verdict".padEnd(16)}`,
        "-".repeat(95),
      ];

      for (let i = 0; i < windowResults.length; i++) {
        const wr = windowResults[i];
        const marker = i === transitionIdx ? " <-- transition" : "";
        lines.push(
          `${String(wr.windowIndex + 1).padEnd(5)} ` +
          `${wr.startOffset.toLocaleString().padEnd(10)} ` +
          `${wr.endOffset.toLocaleString().padEnd(10)} ` +
          `${wr.coeffCount.toLocaleString().padEnd(8)} ` +
          `${wr.chiSquare.toFixed(2).padStart(10)}  ` +
          `${wr.pValue.toFixed(6).padStart(10)}  ` +
          `${wr.verdict}${marker}`,
        );
      }

      lines.push("-".repeat(95));
      lines.push("");

      // ASCII p-value curve
      lines.push("P-value Curve (embedding probability per window):");
      const barWidth = 40;
      for (const wr of windowResults) {
        const pct = ((wr.startOffset / eligible.length) * 100).toFixed(0);
        const bar = "#".repeat(Math.round(wr.pValue * barWidth));
        const empty = ".".repeat(barWidth - Math.round(wr.pValue * barWidth));
        lines.push(`  ${pct.padStart(4)}% |${bar}${empty}| p=${wr.pValue.toFixed(4)}`);
      }
      lines.push("");

      // Interpretation
      if (transitionIdx > 0) {
        const transWr = windowResults[transitionIdx - 1];
        lines.push(`[!] Transition detected at window #${transitionIdx + 1}`);
        lines.push(`    Embedding likely covers first ~${transWr.endOffset.toLocaleString()} eligible coefficients`);
        lines.push(`    Estimated embedded data: ~${Math.floor(transWr.endOffset / 8).toLocaleString()} bytes`);
        lines.push("    This suggests partial embedding, typical of sequential stego tools.");
      } else {
        const allHigh = windowResults.every((wr) => wr.pValue > 0.5);
        const allLow = windowResults.every((wr) => wr.pValue < 0.3);

        if (allHigh) {
          lines.push("[!] All windows show high p-values -- consistent with full-image embedding");
        } else if (allLow) {
          lines.push("[OK] All windows show low p-values -- no embedding detected");
        } else {
          lines.push("[?] No clear transition point -- mixed results, further analysis recommended");
        }
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 6: jpegadv_calibration ───

const jpegadvCalibration: ToolDef = {
  name: "jpegadv_calibration",
  description:
    "Crop-recalibrate steganalysis. Crops the image by removing a few pixel rows/columns " +
    "to break DCT block alignment, then compares DCT and pixel statistics between the " +
    "original and calibrated version. Steganographic modifications are revealed because " +
    "recalibration restores natural statistics that embedding had disrupted.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file for calibration-based steganalysis"),
    crop_pixels: z
      .number()
      .optional()
      .describe("Number of pixels to crop from edges to break DCT alignment (default: 4)"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const cropPx = (args.crop_pixels as number | undefined) ?? 4;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const { coefficients, quantTables } = extractDctCoefficients(buf);
      const markers = parseJpegMarkers(buf);
      const qTables = extractQuantizationTables(markers);

      // Decode JPEG to pixels
      const decoded = jpeg.decode(buf, {
        useTArray: true,
        formatAsRGBA: true,
        tolerantDecoding: true,
        maxMemoryUsageInMB: 256,
      });
      const { width, height, data: pixels } = decoded;

      const cropW = width - 2 * cropPx;
      const cropH = height - 2 * cropPx;

      if (cropW < 8 || cropH < 8) {
        return text("Error: Image too small for calibration (cropped region < 8x8).");
      }

      // Extract original luminance values
      const origValues: number[] = [];
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const idx = (row * width + col) * 4;
          origValues.push(Math.round(0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]));
        }
      }

      // Extract calibrated (cropped) region luminance values
      const cropValues: number[] = [];
      for (let row = cropPx; row < cropPx + cropH; row++) {
        for (let col = cropPx; col < cropPx + cropW; col++) {
          const idx = (row * width + col) * 4;
          cropValues.push(Math.round(0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]));
        }
      }

      // Build histograms
      const origHist = histogram(origValues, 256);
      const cropHist = histogram(cropValues, 256);
      const origTotal = origValues.length;
      const cropTotal = cropValues.length;

      // Chi-square pair test on both original and calibrated
      const origPairObs: number[] = [];
      const origPairExp: number[] = [];
      const cropPairObs: number[] = [];
      const cropPairExp: number[] = [];

      for (let i = 0; i < 256; i += 2) {
        const origPair = origHist[i] + origHist[i + 1];
        if (origPair > 0) {
          origPairObs.push(origHist[i]);
          origPairExp.push(origPair / 2);
          origPairObs.push(origHist[i + 1]);
          origPairExp.push(origPair / 2);
        }
        const cropPair = cropHist[i] + cropHist[i + 1];
        if (cropPair > 0) {
          cropPairObs.push(cropHist[i]);
          cropPairExp.push(cropPair / 2);
          cropPairObs.push(cropHist[i + 1]);
          cropPairExp.push(cropPair / 2);
        }
      }

      const origChiResult = chiSquareTest(origPairObs, origPairExp);
      const cropChiResult = chiSquareTest(cropPairObs, cropPairExp);

      // KL divergence between original and cropped histograms
      let klDivergence = 0;
      let histDiffSum = 0;
      for (let i = 0; i < 256; i++) {
        const p = origHist[i] / origTotal;
        const q = cropHist[i] / cropTotal;
        if (p > 0 && q > 0) {
          klDivergence += p * Math.log2(p / q);
        }
        histDiffSum += Math.abs(p - q);
      }

      // Compare entropies
      const origEntropy = shannonEntropy(Buffer.from(origValues.map((v) => Math.min(255, Math.max(0, v)))));
      const cropEntropy = shannonEntropy(Buffer.from(cropValues.map((v) => Math.min(255, Math.max(0, v)))));
      const entropyDiff = Math.abs(origEntropy - cropEntropy);

      // Block entropy comparison
      const origBlockEnt = blockEntropy(Buffer.from(origValues.map((v) => Math.min(255, Math.max(0, v)))), 512);
      const cropBlockEnt = blockEntropy(Buffer.from(cropValues.map((v) => Math.min(255, Math.max(0, v)))), 512);

      // DCT coefficient histogram comparison (original vs theoretical)
      // For clean JPEG at same quality, coefficient histogram follows Laplacian distribution
      const coeffHist = rangeHistogram(coefficients, -128, 127);
      let laplacianDeviation = 0;
      if (coefficients.length > 0) {
        // Estimate Laplacian parameter from data
        let absSum = 0;
        let nonZero = 0;
        for (const c of coefficients) {
          if (c !== 0) {
            absSum += Math.abs(c);
            nonZero++;
          }
        }
        const lambda = nonZero > 0 ? nonZero / absSum : 1;

        // Compare actual histogram to expected Laplacian
        for (let v = -50; v <= 50; v++) {
          const idx = v + 128;
          const expectedFrac = (lambda / 2) * Math.exp(-lambda * Math.abs(v));
          const expectedCount = expectedFrac * coefficients.length;
          if (expectedCount > 1) {
            laplacianDeviation += Math.pow(coeffHist[idx] - expectedCount, 2) / expectedCount;
          }
        }
      }

      // Scoring
      let calScore = 0;
      const indicators: string[] = [];

      const pValueDiff = Math.abs(origChiResult.pValue - cropChiResult.pValue);
      if (pValueDiff > 0.4) {
        calScore += 3;
        indicators.push(
          `Large p-value shift after calibration: ${pValueDiff.toFixed(4)} ` +
          `(original=${origChiResult.pValue.toFixed(4)}, calibrated=${cropChiResult.pValue.toFixed(4)})`,
        );
      } else if (pValueDiff > 0.15) {
        calScore += 1;
        indicators.push(`Moderate p-value shift: ${pValueDiff.toFixed(4)}`);
      }

      if (klDivergence > 0.05) {
        calScore += 2;
        indicators.push(`High KL divergence between original and calibrated: ${klDivergence.toFixed(6)}`);
      }

      if (histDiffSum > 0.1) {
        calScore += 1;
        indicators.push(`Histogram L1 distance: ${histDiffSum.toFixed(4)}`);
      }

      if (entropyDiff > 0.05) {
        calScore += 1;
        indicators.push(
          `Entropy difference: ${entropyDiff.toFixed(4)} ` +
          `(original=${origEntropy.toFixed(4)}, calibrated=${cropEntropy.toFixed(4)})`,
        );
      }

      if (origChiResult.pValue > 0.5 && cropChiResult.pValue < 0.3) {
        calScore += 2;
        indicators.push("Original shows equalized pairs (stego) but calibrated version does not (natural)");
      }

      const verdict =
        calScore >= 5 ? "likely_stego" :
        calScore >= 3 ? "suspicious" :
        "clean";

      const qualityEstimate = qTables[0]?.estimatedQuality ?? 0;

      const lines: string[] = [
        `Calibration Attack Steganalysis: ${filePath}`,
        `Original: ${width}x${height} (${origTotal.toLocaleString()} pixels)`,
        `Calibrated (cropped ${cropPx}px per edge): ${cropW}x${cropH} (${cropTotal.toLocaleString()} pixels)`,
        `Quality estimate: ~${qualityEstimate}%`,
        `Quantization tables: ${quantTables.length}`,
        "",
        "Chi-Square LSB Pair Test Comparison:",
        `  Original:    chi2=${origChiResult.chiSquare.toFixed(2)}, p=${origChiResult.pValue.toFixed(6)}, df=${origChiResult.degreesOfFreedom}`,
        `  Calibrated:  chi2=${cropChiResult.chiSquare.toFixed(2)}, p=${cropChiResult.pValue.toFixed(6)}, df=${cropChiResult.degreesOfFreedom}`,
        `  p-value difference: ${pValueDiff.toFixed(4)}`,
        "",
        "Histogram Comparison:",
        `  KL divergence: ${klDivergence.toFixed(6)}`,
        `  L1 distance: ${histDiffSum.toFixed(4)}`,
        "",
        "Entropy Comparison:",
        `  Original entropy: ${origEntropy.toFixed(4)} bits`,
        `  Calibrated entropy: ${cropEntropy.toFixed(4)} bits`,
        `  Difference: ${entropyDiff.toFixed(4)}`,
        "",
        "Block Entropy:",
        `  Original avg block entropy: ${origBlockEnt.averageBlockEntropy.toFixed(4)}`,
        `  Calibrated avg block entropy: ${cropBlockEnt.averageBlockEntropy.toFixed(4)}`,
        "",
        "DCT Coefficient vs Theoretical Laplacian:",
        `  Laplacian deviation (chi2): ${laplacianDeviation.toFixed(2)}`,
        `  (High values indicate distribution distorted by embedding)`,
        "",
        `Calibration Score: ${calScore}/9`,
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
      if (verdict === "likely_stego") {
        lines.push("  Significant statistical differences between original and calibrated versions.");
        lines.push("  The original image likely contains steganographic modifications.");
      } else if (verdict === "suspicious") {
        lines.push("  Some differences detected. May indicate light embedding or JPEG artifacts.");
      } else {
        lines.push("  Original and calibrated versions are statistically similar. No embedding detected.");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 7: jpegadv_compatibility ───

const jpegadvCompatibility: ToolDef = {
  name: "jpegadv_compatibility",
  description:
    "JPEG stego tool compatibility check. Analyzes the image to determine which " +
    "steganography tools could have been used based on its properties: color space, " +
    "quality factor, progressive vs baseline encoding, marker structure, quantization " +
    "tables, and metadata patterns.",
  schema: {
    file_path: z.string().describe("Absolute path to the JPEG file for stego tool compatibility analysis"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const qTables = extractQuantizationTables(markers);
      const comments = extractComments(markers);
      const sosEntropy = analyzeSosEntropy(markers);
      const { coefficients, quantTables } = extractDctCoefficients(buf);

      // Image characteristics
      const sofMarker = markers.find((m) => m.marker >= 0xffc0 && m.marker <= 0xffc3);
      const isProgressive = sofMarker?.marker === 0xffc2;
      const isBaseline = sofMarker?.marker === 0xffc0;

      const hasExif = markers.some((m) => m.marker === 0xffe1);
      const hasJfif = markers.some((m) => m.marker === 0xffe0);
      const hasAdobe = markers.some((m) => m.marker === 0xffee);
      const hasIcc = markers.some((m) => m.marker === 0xffe2);
      const hasDri = markers.some((m) => m.marker === 0xffdd);
      const commentTexts = comments.map((c) => c.toLowerCase());

      const sosCount = markers.filter((m) => m.marker === 0xffda).length;
      const dqtCount = markers.filter((m) => m.marker === 0xffdb).length;
      const dhtCount = markers.filter((m) => m.marker === 0xffc4).length;

      const quality = qTables[0]?.estimatedQuality ?? 0;

      // Color space detection from SOF marker
      let numComponents = 0;
      let colorSpace = "unknown";
      if (sofMarker && sofMarker.data.length >= 6) {
        numComponents = sofMarker.data[5];
        if (numComponents === 1) colorSpace = "grayscale";
        else if (numComponents === 3) colorSpace = hasAdobe ? "YCbCr (Adobe)" : "YCbCr";
        else if (numComponents === 4) colorSpace = "CMYK";
      }

      interface ToolCompatibility {
        name: string;
        compatible: boolean;
        confidence: "high" | "medium" | "low";
        reasons: string[];
      }

      const tools: ToolCompatibility[] = [];

      // JSteg
      {
        const reasons: string[] = [];
        let compatible = true;
        let confidence: "high" | "medium" | "low" = "medium";

        if (isBaseline) {
          reasons.push("Baseline DCT (required by JSteg)");
        } else {
          compatible = false;
          reasons.push("Not baseline DCT (JSteg requires baseline)");
        }

        if (numComponents >= 3) {
          reasons.push("Color image (JSteg uses all components)");
        } else if (numComponents === 1) {
          reasons.push("Grayscale (JSteg works but with less capacity)");
        }

        if (hasJfif) {
          reasons.push("JFIF marker present (typical for JSteg)");
          confidence = "high";
        }

        tools.push({ name: "JSteg", compatible, confidence, reasons });
      }

      // F5
      {
        const reasons: string[] = [];
        let compatible = true;
        let confidence: "high" | "medium" | "low" = "medium";

        if (isBaseline) {
          reasons.push("Baseline DCT (F5 works with baseline JPEG)");
        } else if (isProgressive) {
          reasons.push("Progressive DCT (F5 can handle this)");
        }

        const f5Comment = commentTexts.some((c) => c.includes("jpeg encoder"));
        if (f5Comment) {
          reasons.push("F5-style encoder comment detected");
          confidence = "high";
        }

        reasons.push(`${dhtCount} Huffman table(s) found`);
        reasons.push(`Quality ~${quality}% (F5 supports all quality levels)`);

        tools.push({ name: "F5", compatible, confidence, reasons });
      }

      // OutGuess
      {
        const reasons: string[] = [];
        let compatible = true;
        let confidence: "high" | "medium" | "low" = "medium";

        if (isBaseline) {
          reasons.push("Baseline DCT (required by OutGuess)");
        } else {
          compatible = false;
          reasons.push("Not baseline DCT (OutGuess requires baseline)");
        }

        const ogComment = commentTexts.some((c) => c.includes("outguess"));
        if (ogComment) {
          reasons.push("OutGuess signature in comments");
          confidence = "high";
        }

        if (hasJfif) reasons.push("JFIF structure preserved");

        tools.push({ name: "OutGuess", compatible, confidence, reasons });
      }

      // steghide
      {
        const reasons: string[] = [];
        let compatible = true;
        const confidence: "high" | "medium" | "low" = "medium";

        if (isBaseline) {
          reasons.push("Baseline DCT (compatible with steghide)");
        } else {
          compatible = false;
          reasons.push("Not baseline DCT (steghide requires baseline JPEG)");
        }

        if (quality <= 95) {
          reasons.push(`Quality ~${quality}% (within steghide range)`);
        } else {
          reasons.push(`Quality ~${quality}% (may exceed steghide effective range)`);
        }

        if (numComponents === 3) {
          reasons.push("3-component color (steghide embeds in DCT of all components)");
        }

        tools.push({ name: "steghide", compatible, confidence, reasons });
      }

      // JPHS (JPEG Hide and Seek)
      {
        const reasons: string[] = [];
        let compatible = true;
        let confidence: "high" | "medium" | "low" = "medium";

        if (isBaseline) {
          reasons.push("Baseline DCT (required by JPHS)");
        } else {
          compatible = false;
          reasons.push("Not baseline DCT (JPHS requires baseline)");
        }

        const jphsComment = commentTexts.some((c) => c.includes("jphs") || c.includes("jpeg hide"));
        if (jphsComment) {
          reasons.push("JPHS signature in comments");
          confidence = "high";
        }

        if (numComponents >= 3) {
          reasons.push("Color image (JPHS uses luminance and chrominance)");
        }

        tools.push({ name: "JPHS (JPEG Hide & Seek)", compatible, confidence, reasons });
      }

      // Invisible Secrets
      {
        const reasons: string[] = [];
        const compatible = true;
        const confidence: "high" | "medium" | "low" = "low";

        reasons.push("Generic JPEG embedding -- format-agnostic appended data method");
        reasons.push("Check for appended data after EOI marker");

        tools.push({ name: "Invisible Secrets", compatible, confidence, reasons });
      }

      // OpenStego
      {
        const reasons: string[] = [];
        let compatible = false;
        const confidence: "high" | "medium" | "low" = "low";

        reasons.push("OpenStego primarily uses PNG format, not JPEG");
        reasons.push("May use JPEG only as a wrapper with appended data");

        const osComment = commentTexts.some((c) => c.includes("openstego"));
        if (osComment) {
          compatible = true;
          reasons.push("OpenStego signature found in comments");
        }

        tools.push({ name: "OpenStego", compatible, confidence, reasons });
      }

      // Build output
      const compatibleTools: string[] = [];
      const incompatibleTools: string[] = [];

      for (const tool of tools) {
        if (tool.compatible) {
          compatibleTools.push(`${tool.name} (${tool.confidence})`);
        } else {
          incompatibleTools.push(tool.name);
        }
      }

      const lines: string[] = [
        `JPEG Stego Tool Compatibility: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        "",
        "Image Characteristics:",
        `  Encoding: ${sofMarker?.name ?? "unknown"}`,
        `  Progressive: ${isProgressive ? "yes" : "no"}`,
        `  Baseline: ${isBaseline ? "yes" : "no"}`,
        `  Color space: ${colorSpace} (${numComponents} component(s))`,
        `  JFIF: ${hasJfif ? "yes" : "no"}`,
        `  EXIF: ${hasExif ? "yes" : "no"}`,
        `  Adobe marker: ${hasAdobe ? "yes" : "no"}`,
        `  ICC profile: ${hasIcc ? "yes" : "no"}`,
        `  DRI (restart): ${hasDri ? "yes" : "no"}`,
        `  Quality estimate: ~${quality}%`,
        `  SOS segments: ${sosCount}`,
        `  DQT tables: ${dqtCount}`,
        `  DHT tables: ${dhtCount}`,
        `  Comments: ${comments.length}`,
        `  Total markers: ${markers.length}`,
        `  SOS entropy: ${sosEntropy.entropy.toFixed(4)} bits`,
        `  DCT coefficients: ${coefficients.length.toLocaleString()}`,
        "",
        "-".repeat(70),
        "Tool Compatibility Matrix:",
        "-".repeat(70),
      ];

      for (const tool of tools) {
        const status = tool.compatible ? "[COMPATIBLE]" : "[INCOMPATIBLE]";
        const confLabel = `(${tool.confidence} confidence)`;
        lines.push("");
        lines.push(`  ${tool.name}: ${status} ${confLabel}`);
        for (const reason of tool.reasons) {
          lines.push(`    - ${reason}`);
        }
      }

      lines.push("");
      lines.push("-".repeat(70));
      lines.push("");
      lines.push("Summary:");
      lines.push(`  Compatible tools: ${compatibleTools.length > 0 ? compatibleTools.join(", ") : "none"}`);
      lines.push(`  Incompatible tools: ${incompatibleTools.length > 0 ? incompatibleTools.join(", ") : "none"}`);

      if (comments.length > 0) {
        lines.push("");
        lines.push("Comments found:");
        for (const c of comments) {
          lines.push(`  "${c.substring(0, 100)}${c.length > 100 ? "..." : ""}"`);
        }
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Export All Tools ───

export const jpegadvTools: ToolDef[] = [
  jpegadvF5Detect,
  jpegadvJstegDetect,
  jpegadvOutguessDetect,
  jpegadvPvdDetect,
  jpegadvChiSliding,
  jpegadvCalibration,
  jpegadvCompatibility,
];
