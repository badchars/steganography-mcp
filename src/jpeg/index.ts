import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump, detectImageFormat } from "../utils/binary.js";
import { shannonEntropy, histogram, chiSquareTest, blockEntropy } from "../utils/stats.js";
import {
  parseJpegMarkers,
  getJpegPixels,
  extractQuantizationTables,
  parseExifData,
  extractComments,
  findJpegAppendedData,
  analyzeSosEntropy,
} from "../utils/jpeg-parser.js";

// ─── Helpers ───

function ensureJpeg(buf: Buffer, filePath: string): void {
  const fmt = detectImageFormat(buf);
  if (fmt !== "jpeg") {
    throw new Error(`Not a JPEG file (detected: ${fmt}). Path: ${filePath}`);
  }
}

function formatHexMarker(marker: number): string {
  return `0x${marker.toString(16).toUpperCase().padStart(4, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Standard JPEG Luminance Quantization Table (Quality 50) ───

const STANDARD_LUMINANCE_QT = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];

// ─── Tool 1: jpeg_structure ───

const jpegStructure: ToolDef = {
  name: "jpeg_structure",
  description:
    "Parse JPEG markers/segments with offsets and sizes. Shows the internal structure of a JPEG file including all markers, their positions, and segment lengths — useful for identifying hidden data or anomalous segments.",
  schema: {
    file_path: z.string().describe("Path to JPEG file to analyze"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const lines: string[] = [
        `JPEG Structure Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Total markers found: ${markers.length}`,
        "",
        "Marker Listing:",
        "─".repeat(80),
        `${"#".padEnd(4)} ${"Marker".padEnd(30)} ${"Hex".padEnd(10)} ${"Offset".padEnd(12)} ${"Length".padEnd(12)}`,
        "─".repeat(80),
      ];

      let totalSegmentSize = 0;

      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const idx = String(i + 1).padEnd(4);
        const name = m.name.padEnd(30);
        const hex = formatHexMarker(m.marker).padEnd(10);
        const offset = `0x${m.offset.toString(16).padStart(8, "0")}`.padEnd(12);
        const length = formatSize(m.length).padEnd(12);

        lines.push(`${idx} ${name} ${hex} ${offset} ${length}`);
        totalSegmentSize += m.length;
      }

      lines.push("─".repeat(80));

      // Check for appended data after EOI
      const appendedData = findJpegAppendedData(buf);
      if (appendedData) {
        const appendedSize = appendedData.length;
        lines.push("");
        lines.push(`[!] APPENDED DATA DETECTED after EOI marker`);
        lines.push(`    Size: ${formatSize(appendedSize)} (${appendedSize} bytes)`);
        lines.push(`    Offset: 0x${(buf.length - appendedSize).toString(16).padStart(8, "0")}`);
        lines.push(`    First 64 bytes hex dump:`);
        lines.push(hexDump(appendedData, 0, Math.min(64, appendedSize)));
      }

      // Summarize marker types
      const markerCounts = new Map<string, number>();
      for (const m of markers) {
        markerCounts.set(m.name, (markerCounts.get(m.name) ?? 0) + 1);
      }
      lines.push("");
      lines.push("Marker Summary:");
      for (const [name, count] of markerCounts) {
        lines.push(`  ${name}: ${count}`);
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 2: jpeg_dct_histogram ───

const jpegDctHistogram: ToolDef = {
  name: "jpeg_dct_histogram",
  description:
    "DCT coefficient distribution analysis for steganography detection. Analyzes the Y-channel pixel value distribution and SOS entropy data to detect anomalies caused by DCT-domain stego tools like JSteg, F5, and OutGuess.",
  schema: {
    file_path: z.string().describe("Path to JPEG file to analyze"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const raw = await readFileInput(filePath);
      ensureJpeg(raw, filePath);

      const pixelData = await getJpegPixels(filePath);
      const { width, height, data: pixels, markers } = pixelData;

      // Extract Y-channel (luminance) values from RGBA data
      // Y = 0.299*R + 0.587*G + 0.114*B
      const totalPixels = width * height;
      const yValues: number[] = [];
      for (let i = 0; i < totalPixels; i++) {
        const r = pixels[i * 4];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];
        const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        yValues.push(Math.min(255, Math.max(0, y)));
      }

      // Build histogram of Y-channel values
      const yHist = histogram(yValues, 256);

      // Chi-square test for uniform distribution of LSBs
      // In stego images, the LSB distribution of DCT coefficients tends to be more uniform
      const evenBins: number[] = [];
      const oddBins: number[] = [];
      for (let i = 0; i < 256; i += 2) {
        evenBins.push(yHist[i]);
        oddBins.push(yHist[i + 1]);
      }

      // Check pairs: adjacent values should have similar frequencies after LSB embedding
      const pairObserved: number[] = [];
      const pairExpected: number[] = [];
      for (let i = 0; i < 256; i += 2) {
        const total = yHist[i] + yHist[i + 1];
        if (total > 0) {
          pairObserved.push(yHist[i]);
          pairExpected.push(total / 2);
          pairObserved.push(yHist[i + 1]);
          pairExpected.push(total / 2);
        }
      }
      const chiResult = chiSquareTest(pairObserved, pairExpected);

      // SOS entropy analysis
      const sosAnalysis = analyzeSosEntropy(markers);

      // Find histogram peaks and valleys
      const maxFreq = Math.max(...yHist);
      const peakThreshold = maxFreq * 0.7;
      const peaks: number[] = [];
      for (let i = 1; i < 255; i++) {
        if (yHist[i] > peakThreshold && yHist[i] > yHist[i - 1] && yHist[i] > yHist[i + 1]) {
          peaks.push(i);
        }
      }

      // Overall Y-channel entropy
      const yEntropy = shannonEntropy(Buffer.from(yValues));

      // Build ASCII histogram (top 20 most common values)
      const sortedBins = yHist
        .map((count: number, value: number) => ({ value, count }))
        .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
        .slice(0, 20);

      const histMax = sortedBins[0]?.count ?? 1;
      const barWidth = 40;

      const lines: string[] = [
        `DCT/Pixel Histogram Analysis: ${filePath}`,
        `Image: ${width}x${height} (${totalPixels.toLocaleString()} pixels)`,
        "",
        "Y-Channel (Luminance) Statistics:",
        `  Shannon entropy: ${yEntropy.toFixed(4)} bits`,
        `  Value range: ${Math.min(...yValues)} - ${Math.max(...yValues)}`,
        `  Peak values: ${peaks.length > 0 ? peaks.join(", ") : "none detected"}`,
        "",
        "Top 20 Y-Channel Value Frequencies:",
        "─".repeat(65),
      ];

      for (const bin of sortedBins) {
        const bar = "█".repeat(Math.ceil((bin.count / histMax) * barWidth));
        const pct = ((bin.count / totalPixels) * 100).toFixed(2);
        lines.push(`  Value ${String(bin.value).padStart(3)}: ${bar} ${bin.count} (${pct}%)`);
      }

      lines.push("");
      lines.push("LSB Pair Analysis (Chi-Square):");
      lines.push(`  Chi-square statistic: ${chiResult.chiSquare.toFixed(2)}`);
      lines.push(`  p-value: ${chiResult.pValue.toFixed(6)}`);
      lines.push(`  Degrees of freedom: ${chiResult.degreesOfFreedom}`);

      if (chiResult.pValue > 0.95) {
        lines.push(`  [!] HIGH p-value: pixel value pairs are abnormally equalized`);
        lines.push(`      This pattern is consistent with LSB/DCT steganography (JSteg, F5)`);
      } else if (chiResult.pValue > 0.5) {
        lines.push(`  [?] Moderate p-value: inconclusive, further analysis recommended`);
      } else {
        lines.push(`  [OK] Low p-value: no obvious LSB pair equalization detected`);
      }

      lines.push("");
      lines.push("SOS (Scan Data) Entropy Analysis:");
      lines.push(`  Scan data size: ${formatSize(sosAnalysis.sosSize)}`);
      lines.push(`  Entropy: ${sosAnalysis.entropy.toFixed(4)} bits`);
      lines.push(`  Zero-byte percentage: ${sosAnalysis.zeroBytePercentage.toFixed(2)}%`);
      lines.push(`  0xFF byte percentage: ${sosAnalysis.ffBytePercentage.toFixed(2)}%`);

      if (sosAnalysis.anomalies.length > 0) {
        lines.push(`  Anomalies:`);
        for (const a of sosAnalysis.anomalies) {
          lines.push(`    [!] ${a}`);
        }
      } else {
        lines.push(`  [OK] No anomalies detected in scan data`);
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 3: jpeg_double_compression ───

const jpegDoubleCompression: ToolDef = {
  name: "jpeg_double_compression",
  description:
    "Detect double JPEG compression artifacts. Double compression occurs when a JPEG is decoded and re-encoded, which introduces characteristic blocking artifacts and quantization table anomalies — a common indicator of image tampering or steganographic embedding.",
  schema: {
    file_path: z.string().describe("Path to JPEG file to analyze for double compression"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const qTables = extractQuantizationTables(markers);

      const lines: string[] = [
        `Double Compression Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Quantization tables found: ${qTables.length}`,
        "",
      ];

      const anomalies: string[] = [];

      for (const qt of qTables) {
        const tableLabel = qt.id === 0 ? "Luminance (Y)" : qt.id === 1 ? "Chrominance (CbCr)" : `Table ${qt.id}`;
        lines.push(`Quantization Table ${qt.id} (${tableLabel}):`);
        lines.push(`  Precision: ${qt.precision === 0 ? "8-bit" : "16-bit"}`);
        lines.push(`  Estimated quality: ~${qt.estimatedQuality}%`);

        if (qt.values.length === 64) {
          // Check 1: Are values all multiples of some common factor?
          // Double compression often produces QT values that are multiples of the first table's values
          const gcdValues: number[] = [];
          for (const v of qt.values) {
            if (v > 1) gcdValues.push(v);
          }

          // Find GCD of all QT values
          const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
          let commonFactor = gcdValues[0] ?? 1;
          for (let i = 1; i < gcdValues.length; i++) {
            commonFactor = gcd(commonFactor, gcdValues[i]);
          }

          if (commonFactor > 1) {
            anomalies.push(
              `Table ${qt.id}: all values share common factor ${commonFactor} (possible recompression artifact)`,
            );
          }

          // Check 2: Compare to standard JPEG luminance table
          if (qt.id === 0) {
            let matchCount = 0;
            let scaledMatchCount = 0;

            // Check for direct match or scaled version of standard table
            for (let i = 0; i < 64; i++) {
              if (qt.values[i] === STANDARD_LUMINANCE_QT[i]) matchCount++;
            }

            // Check for scaled standard table (quality != 50)
            if (STANDARD_LUMINANCE_QT[0] > 0 && qt.values[0] > 0) {
              const scale = qt.values[0] / STANDARD_LUMINANCE_QT[0];
              for (let i = 0; i < 64; i++) {
                const expected = Math.round(STANDARD_LUMINANCE_QT[i] * scale);
                if (Math.abs(qt.values[i] - expected) <= 1) scaledMatchCount++;
              }
            }

            lines.push(`  Standard table match: ${matchCount}/64 values`);
            lines.push(`  Scaled standard match: ${scaledMatchCount}/64 values`);

            if (matchCount === 64) {
              lines.push(`  [i] Exact standard luminance table (quality 50)`);
            } else if (scaledMatchCount > 58) {
              lines.push(`  [i] Close to scaled standard table (single compression likely)`);
            } else if (scaledMatchCount < 40) {
              anomalies.push(
                `Table ${qt.id}: QT values deviate significantly from any standard scaling — possible double compression or custom encoder`,
              );
            }
          }

          // Check 3: Look for periodic patterns in QT (sign of double quantization)
          // Double quantization creates staircase patterns: Q2[i] = ceil(Q1[i] * s) for some scale s
          const diffs: number[] = [];
          for (let i = 1; i < 64; i++) {
            diffs.push(Math.abs(qt.values[i] - qt.values[i - 1]));
          }
          const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          const diffVariance =
            diffs.reduce((a, b) => a + Math.pow(b - avgDiff, 2), 0) / diffs.length;

          if (diffVariance < 2.0 && qt.values[0] > 1) {
            anomalies.push(
              `Table ${qt.id}: unusually low variance in QT value differences (${diffVariance.toFixed(2)}) — values appear artificially smooth`,
            );
          }

          // Check 4: Count how many values are even vs odd
          let evenCount = 0;
          for (const v of qt.values) {
            if (v % 2 === 0) evenCount++;
          }
          const evenRatio = evenCount / 64;
          lines.push(`  Even/odd ratio: ${evenCount}/64 even (${(evenRatio * 100).toFixed(1)}%)`);

          if (evenRatio > 0.9) {
            anomalies.push(
              `Table ${qt.id}: ${(evenRatio * 100).toFixed(0)}% even values — abnormal ratio, possible recompression artifact`,
            );
          }

          // Check 5: Are there many values equal to 1? (very high quality, suspicious if file is small)
          const onesCount = qt.values.filter((v: number) => v === 1).length;
          if (onesCount > 32 && buf.length < 100000) {
            anomalies.push(
              `Table ${qt.id}: ${onesCount}/64 values are 1 (quality ~100) but file is only ${formatSize(buf.length)} — suspicious combination`,
            );
          }
        }

        lines.push("");
      }

      // Check for multiple DQT markers (some double compression flows produce duplicate DQTs)
      const dqtMarkers = markers.filter((m) => m.marker === 0xffdb);
      if (dqtMarkers.length > 1) {
        anomalies.push(
          `Multiple DQT markers found (${dqtMarkers.length}) — unusual, may indicate reprocessing`,
        );
      }

      // Check for SOF type: progressive JPEGs are sometimes produced by re-encoding
      const sofMarker = markers.find(
        (m) => m.marker >= 0xffc0 && m.marker <= 0xffc3,
      );
      if (sofMarker) {
        lines.push(`Compression type: ${sofMarker.name}`);
      }

      // Verdict
      lines.push("");
      lines.push("─".repeat(60));
      if (anomalies.length === 0) {
        lines.push("[OK] No double compression indicators detected");
      } else {
        lines.push(`[!] ${anomalies.length} potential double compression indicator(s):`);
        for (const a of anomalies) {
          lines.push(`    - ${a}`);
        }
        lines.push("");
        if (anomalies.length >= 3) {
          lines.push("Verdict: HIGH probability of double compression or reprocessing");
        } else if (anomalies.length >= 2) {
          lines.push("Verdict: MODERATE probability of double compression");
        } else {
          lines.push("Verdict: LOW probability — single indicator, may be benign");
        }
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 4: jpeg_quantization ───

const jpegQuantization: ToolDef = {
  name: "jpeg_quantization",
  description:
    "Quantization table analysis with quality estimation. Displays all quantization tables in 8x8 grid format and estimates the JPEG quality factor by comparing against the standard luminance/chrominance tables — essential for forensic analysis.",
  schema: {
    file_path: z.string().describe("Path to JPEG file for quantization analysis"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const qTables = extractQuantizationTables(markers);

      const lines: string[] = [
        `Quantization Table Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `Tables found: ${qTables.length}`,
        "",
      ];

      if (qTables.length === 0) {
        lines.push("[!] No quantization tables found — file may be corrupted or not a standard JPEG");
        return text(lines.join("\n"));
      }

      for (const qt of qTables) {
        const tableLabel =
          qt.id === 0 ? "Luminance (Y)" : qt.id === 1 ? "Chrominance (CbCr)" : `Custom Table ${qt.id}`;

        lines.push(`─── Table ${qt.id}: ${tableLabel} ───`);
        lines.push(`Precision: ${qt.precision === 0 ? "8-bit" : "16-bit"}`);

        // Display as 8x8 grid
        if (qt.values.length === 64) {
          lines.push("");
          lines.push("8x8 Quantization Matrix (zigzag order):");
          for (let row = 0; row < 8; row++) {
            const rowValues = qt.values
              .slice(row * 8, (row + 1) * 8)
              .map((v: number) => String(v).padStart(4))
              .join(" ");
            lines.push(`  [${rowValues} ]`);
          }

          // Quality estimation by comparing to standard table
          if (qt.id === 0) {
            // More precise quality estimation using the standard luminance table
            // JPEG quality Q and scale factor S relationship:
            //   S = (Q < 50) ? 5000/Q : 200 - 2*Q
            //   qt_value[i] = floor((standard[i] * S + 50) / 100)

            let bestQuality = 50;
            let bestError = Infinity;

            for (let q = 1; q <= 100; q++) {
              const s = q < 50 ? Math.floor(5000 / q) : 200 - 2 * q;
              let error = 0;
              for (let i = 0; i < 64; i++) {
                const expected = Math.max(
                  1,
                  Math.min(255, Math.floor((STANDARD_LUMINANCE_QT[i] * s + 50) / 100)),
                );
                error += Math.abs(qt.values[i] - expected);
              }
              if (error < bestError) {
                bestError = error;
                bestQuality = q;
              }
            }

            lines.push("");
            lines.push(`Estimated JPEG quality: ${bestQuality}%`);
            lines.push(`  Match error vs standard table: ${bestError} (lower = better match)`);

            if (bestError === 0) {
              lines.push(`  [i] Perfect match to standard luminance table at quality ${bestQuality}`);
            } else if (bestError < 64) {
              lines.push(`  [i] Close match to standard table (likely standard encoder)`);
            } else {
              lines.push(`  [i] Custom quantization table (non-standard encoder or modified)`);
            }

            // Compare individual values
            const s = bestQuality < 50 ? Math.floor(5000 / bestQuality) : 200 - 2 * bestQuality;
            let deviations = 0;
            for (let i = 0; i < 64; i++) {
              const expected = Math.max(
                1,
                Math.min(255, Math.floor((STANDARD_LUMINANCE_QT[i] * s + 50) / 100)),
              );
              if (qt.values[i] !== expected) deviations++;
            }
            lines.push(`  Deviating values: ${deviations}/64`);
          }

          // Table statistics
          const sum = qt.values.reduce((a: number, b: number) => a + b, 0);
          const avg = sum / 64;
          const min = Math.min(...qt.values);
          const max = Math.max(...qt.values);
          const variance =
            qt.values.reduce((a: number, v: number) => a + Math.pow(v - avg, 2), 0) / 64;

          lines.push("");
          lines.push("Table Statistics:");
          lines.push(`  Sum: ${sum}`);
          lines.push(`  Average: ${avg.toFixed(2)}`);
          lines.push(`  Min: ${min}, Max: ${max}`);
          lines.push(`  Variance: ${variance.toFixed(2)}`);
          lines.push(`  Rough quality estimate: ~${qt.estimatedQuality}%`);
        } else {
          lines.push(`  [!] Unexpected table size: ${qt.values.length} values (expected 64)`);
        }

        lines.push("");
      }

      // Compare tables if multiple exist
      if (qTables.length >= 2) {
        const t0 = qTables[0];
        const t1 = qTables[1];
        if (t0.values.length === 64 && t1.values.length === 64) {
          lines.push("─── Table Comparison (Luminance vs Chrominance) ───");
          let diffSum = 0;
          const ratios: number[] = [];
          for (let i = 0; i < 64; i++) {
            diffSum += Math.abs(t0.values[i] - t1.values[i]);
            if (t0.values[i] > 0) {
              ratios.push(t1.values[i] / t0.values[i]);
            }
          }
          const avgRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
          lines.push(`  Average absolute difference: ${(diffSum / 64).toFixed(2)}`);
          lines.push(`  Average chrominance/luminance ratio: ${avgRatio.toFixed(3)}`);

          if (Math.abs(avgRatio - 1.0) < 0.1) {
            lines.push(`  [i] Tables are nearly identical — unusual for standard JPEG`);
          }
        }
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 5: jpeg_exif_deep ───

const jpegExifDeep: ToolDef = {
  name: "jpeg_exif_deep",
  description:
    "Deep EXIF analysis including GPS coordinates, timestamps, software info, thumbnails, maker notes, and all IFD entries. Flags interesting fields for forensic investigation such as editing software traces, GPS location, and temporal inconsistencies.",
  schema: {
    file_path: z.string().describe("Path to JPEG file for deep EXIF analysis"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const app1Markers = markers.filter((m) => m.marker === 0xffe1);

      const lines: string[] = [
        `Deep EXIF Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `APP1 markers found: ${app1Markers.length}`,
        "",
      ];

      if (app1Markers.length === 0) {
        lines.push("[i] No EXIF data found (no APP1 markers)");
        lines.push("    This could indicate EXIF stripping (common in images shared online)");
        return text(lines.join("\n"));
      }

      const flags: string[] = [];

      for (let idx = 0; idx < app1Markers.length; idx++) {
        const app1 = app1Markers[idx];
        lines.push(`─── APP1 Marker #${idx + 1} (offset: 0x${app1.offset.toString(16)}, size: ${formatSize(app1.length)}) ───`);

        // Check if it's EXIF or XMP
        const headerStr = app1.data.subarray(0, 6).toString("ascii");
        const isExif = headerStr.startsWith("Exif");
        const isXmp = app1.data.subarray(0, 28).toString("ascii").includes("http://ns.adobe.com/xap");

        if (isXmp) {
          lines.push("Type: XMP (Extensible Metadata Platform)");
          // Show a snippet of XMP data
          const xmpStr = app1.data.toString("utf-8").substring(0, 500);
          lines.push("XMP preview (first 500 chars):");
          lines.push(xmpStr);
          lines.push("");
          flags.push("XMP metadata present — may contain editing history");
          continue;
        }

        if (!isExif) {
          lines.push(`Type: Unknown APP1 content (header: ${headerStr.replace(/[^\x20-\x7E]/g, ".")})`);
          continue;
        }

        lines.push("Type: EXIF");
        const exif = parseExifData(app1.data);

        // Display all tags
        lines.push("");
        lines.push("All EXIF Tags:");
        const tagEntries = Object.entries(exif.allTags);
        if (tagEntries.length === 0) {
          lines.push("  (no tags parsed)");
        }

        for (const [key, value] of tagEntries) {
          lines.push(`  ${key}: ${String(value)}`);
        }

        // Flag interesting fields
        lines.push("");
        lines.push("Forensic Flags:");

        // Camera/device info
        if (exif.make || exif.model) {
          lines.push(`  Camera: ${[exif.make, exif.model].filter(Boolean).join(" ")}`);
        }

        // Software
        if (exif.software) {
          lines.push(`  [!] Software: ${exif.software}`);
          const editSoftware = ["photoshop", "gimp", "lightroom", "paint", "acdsee", "snapseed", "afterlight"];
          const swLower = exif.software.toLowerCase();
          if (editSoftware.some((s) => swLower.includes(s))) {
            flags.push(`Image edited with: ${exif.software}`);
          }
        }

        // Timestamps
        if (exif.dateTime) {
          lines.push(`  DateTime: ${exif.dateTime}`);
        }

        // GPS
        if (exif.gpsLatitude !== undefined || exif.gpsLongitude !== undefined) {
          lines.push(`  [!] GPS Location: ${exif.gpsLatitude ?? "?"}, ${exif.gpsLongitude ?? "?"}`);
          flags.push("GPS coordinates present in EXIF");
        }

        // Artist/copyright
        if (exif.artist) {
          lines.push(`  Artist: ${exif.artist}`);
        }
        if (exif.copyright) {
          lines.push(`  Copyright: ${exif.copyright}`);
        }
        if (exif.description) {
          lines.push(`  Description: ${exif.description}`);
        }
        if (exif.userComment) {
          lines.push(`  User Comment: ${exif.userComment}`);
          flags.push("User comment present — may contain hidden data");
        }

        // Image dimensions from EXIF
        if (exif.imageWidth || exif.imageHeight) {
          lines.push(`  EXIF dimensions: ${exif.imageWidth ?? "?"}x${exif.imageHeight ?? "?"}`);
        }

        // Orientation
        if (exif.orientation && exif.orientation !== 1) {
          lines.push(`  [i] Non-default orientation: ${exif.orientation}`);
        }

        // Thumbnail detection
        lines.push("");
        lines.push("Thumbnail Analysis:");
        if (app1.data.length > 1000) {
          lines.push(`  APP1 size (${formatSize(app1.data.length)}) suggests embedded thumbnail`);

          // Look for embedded JPEG (FFD8) in APP1 data after EXIF header
          let thumbnailFound = false;
          for (let i = 8; i < app1.data.length - 1; i++) {
            if (app1.data[i] === 0xff && app1.data[i + 1] === 0xd8) {
              lines.push(`  [!] Embedded JPEG thumbnail found at offset ${i} within APP1`);

              // Find thumbnail end (FFD9)
              for (let j = i + 2; j < app1.data.length - 1; j++) {
                if (app1.data[j] === 0xff && app1.data[j + 1] === 0xd9) {
                  const thumbSize = j - i + 2;
                  lines.push(`  Thumbnail size: ${formatSize(thumbSize)}`);
                  thumbnailFound = true;
                  flags.push(`EXIF thumbnail present (${formatSize(thumbSize)})`);
                  break;
                }
              }
              break;
            }
          }

          if (exif.thumbnailOffset !== undefined && exif.thumbnailLength !== undefined) {
            lines.push(`  EXIF thumbnail pointer: offset=${exif.thumbnailOffset}, length=${exif.thumbnailLength}`);
          }

          if (!thumbnailFound) {
            lines.push("  No embedded JPEG thumbnail detected (large APP1 may contain other data)");
          }
        } else {
          lines.push("  APP1 too small for thumbnail — none expected");
        }

        lines.push("");
      }

      // Also check other APP markers for metadata
      const otherAppMarkers = markers.filter(
        (m) => m.marker >= 0xffe0 && m.marker <= 0xffef && m.marker !== 0xffe1,
      );
      if (otherAppMarkers.length > 0) {
        lines.push("─── Other APP Markers ───");
        for (const m of otherAppMarkers) {
          lines.push(`  ${m.name}: ${formatSize(m.length)} at offset 0x${m.offset.toString(16)}`);
        }
        lines.push("");
      }

      // Summary
      if (flags.length > 0) {
        lines.push("─── Forensic Summary ───");
        for (const f of flags) {
          lines.push(`  [!] ${f}`);
        }
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 6: jpeg_thumbnail_compare ───

const jpegThumbnailCompare: ToolDef = {
  name: "jpeg_thumbnail_compare",
  description:
    "Compare the EXIF thumbnail against the main JPEG image. A dimension or content mismatch between the thumbnail and the main image is a strong indicator that the main image was modified after capture while the original thumbnail was preserved — a common forensic artifact.",
  schema: {
    file_path: z.string().describe("Path to JPEG file for thumbnail comparison"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const app1Markers = markers.filter((m) => m.marker === 0xffe1);

      const lines: string[] = [
        `Thumbnail vs Main Image Comparison: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        "",
      ];

      // Get main image dimensions
      const pixelData = await getJpegPixels(filePath);
      const mainWidth = pixelData.width;
      const mainHeight = pixelData.height;
      lines.push(`Main image dimensions: ${mainWidth}x${mainHeight}`);
      lines.push(`Main image aspect ratio: ${(mainWidth / mainHeight).toFixed(4)}`);
      lines.push("");

      // Find thumbnail in EXIF APP1
      let thumbnailBuf: Buffer | null = null;
      let thumbnailSource = "none";

      for (const app1 of app1Markers) {
        const headerStr = app1.data.subarray(0, 4).toString("ascii");
        if (!headerStr.startsWith("Exif")) continue;

        // Search for embedded JPEG thumbnail (FFD8...FFD9) within APP1
        for (let i = 8; i < app1.data.length - 1; i++) {
          if (app1.data[i] === 0xff && app1.data[i + 1] === 0xd8) {
            // Found start of embedded JPEG, find end
            for (let j = i + 2; j < app1.data.length - 1; j++) {
              if (app1.data[j] === 0xff && app1.data[j + 1] === 0xd9) {
                thumbnailBuf = Buffer.from(app1.data.subarray(i, j + 2));
                thumbnailSource = `APP1 EXIF (offset ${i} within marker)`;
                break;
              }
            }
            if (thumbnailBuf) break;
          }
        }
        if (thumbnailBuf) break;
      }

      if (!thumbnailBuf) {
        lines.push("[i] No EXIF thumbnail found in this JPEG");
        lines.push("    Cannot perform thumbnail comparison");
        lines.push("");
        lines.push("Possible reasons:");
        lines.push("  - Image was saved without thumbnail (e.g., web optimization)");
        lines.push("  - EXIF data was stripped");
        lines.push("  - Image was never captured by a camera");
        return text(lines.join("\n"));
      }

      lines.push(`Thumbnail source: ${thumbnailSource}`);
      lines.push(`Thumbnail JPEG size: ${formatSize(thumbnailBuf.length)}`);
      lines.push("");

      // Decode thumbnail to get its dimensions
      try {
        const jpegJs = await import("jpeg-js");
        const thumbDecoded = jpegJs.decode(thumbnailBuf, {
          useTArray: true,
          formatAsRGBA: true,
          tolerantDecoding: true,
        });

        const thumbWidth = thumbDecoded.width;
        const thumbHeight = thumbDecoded.height;
        const thumbAspect = thumbWidth / thumbHeight;
        const mainAspect = mainWidth / mainHeight;

        lines.push(`Thumbnail dimensions: ${thumbWidth}x${thumbHeight}`);
        lines.push(`Thumbnail aspect ratio: ${thumbAspect.toFixed(4)}`);
        lines.push("");

        // Comparison analysis
        lines.push("─── Comparison Results ───");

        // Aspect ratio comparison
        const aspectDiff = Math.abs(mainAspect - thumbAspect);
        lines.push(`Aspect ratio difference: ${aspectDiff.toFixed(4)}`);

        if (aspectDiff > 0.05) {
          lines.push(`  [!] SIGNIFICANT aspect ratio mismatch`);
          lines.push(`      Main: ${mainAspect.toFixed(4)} vs Thumbnail: ${thumbAspect.toFixed(4)}`);
          lines.push(`      This strongly indicates the main image was CROPPED or RESIZED after capture`);
        } else if (aspectDiff > 0.01) {
          lines.push(`  [?] Minor aspect ratio difference (may be due to rounding)`);
        } else {
          lines.push(`  [OK] Aspect ratios match`);
        }

        // Scale factor
        const scaleX = mainWidth / thumbWidth;
        const scaleY = mainHeight / thumbHeight;
        lines.push("");
        lines.push(`Scale factor: ${scaleX.toFixed(2)}x (horizontal), ${scaleY.toFixed(2)}x (vertical)`);

        if (Math.abs(scaleX - scaleY) > 0.5) {
          lines.push(`  [!] Non-uniform scaling detected — possible manipulation`);
        }

        // Pixel content comparison (downsample main to thumbnail size and compare)
        const mainPixels = Buffer.from(pixelData.data);
        const thumbPixels = Buffer.from(thumbDecoded.data);

        // Simple average color comparison
        let mainR = 0, mainG = 0, mainB = 0;
        const mainTotal = mainWidth * mainHeight;
        for (let i = 0; i < mainTotal; i++) {
          mainR += mainPixels[i * 4];
          mainG += mainPixels[i * 4 + 1];
          mainB += mainPixels[i * 4 + 2];
        }
        mainR /= mainTotal;
        mainG /= mainTotal;
        mainB /= mainTotal;

        let thumbR = 0, thumbG = 0, thumbB = 0;
        const thumbTotal = thumbWidth * thumbHeight;
        for (let i = 0; i < thumbTotal; i++) {
          thumbR += thumbPixels[i * 4];
          thumbG += thumbPixels[i * 4 + 1];
          thumbB += thumbPixels[i * 4 + 2];
        }
        thumbR /= thumbTotal;
        thumbG /= thumbTotal;
        thumbB /= thumbTotal;

        const colorDiff = Math.sqrt(
          Math.pow(mainR - thumbR, 2) +
          Math.pow(mainG - thumbG, 2) +
          Math.pow(mainB - thumbB, 2),
        );

        lines.push("");
        lines.push("Average Color Comparison:");
        lines.push(`  Main image: R=${mainR.toFixed(1)}, G=${mainG.toFixed(1)}, B=${mainB.toFixed(1)}`);
        lines.push(`  Thumbnail:  R=${thumbR.toFixed(1)}, G=${thumbG.toFixed(1)}, B=${thumbB.toFixed(1)}`);
        lines.push(`  Euclidean distance: ${colorDiff.toFixed(2)}`);

        if (colorDiff > 30) {
          lines.push(`  [!] SIGNIFICANT color difference — images may show different content`);
          lines.push(`      The thumbnail likely belongs to the ORIGINAL image before modification`);
        } else if (colorDiff > 10) {
          lines.push(`  [?] Moderate color difference — could indicate color adjustments`);
        } else {
          lines.push(`  [OK] Colors are consistent between thumbnail and main image`);
        }

        // Overall verdict
        lines.push("");
        lines.push("─── Verdict ───");
        const issues: string[] = [];
        if (aspectDiff > 0.05) issues.push("aspect ratio mismatch");
        if (Math.abs(scaleX - scaleY) > 0.5) issues.push("non-uniform scaling");
        if (colorDiff > 30) issues.push("significant color difference");

        if (issues.length === 0) {
          lines.push("[OK] Thumbnail and main image appear consistent — no manipulation indicators");
        } else {
          lines.push(`[!] MANIPULATION INDICATORS: ${issues.join(", ")}`);
          lines.push("    The main image was likely modified after the thumbnail was created");
        }
      } catch (thumbErr) {
        lines.push(`[!] Failed to decode thumbnail: ${thumbErr instanceof Error ? thumbErr.message : String(thumbErr)}`);
        lines.push("    Thumbnail may be corrupted or in a non-standard format");
        lines.push("");
        lines.push("Thumbnail hex dump (first 64 bytes):");
        lines.push(hexDump(thumbnailBuf, 0, 64));
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Tool 7: jpeg_comment ───

const jpegComment: ToolDef = {
  name: "jpeg_comment",
  description:
    "Extract and analyze JPEG COM (comment) markers. Checks for hidden data patterns, unusually large comment segments, and high-entropy content that could indicate steganographic payloads concealed in comment fields.",
  schema: {
    file_path: z.string().describe("Path to JPEG file for comment analysis"),
  },
  execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      ensureJpeg(buf, filePath);

      const markers = parseJpegMarkers(buf);
      const comMarkers = markers.filter((m) => m.marker === 0xfffe);
      const comments = extractComments(markers);

      const lines: string[] = [
        `JPEG Comment (COM) Analysis: ${filePath}`,
        `File size: ${formatSize(buf.length)}`,
        `COM markers found: ${comMarkers.length}`,
        "",
      ];

      if (comMarkers.length === 0) {
        lines.push("[i] No COM markers found in this JPEG");
        return text(lines.join("\n"));
      }

      const flags: string[] = [];

      for (let i = 0; i < comMarkers.length; i++) {
        const com = comMarkers[i];
        const commentText = comments[i] ?? "";

        lines.push(`─── COM Marker #${i + 1} ───`);
        lines.push(`Offset: 0x${com.offset.toString(16).padStart(8, "0")}`);
        lines.push(`Segment size: ${formatSize(com.length)} (${com.length} bytes)`);
        lines.push(`Data size: ${formatSize(com.data.length)} (${com.data.length} bytes)`);
        lines.push("");

        // Text content
        lines.push("Text Content:");
        if (commentText.length === 0) {
          lines.push("  (empty or binary data)");
        } else if (commentText.length <= 500) {
          lines.push(`  "${commentText}"`);
        } else {
          lines.push(`  "${commentText.substring(0, 500)}..." (truncated, ${commentText.length} chars total)`);
        }
        lines.push("");

        // Entropy analysis of comment data
        const commentEntropy = shannonEntropy(com.data);
        lines.push(`Entropy: ${commentEntropy.toFixed(4)} bits`);

        if (commentEntropy > 7.0) {
          lines.push(`  [!] Very high entropy — data appears random/encrypted`);
          flags.push(`COM #${i + 1}: high entropy (${commentEntropy.toFixed(2)}) suggests hidden/encrypted data`);
        } else if (commentEntropy > 5.5) {
          lines.push(`  [?] Moderately high entropy — could be compressed data or encoded text`);
        } else if (commentEntropy < 1.0 && com.data.length > 10) {
          lines.push(`  [?] Very low entropy — repetitive pattern`);
        } else {
          lines.push(`  [OK] Entropy consistent with text content`);
        }

        // Size analysis
        if (com.data.length > 10000) {
          lines.push(`  [!] Unusually large COM segment (${formatSize(com.data.length)})`);
          flags.push(`COM #${i + 1}: unusually large (${formatSize(com.data.length)}) — may hide payload`);
        } else if (com.data.length > 1000) {
          lines.push(`  [?] Moderately large COM segment`);
        }

        // Check for hidden data patterns
        lines.push("");
        lines.push("Pattern Analysis:");

        // Check for Base64
        const b64Regex = /^[A-Za-z0-9+/=\s]+$/;
        const trimmedComment = commentText.trim();
        if (trimmedComment.length > 20 && b64Regex.test(trimmedComment)) {
          lines.push(`  [!] Content appears to be Base64 encoded`);
          flags.push(`COM #${i + 1}: possible Base64 encoded data`);

          // Try to decode and check
          try {
            const decoded = Buffer.from(trimmedComment.replace(/\s/g, ""), "base64");
            if (decoded.length > 0) {
              const decodedEntropy = shannonEntropy(decoded);
              lines.push(`      Decoded size: ${formatSize(decoded.length)}`);
              lines.push(`      Decoded entropy: ${decodedEntropy.toFixed(4)}`);

              // Check for magic bytes in decoded data
              const fmt = detectImageFormat(decoded);
              if (fmt !== "unknown") {
                lines.push(`      [!] Decoded data is a ${fmt.toUpperCase()} image!`);
                flags.push(`COM #${i + 1}: Base64 contains embedded ${fmt} image`);
              }
            }
          } catch {
            // Not valid Base64, ignore
          }
        }

        // Check for hex-encoded data
        const hexRegex = /^[0-9a-fA-F\s]+$/;
        if (trimmedComment.length > 20 && hexRegex.test(trimmedComment)) {
          lines.push(`  [!] Content appears to be hex-encoded`);
          flags.push(`COM #${i + 1}: possible hex-encoded data`);
        }

        // Check for null bytes (binary data mixed with text)
        let nullCount = 0;
        let nonPrintable = 0;
        for (const byte of com.data) {
          if (byte === 0x00) nullCount++;
          if (byte < 0x20 && byte !== 0x0a && byte !== 0x0d && byte !== 0x09) nonPrintable++;
        }

        if (nullCount > 0) {
          lines.push(`  [?] Contains ${nullCount} null bytes — may be binary data or padded text`);
        }

        const nonPrintableRatio = nonPrintable / com.data.length;
        if (nonPrintableRatio > 0.3) {
          lines.push(`  [!] ${(nonPrintableRatio * 100).toFixed(1)}% non-printable characters — likely binary data`);
          flags.push(`COM #${i + 1}: ${(nonPrintableRatio * 100).toFixed(0)}% non-printable chars`);
        }

        // Check for common stego tool signatures
        const sigPatterns = [
          { name: "OpenStego", pattern: "openstego" },
          { name: "SilentEye", pattern: "silenteye" },
          { name: "Steghide", pattern: "steghide" },
          { name: "OutGuess", pattern: "outguess" },
          { name: "JPEG Hide and Seek", pattern: "jphs" },
        ];

        const lowerComment = commentText.toLowerCase();
        for (const sig of sigPatterns) {
          if (lowerComment.includes(sig.pattern)) {
            lines.push(`  [!] Stego tool signature detected: ${sig.name}`);
            flags.push(`COM #${i + 1}: ${sig.name} signature found`);
          }
        }

        // Hex dump for binary/large comments
        if (nonPrintableRatio > 0.1 || com.data.length > 200) {
          lines.push("");
          lines.push("Hex dump (first 128 bytes):");
          lines.push(hexDump(com.data, 0, Math.min(128, com.data.length)));
        }

        // Block entropy for large comments
        if (com.data.length > 256) {
          const blockAnalysis = blockEntropy(com.data, 64);
          lines.push("");
          lines.push(`Block entropy analysis (64-byte blocks, ${blockAnalysis.blocks.length} blocks):`);
          lines.push(`  Average block entropy: ${blockAnalysis.averageBlockEntropy.toFixed(4)}`);
          lines.push(`  High entropy blocks (>= 7.0): ${blockAnalysis.highEntropyBlocks}/${blockAnalysis.blocks.length}`);

          if (blockAnalysis.highEntropyBlocks > blockAnalysis.blocks.length * 0.8) {
            flags.push(`COM #${i + 1}: majority of blocks have high entropy`);
          }
        }

        lines.push("");
      }

      // Summary
      lines.push("─── Summary ───");
      lines.push(`Total COM markers: ${comMarkers.length}`);
      const totalComSize = comMarkers.reduce((sum, m) => sum + m.data.length, 0);
      lines.push(`Total comment data: ${formatSize(totalComSize)}`);

      if (flags.length > 0) {
        lines.push("");
        lines.push("Forensic Flags:");
        for (const f of flags) {
          lines.push(`  [!] ${f}`);
        }
      } else {
        lines.push("[OK] No suspicious patterns detected in comment data");
      }

      return text(lines.join("\n"));
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

// ─── Export All Tools ───

export const jpegTools: ToolDef[] = [
  jpegStructure,
  jpegDctHistogram,
  jpegDoubleCompression,
  jpegQuantization,
  jpegExifDeep,
  jpegThumbnailCompare,
  jpegComment,
];
