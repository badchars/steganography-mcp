import { z } from "zod";
import type { ToolDef } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump } from "../utils/binary.js";
import { shannonEntropy, blockEntropy } from "../utils/stats.js";
import {
  parseAvi,
  parseRiffChunks,
  extractFrameData,
  findAviAppendedData,
  type AviParseResult,
  type RiffChunk,
  type AviIndex,
} from "../utils/avi-parser.js";

// ─── Helpers ───

/** Load and parse an AVI file, returning both the raw buffer and parse result */
async function loadAviFile(filePath: string): Promise<{ buf: Buffer; avi: AviParseResult }> {
  const buf = await readFileInput(filePath);
  const avi = parseAvi(buf);
  return { buf, avi };
}

/** Analyze LSB distribution of raw frame bytes */
function frameLsbAnalysis(frameData: Buffer): {
  totalBytes: number;
  lsbOnes: number;
  lsbBalance: number;
  entropy: number;
  verdict: "clean" | "suspicious" | "likely_stego";
} {
  let lsbOnes = 0;
  for (let i = 0; i < frameData.length; i++) {
    if (frameData[i] & 1) lsbOnes++;
  }
  const lsbBalance = frameData.length > 0 ? lsbOnes / frameData.length : 0;
  const entropy = shannonEntropy(frameData);

  // A perfectly balanced LSB (very close to 0.5) in raw pixel data is suspicious
  const balanceDeviation = Math.abs(lsbBalance - 0.5);
  const verdict: "clean" | "suspicious" | "likely_stego" =
    balanceDeviation < 0.005
      ? "likely_stego"
      : balanceDeviation < 0.02
        ? "suspicious"
        : "clean";

  return {
    totalBytes: frameData.length,
    lsbOnes,
    lsbBalance: parseFloat(lsbBalance.toFixed(6)),
    entropy: parseFloat(entropy.toFixed(4)),
    verdict,
  };
}

/** Build a tree-view string of RIFF chunks recursively */
function chunkTreeView(chunks: RiffChunk[], indent: number = 0): string {
  const lines: string[] = [];
  const prefix = "  ".repeat(indent);

  for (const chunk of chunks) {
    const sizeStr = chunk.size.toLocaleString();
    lines.push(`${prefix}[${chunk.fourCC}] offset=0x${chunk.offset.toString(16)} size=${sizeStr}`);
    if (chunk.children) {
      lines.push(...chunkTreeView(chunk.children, indent + 1).split("\n").filter((l) => l.length > 0));
    }
  }

  return lines.join("\n");
}

// ─── 1. video_detect ───

const videoDetect: ToolDef = {
  name: "video_detect",
  description:
    "Auto-detect steganography in an AVI video. Runs LSB analysis on the first few frames, checks for appended data after the RIFF container, and analyzes frame size variance for anomalies.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, avi } = await loadAviFile(filePath);

      const findings: string[] = [];

      // LSB analysis on first N frames
      const maxFrames = Math.min(10, avi.frameCount);
      const frames = extractFrameData(buf, avi.index, Array.from({ length: maxFrames }, (_, i) => i));
      const frameLsbResults: Array<Record<string, unknown>> = [];

      for (let i = 0; i < frames.length; i++) {
        const lsb = frameLsbAnalysis(frames[i]);
        frameLsbResults.push({ frame: i, ...lsb });
        if (lsb.verdict !== "clean") {
          findings.push(`Frame ${i} LSB: ${lsb.verdict} (balance=${lsb.lsbBalance})`);
        }
      }

      // Appended data check
      const appended = findAviAppendedData(buf);
      let appendedInfo: Record<string, unknown> = { found: false };
      if (appended) {
        appendedInfo = {
          found: true,
          offset: appended.offset,
          size: appended.size,
          entropy: parseFloat(shannonEntropy(appended.data).toFixed(4)),
        };
        findings.push(`Appended data after RIFF: ${appended.size} bytes at offset 0x${appended.offset.toString(16)}`);
      }

      // Frame size variance analysis
      const videoEntries = avi.index.filter(
        (e) => e.chunkId.endsWith("dc") || e.chunkId.endsWith("db"),
      );
      const frameSizes = videoEntries.map((e) => e.size);
      let sizeVariance = 0;
      let meanSize = 0;

      if (frameSizes.length > 0) {
        meanSize = frameSizes.reduce((a, b) => a + b, 0) / frameSizes.length;
        sizeVariance = frameSizes.reduce((a, s) => a + Math.pow(s - meanSize, 2), 0) / frameSizes.length;
        const cv = meanSize > 0 ? Math.sqrt(sizeVariance) / meanSize : 0;

        // Very low variance in compressed video may indicate replaced frames
        if (cv < 0.01 && frameSizes.length > 5) {
          findings.push(`Frame sizes suspiciously uniform (CV=${cv.toFixed(6)})`);
        }
      }

      // Overall entropy of file
      const overallEntropy = shannonEntropy(buf);

      const overallVerdict =
        findings.length === 0
          ? "clean"
          : findings.length <= 2
            ? "suspicious"
            : "likely_stego";

      return json({
        file: filePath,
        format: "avi",
        fileSize: buf.length,
        dimensions: avi.header
          ? { width: avi.header.width, height: avi.header.height }
          : null,
        frameCount: avi.frameCount,
        overallEntropy: parseFloat(overallEntropy.toFixed(4)),
        frameLsbAnalysis: frameLsbResults,
        frameSizeAnalysis: {
          totalFrames: frameSizes.length,
          meanSize: parseFloat(meanSize.toFixed(2)),
          variance: parseFloat(sizeVariance.toFixed(2)),
          minSize: frameSizes.length > 0 ? Math.min(...frameSizes) : 0,
          maxSize: frameSizes.length > 0 ? Math.max(...frameSizes) : 0,
        },
        appendedData: appendedInfo,
        findings,
        overallVerdict,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 2. video_frame_lsb ───

const videoFrameLsb: ToolDef = {
  name: "video_frame_lsb",
  description:
    "LSB analysis of a specific video frame. Extracts the raw pixel data from the given frame index and checks LSB distribution, balance, and entropy.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
    frame: z
      .number()
      .optional()
      .describe("Frame index to analyze (default: 0)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const frameIdx = (args.frame as number | undefined) ?? 0;
      const { buf, avi } = await loadAviFile(filePath);

      if (frameIdx < 0 || frameIdx >= avi.frameCount) {
        return text(`Error: Frame index ${frameIdx} out of range (0-${avi.frameCount - 1})`);
      }

      const frames = extractFrameData(buf, avi.index, [frameIdx]);
      if (frames.length === 0) {
        return text(`Error: Could not extract frame ${frameIdx}`);
      }

      const frameData = frames[0];
      const lsb = frameLsbAnalysis(frameData);

      // Per-byte LSB histogram (0 vs 1 count)
      const lsbBits: number[] = [];
      for (let i = 0; i < frameData.length; i++) {
        lsbBits.push(frameData[i] & 1);
      }

      // Block-level entropy analysis of the frame
      const blockEnt = blockEntropy(frameData, Math.max(256, Math.floor(frameData.length / 16)));

      // Byte frequency for first 4096 bytes of LSB stream
      const lsbByteCount = Math.min(Math.floor(lsbBits.length / 8), 4096);
      const lsbBytes = Buffer.alloc(lsbByteCount);
      for (let i = 0; i < lsbByteCount; i++) {
        let byte = 0;
        for (let b = 0; b < 8; b++) {
          byte = (byte << 1) | (lsbBits[i * 8 + b] ?? 0);
        }
        lsbBytes[i] = byte;
      }
      const lsbEntropy = shannonEntropy(lsbBytes);

      return json({
        file: filePath,
        frame: frameIdx,
        frameSize: frameData.length,
        lsbAnalysis: lsb,
        lsbStreamEntropy: parseFloat(lsbEntropy.toFixed(4)),
        lsbStreamNote:
          lsbEntropy > 7.5
            ? "LSB stream has near-maximum entropy — possible encrypted/compressed payload"
            : lsbEntropy > 6.5
              ? "LSB stream has elevated entropy — suspicious"
              : "LSB stream entropy appears normal",
        blockEntropy: {
          averageBlockEntropy: parseFloat(blockEnt.averageBlockEntropy.toFixed(4)),
          highEntropyBlocks: blockEnt.highEntropyBlocks,
          totalBlocks: blockEnt.blocks.length,
        },
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 3. video_frame_extract ───

const videoFrameExtract: ToolDef = {
  name: "video_frame_extract",
  description:
    "Extract LSB data from video frames as bytes. Collects the least significant bit from each byte of the specified frames and assembles them into a byte stream with hex dump and text preview.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
    frames: z
      .string()
      .optional()
      .describe("Comma-separated frame indices to extract from (default: '0')"),
    max_bytes: z
      .number()
      .optional()
      .describe("Maximum bytes to extract (default: 4096)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const framesStr = (args.frames as string | undefined) ?? "0";
      const maxBytes = (args.max_bytes as number | undefined) ?? 4096;
      const { buf, avi } = await loadAviFile(filePath);

      const frameIndices = framesStr
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0 && n < avi.frameCount);

      if (frameIndices.length === 0) {
        return text("Error: No valid frame indices provided");
      }

      const frameBuffers = extractFrameData(buf, avi.index, frameIndices);

      // Collect LSB bits from all frames
      const bits: number[] = [];
      for (const frameBuf of frameBuffers) {
        for (let i = 0; i < frameBuf.length && bits.length < maxBytes * 8; i++) {
          bits.push(frameBuf[i] & 1);
        }
        if (bits.length >= maxBytes * 8) break;
      }

      // Convert bits to bytes
      const byteCount = Math.min(Math.floor(bits.length / 8), maxBytes);
      const extracted = Buffer.alloc(byteCount);
      for (let i = 0; i < byteCount; i++) {
        let byte = 0;
        for (let b = 0; b < 8; b++) {
          byte = (byte << 1) | (bits[i * 8 + b] ?? 0);
        }
        extracted[i] = byte;
      }

      // Text preview
      let textContent: string;
      try {
        const decoded = extracted.toString("utf-8");
        const printable = decoded.replace(/[^\x20-\x7E\n\r\t]/g, "");
        const printableRatio = decoded.length > 0 ? printable.length / decoded.length : 0;
        textContent =
          printableRatio > 0.5
            ? `[${(printableRatio * 100).toFixed(1)}% printable]\n${decoded.substring(0, 2000)}`
            : `[Only ${(printableRatio * 100).toFixed(1)}% printable — likely binary/encrypted data]`;
      } catch {
        textContent = "[Not valid UTF-8]";
      }

      const hexPreview = hexDump(extracted, 0, Math.min(256, extracted.length));
      const entropy = shannonEntropy(extracted);

      return json({
        file: filePath,
        framesUsed: frameIndices,
        extractedBytes: extracted.length,
        bitsCollected: bits.length,
        entropy: parseFloat(entropy.toFixed(4)),
        textContent,
        hexDump: hexPreview,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 4. video_frame_compare ───

const videoFrameCompare: ToolDef = {
  name: "video_frame_compare",
  description:
    "Compare adjacent video frames for pixel-level anomalies. Computes byte-level diff, Mean Squared Error (MSE), and PSNR between two frames to detect steganographic modifications.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
    frame_a: z
      .number()
      .optional()
      .describe("First frame index (default: 0)"),
    frame_b: z
      .number()
      .optional()
      .describe("Second frame index (default: 1)"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const frameA = (args.frame_a as number | undefined) ?? 0;
      const frameB = (args.frame_b as number | undefined) ?? 1;
      const { buf, avi } = await loadAviFile(filePath);

      if (frameA < 0 || frameA >= avi.frameCount) {
        return text(`Error: Frame A index ${frameA} out of range (0-${avi.frameCount - 1})`);
      }
      if (frameB < 0 || frameB >= avi.frameCount) {
        return text(`Error: Frame B index ${frameB} out of range (0-${avi.frameCount - 1})`);
      }

      const frames = extractFrameData(buf, avi.index, [frameA, frameB]);
      if (frames.length < 2) {
        return text("Error: Could not extract both frames");
      }

      const dataA = frames[0];
      const dataB = frames[1];
      const compareLen = Math.min(dataA.length, dataB.length);

      let identicalBytes = 0;
      let differentBytes = 0;
      let totalSquaredDiff = 0;
      let maxDiff = 0;
      let lsbOnlyDiffs = 0;
      const diffDistribution = new Array(256).fill(0);

      for (let i = 0; i < compareLen; i++) {
        const diff = Math.abs(dataA[i] - dataB[i]);
        if (diff === 0) {
          identicalBytes++;
        } else {
          differentBytes++;
          totalSquaredDiff += diff * diff;
          if (diff > maxDiff) maxDiff = diff;
          if (diff === 1) lsbOnlyDiffs++;
          diffDistribution[Math.min(diff, 255)]++;
        }
      }

      const mse = compareLen > 0 ? totalSquaredDiff / compareLen : 0;
      const psnr = mse > 0 ? 10 * Math.log10((255 * 255) / mse) : Infinity;
      const lsbRatio = differentBytes > 0 ? lsbOnlyDiffs / differentBytes : 0;

      return json({
        file: filePath,
        frameA,
        frameB,
        frameSizeA: dataA.length,
        frameSizeB: dataB.length,
        comparedBytes: compareLen,
        identicalBytes,
        differentBytes,
        differencePercent: `${((differentBytes / compareLen) * 100).toFixed(4)}%`,
        maxDifference: maxDiff,
        mse: parseFloat(mse.toFixed(6)),
        psnr: psnr === Infinity ? "Infinity (identical)" : `${psnr.toFixed(2)} dB`,
        lsbAnalysis: {
          lsbOnlyDiffs,
          lsbDiffRatio: parseFloat(lsbRatio.toFixed(4)),
          verdict:
            lsbRatio > 0.9
              ? "likely_lsb_steganography"
              : lsbRatio > 0.5
                ? "suspicious"
                : "not_lsb_pattern",
        },
        sizeMismatch: dataA.length !== dataB.length
          ? `Frame sizes differ: ${dataA.length} vs ${dataB.length}`
          : null,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 5. video_inter_frame ───

const videoInterFrame: ToolDef = {
  name: "video_inter_frame",
  description:
    "Analyze frame types from the AVI idx1 index. Reports keyframe vs delta frame distribution, size statistics per type, and flag anomalies that may indicate steganographic manipulation.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, avi } = await loadAviFile(filePath);

      const AVIIF_KEYFRAME = 0x10;

      const videoEntries = avi.index.filter(
        (e) => e.chunkId.endsWith("dc") || e.chunkId.endsWith("db"),
      );

      const keyframes: AviIndex[] = [];
      const deltaFrames: AviIndex[] = [];

      for (const entry of videoEntries) {
        if (entry.flags & AVIIF_KEYFRAME) {
          keyframes.push(entry);
        } else {
          deltaFrames.push(entry);
        }
      }

      const keyframeSizes = keyframes.map((e) => e.size);
      const deltaSizes = deltaFrames.map((e) => e.size);

      const sizeStats = (sizes: number[]) => {
        if (sizes.length === 0) return { count: 0, min: 0, max: 0, mean: 0, stdDev: 0 };
        const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
        const variance = sizes.reduce((a, s) => a + Math.pow(s - mean, 2), 0) / sizes.length;
        return {
          count: sizes.length,
          min: Math.min(...sizes),
          max: Math.max(...sizes),
          mean: parseFloat(mean.toFixed(2)),
          stdDev: parseFloat(Math.sqrt(variance).toFixed(2)),
        };
      };

      // Keyframe interval analysis
      const keyframeIndices = videoEntries
        .map((e, i) => ({ entry: e, index: i }))
        .filter((x) => x.entry.flags & AVIIF_KEYFRAME)
        .map((x) => x.index);

      const keyframeIntervals: number[] = [];
      for (let i = 1; i < keyframeIndices.length; i++) {
        keyframeIntervals.push(keyframeIndices[i] - keyframeIndices[i - 1]);
      }

      let intervalRegularity = "N/A";
      if (keyframeIntervals.length > 1) {
        const avgInterval = keyframeIntervals.reduce((a, b) => a + b, 0) / keyframeIntervals.length;
        const intervalVariance =
          keyframeIntervals.reduce((a, v) => a + Math.pow(v - avgInterval, 2), 0) / keyframeIntervals.length;
        const cv = avgInterval > 0 ? Math.sqrt(intervalVariance) / avgInterval : 0;
        intervalRegularity = cv < 0.1 ? "regular" : cv < 0.3 ? "semi-regular" : "irregular";
      }

      // Flag analysis: check for unusual flag values
      const flagHistogram = new Map<number, number>();
      for (const entry of videoEntries) {
        flagHistogram.set(entry.flags, (flagHistogram.get(entry.flags) ?? 0) + 1);
      }
      const flagDistribution = Array.from(flagHistogram.entries()).map(([flags, count]) => ({
        flags: `0x${flags.toString(16)}`,
        isKeyframe: (flags & AVIIF_KEYFRAME) !== 0,
        count,
      }));

      return json({
        file: filePath,
        totalVideoFrames: videoEntries.length,
        keyframes: sizeStats(keyframeSizes),
        deltaFrames: sizeStats(deltaSizes),
        keyframeRatio: videoEntries.length > 0
          ? parseFloat((keyframes.length / videoEntries.length).toFixed(4))
          : 0,
        keyframeIntervals: {
          intervals: keyframeIntervals.length > 0
            ? keyframeIntervals.slice(0, 50)
            : [],
          regularity: intervalRegularity,
        },
        flagDistribution,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 6. video_metadata ───

const videoMetadata: ToolDef = {
  name: "video_metadata",
  description:
    "Extract metadata from an AVI video file. Reports dimensions, FPS, codec, stream info, duration, and file-level properties.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const { buf, avi } = await loadAviFile(filePath);

      const fps = avi.header && avi.header.microSecPerFrame > 0
        ? parseFloat((1_000_000 / avi.header.microSecPerFrame).toFixed(3))
        : null;

      const duration = avi.header && avi.header.microSecPerFrame > 0
        ? parseFloat(((avi.header.totalFrames * avi.header.microSecPerFrame) / 1_000_000).toFixed(3))
        : null;

      const streamDetails = avi.streams.map((s, i) => ({
        index: i,
        type: s.type.trim(),
        codec: s.codec.trim(),
        fps: s.scale > 0 ? parseFloat((s.rate / s.scale).toFixed(3)) : null,
        length: s.length,
        sampleSize: s.sampleSize,
      }));

      return json({
        file: filePath,
        format: "avi",
        fileSize: buf.length,
        dimensions: avi.header
          ? { width: avi.header.width, height: avi.header.height }
          : null,
        fps,
        duration: duration !== null ? `${duration}s` : null,
        totalFrames: avi.header?.totalFrames ?? avi.frameCount,
        maxBytesPerSec: avi.header?.maxBytesPerSec ?? null,
        streamCount: avi.streams.length,
        streams: streamDetails,
        hasAudio: avi.hasAudio,
        indexEntries: avi.index.length,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 7. video_structure ───

const videoStructure: ToolDef = {
  name: "video_structure",
  description:
    "Visualize the AVI/RIFF chunk structure as a tree. Shows all chunks, their FourCC codes, offsets, and sizes for forensic analysis of the container structure.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);

      // Validate RIFF/AVI header
      if (buf.length < 12) {
        return text("Error: File too small to be a valid AVI");
      }
      if (buf.subarray(0, 4).toString("ascii") !== "RIFF") {
        return text("Error: Not a RIFF file");
      }

      const riffSize = buf.readUInt32LE(4);
      const formType = buf.subarray(8, 12).toString("ascii");
      const chunks = parseRiffChunks(buf);

      // Count total chunks recursively
      const countChunks = (chunkList: RiffChunk[]): number => {
        let count = chunkList.length;
        for (const c of chunkList) {
          if (c.children) count += countChunks(c.children);
        }
        return count;
      };

      const treeView = chunkTreeView(chunks);
      const totalChunks = countChunks(chunks);

      // Check for data beyond RIFF container
      const expectedEnd = 8 + riffSize;
      const extraBytes = buf.length > expectedEnd ? buf.length - expectedEnd : 0;

      return json({
        file: filePath,
        fileSize: buf.length,
        riffSize,
        formType: formType.trim(),
        totalChunks,
        extraBytesAfterRiff: extraBytes,
        structure: treeView,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── 8. video_eof_data ───

const videoEofData: ToolDef = {
  name: "video_eof_data",
  description:
    "Detect and analyze data appended after the AVI RIFF container EOF. Reports the offset, size, entropy, and hex dump of any trailing data that may contain hidden payloads.",
  schema: {
    file_path: z.string().describe("Path to AVI video file"),
  },
  async execute(args) {
    try {
      const filePath = args.file_path as string;
      const buf = await readFileInput(filePath);
      const appended = findAviAppendedData(buf);

      if (!appended) {
        return json({
          file: filePath,
          fileSize: buf.length,
          appendedData: false,
          message: "No data found after RIFF container boundary.",
        });
      }

      const entropy = shannonEntropy(appended.data);

      // Try UTF-8 decode
      let textPreview: string | null = null;
      const sample = appended.data.subarray(0, Math.min(500, appended.data.length));
      const decoded = sample.toString("utf-8");
      const printable = decoded.replace(/[^\x20-\x7E\n\r\t]/g, "");
      if (sample.length > 0 && printable.length > sample.length * 0.5) {
        textPreview = printable.substring(0, 500);
      }

      // Block entropy to detect structured vs random data
      const blockEnt = blockEntropy(appended.data, Math.max(256, Math.floor(appended.data.length / 8)));

      // Check if appended data starts with a known signature
      let embeddedFormat: string | null = null;
      if (appended.data.length >= 4) {
        const magic = appended.data.subarray(0, 4).toString("ascii");
        if (magic === "RIFF") embeddedFormat = "RIFF (AVI/WAV)";
        else if (appended.data[0] === 0x89 && magic.substring(1) === "PNG") embeddedFormat = "PNG";
        else if (appended.data[0] === 0xff && appended.data[1] === 0xd8) embeddedFormat = "JPEG";
        else if (magic === "PK\x03\x04") embeddedFormat = "ZIP/DOCX/JAR";
        else if (magic.substring(0, 3) === "GIF") embeddedFormat = "GIF";
        else if (appended.data[0] === 0x25 && magic.substring(1, 4) === "PDF") embeddedFormat = "PDF";
      }

      const hex = hexDump(appended.data, 0, Math.min(256, appended.data.length));

      return json({
        file: filePath,
        fileSize: buf.length,
        appendedData: true,
        offset: appended.offset,
        size: appended.size,
        offsetHex: `0x${appended.offset.toString(16)}`,
        entropy: parseFloat(entropy.toFixed(4)),
        entropyNote:
          entropy > 7.5
            ? "Near-maximum entropy — likely encrypted or compressed"
            : entropy > 6.0
              ? "Elevated entropy — possible compressed data"
              : "Moderate entropy — may contain structured data",
        embeddedFormat,
        blockEntropy: {
          averageBlockEntropy: parseFloat(blockEnt.averageBlockEntropy.toFixed(4)),
          highEntropyBlocks: blockEnt.highEntropyBlocks,
          totalBlocks: blockEnt.blocks.length,
        },
        textPreview,
        hexDump: hex,
      });
    } catch (e) {
      return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── Export ───

export const videoTools: ToolDef[] = [
  videoDetect,
  videoFrameLsb,
  videoFrameExtract,
  videoFrameCompare,
  videoInterFrame,
  videoMetadata,
  videoStructure,
  videoEofData,
];
