import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump } from "../utils/binary.js";
import { shannonEntropy, blockEntropy } from "../utils/stats.js";
import {
  parseMp3,
  parseId3v1,
  parseId3v2,
  findMp3Frames,
  type Mp3ParseResult,
  type Mp3FrameHeader,
  type Id3v2Frame,
} from "../utils/mp3-parser.js";

// ─── Helpers ───

/** Compute standard deviation */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Compute mean */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Format duration as mm:ss.ms */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(2).padStart(5, "0")}`;
}

/** Known ID3v2 frame IDs (v2.3/v2.4) */
const KNOWN_FRAME_IDS = new Set([
  "AENC", "APIC", "COMM", "COMR", "ENCR", "EQUA", "ETCO", "GEOB",
  "GRID", "IPLS", "LINK", "MCDI", "MLLT", "OWNE", "PRIV", "PCNT",
  "POPM", "POSS", "RBUF", "RVAD", "RVRB", "SYLT", "SYTC", "TALB",
  "TBPM", "TCOM", "TCON", "TCOP", "TDAT", "TDLY", "TENC", "TEXT",
  "TFLT", "TIME", "TIT1", "TIT2", "TIT3", "TKEY", "TLAN", "TLEN",
  "TMED", "TOAL", "TOFN", "TOLY", "TOPE", "TORY", "TPE1", "TPE2",
  "TPE3", "TPE4", "TPOS", "TPUB", "TRCK", "TRDA", "TRSN", "TRSO",
  "TSIZ", "TSRC", "TSSE", "TYER", "TXXX", "UFID", "USER", "USLT",
  "WCOM", "WCOP", "WOAF", "WOAR", "WOAS", "WORS", "WPAY", "WPUB",
  "WXXX", "TDRC", "TDRL", "TDTG", "TIPL", "TMCL", "TMOO", "TPRO",
  "TSOA", "TSOP", "TSOT", "TSO2", "TSOC",
]);

/** Known ID3v2.2 frame IDs (3-char) */
const KNOWN_V22_FRAME_IDS = new Set([
  "BUF", "CNT", "COM", "CRA", "CRM", "ETC", "EQU", "GEO", "IPL",
  "LNK", "MCI", "MLL", "PIC", "POP", "REV", "RVA", "SLT", "STC",
  "TAL", "TBP", "TCM", "TCO", "TCR", "TDA", "TDY", "TEN", "TFT",
  "TIM", "TKE", "TLA", "TLE", "TMT", "TOA", "TOF", "TOL", "TOR",
  "TP1", "TP2", "TP3", "TP4", "TPA", "TPB", "TRC", "TRD", "TRK",
  "TSI", "TSS", "TT1", "TT2", "TT3", "TXT", "TXX", "TYE", "UFI",
  "ULT", "WAF", "WAR", "WAS", "WCM", "WCP", "WPB", "WXX",
]);

// ─── Tool Definitions ───

export const mp3Tools: ToolDef[] = [
  // 1. mp3_detect
  {
    name: "mp3_detect",
    description:
      "Auto-detect MP3 steganography. Checks ID3 tag padding, gaps before first audio frame, trailing data after last frame, bitrate anomalies, and inter-frame gaps for signs of hidden data.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const findings: string[] = [];
        let suspicionScore = 0;

        findings.push(`=== MP3 Steganography Detection ===`);
        findings.push(`File: ${filePath}`);
        findings.push(`File size: ${mp3.fileSize} bytes`);
        findings.push(`Duration: ${formatDuration(mp3.duration)}`);
        findings.push(`Frames: ${mp3.frameCount}, Avg bitrate: ${mp3.averageBitrate} kbps, VBR: ${mp3.isVBR}`);
        findings.push("");

        // --- ID3v2 padding check ---
        findings.push(`=== ID3 Tag Analysis ===`);
        if (mp3.id3v2) {
          findings.push(`ID3v2.${mp3.id3v2.version}.${mp3.id3v2.revision} tag: ${mp3.id3v2.size} bytes`);
          findings.push(`ID3v2 padding: ${mp3.id3v2.padding} bytes`);

          if (mp3.id3v2.padding > 4096) {
            findings.push(`[!] Excessive ID3v2 padding (${mp3.id3v2.padding} bytes) — potential hidden data`);
            suspicionScore += 2;

            // Check if padding is actually zeroed or contains data
            const tagStart = 10;
            const paddingStart = tagStart + mp3.id3v2.size - mp3.id3v2.padding;
            const paddingEnd = tagStart + mp3.id3v2.size;
            const paddingBuf = buf.subarray(paddingStart, paddingEnd);
            let nonZero = 0;
            for (const b of paddingBuf) {
              if (b !== 0) nonZero++;
            }
            if (nonZero > 0) {
              findings.push(`[!] ID3v2 "padding" contains ${nonZero} non-zero bytes — DATA HIDDEN IN PADDING`);
              suspicionScore += 3;
            }
          } else if (mp3.id3v2.padding > 1024) {
            findings.push(`[!] Notable ID3v2 padding (${mp3.id3v2.padding} bytes) — worth investigating`);
            suspicionScore += 1;
          }

          // Check for PRIV frames
          const privFrames = mp3.id3v2.frames.filter((f) => f.id === "PRIV");
          if (privFrames.length > 0) {
            const totalPrivSize = privFrames.reduce((a, f) => a + f.size, 0);
            findings.push(`[!] ${privFrames.length} PRIV frame(s) (${totalPrivSize} bytes) — can contain arbitrary data`);
            suspicionScore += 1;
          }

          // Check for unknown frames
          const unknownFrames = mp3.id3v2.frames.filter((f) => {
            const known = mp3.id3v2!.version === 2 ? KNOWN_V22_FRAME_IDS : KNOWN_FRAME_IDS;
            return !known.has(f.id);
          });
          if (unknownFrames.length > 0) {
            findings.push(`[!] ${unknownFrames.length} unknown frame ID(s): ${unknownFrames.map((f) => f.id).join(", ")}`);
            suspicionScore += 1;
          }
        } else {
          findings.push(`No ID3v2 tag found`);
        }

        if (mp3.id3v1) {
          findings.push(`ID3v1 tag present: "${mp3.id3v1.title}" by "${mp3.id3v1.artist}"`);
        } else {
          findings.push(`No ID3v1 tag found`);
        }
        findings.push("");

        // --- Gap before first frame ---
        findings.push(`=== Pre-Audio Gap ===`);
        findings.push(`First frame offset: ${mp3.firstFrameOffset}`);
        findings.push(`Gap before first frame: ${mp3.gapBeforeFirstFrame} bytes`);
        if (mp3.gapBeforeFirstFrame > 512) {
          findings.push(`[!] Large gap before audio data — possible hidden data`);
          suspicionScore += 2;

          const gapStart = mp3.firstFrameOffset - mp3.gapBeforeFirstFrame;
          const gapBuf = buf.subarray(gapStart, mp3.firstFrameOffset);
          const gapEntropy = shannonEntropy(gapBuf);
          findings.push(`Gap entropy: ${gapEntropy.toFixed(4)}`);
          if (gapEntropy > 6.0) {
            findings.push(`[!] High entropy gap data — likely encrypted/compressed hidden content`);
            suspicionScore += 1;
          }
        }
        findings.push("");

        // --- Trailing data ---
        findings.push(`=== Trailing Data ===`);
        findings.push(`Trailing data: ${mp3.trailingData} bytes`);
        if (mp3.trailingData > 256) {
          findings.push(`[!] Significant trailing data after last audio frame`);
          suspicionScore += 2;

          const lastFrame = mp3.frames[mp3.frameCount - 1];
          const trailStart = lastFrame.offset + lastFrame.frameSize;
          const id3v1Size = mp3.id3v1 ? 128 : 0;
          const trailEnd = mp3.fileSize - id3v1Size;
          const trailBuf = buf.subarray(trailStart, trailEnd);

          if (trailBuf.length > 0) {
            const trailEntropy = shannonEntropy(trailBuf);
            findings.push(`Trailing entropy: ${trailEntropy.toFixed(4)}`);
            findings.push(`Preview:`);
            findings.push(hexDump(trailBuf, 0, Math.min(128, trailBuf.length)));
          }
        }
        findings.push("");

        // --- Bitrate anomalies ---
        findings.push(`=== Bitrate Analysis ===`);
        if (mp3.isVBR && mp3.frameCount > 10) {
          const bitrates = mp3.frames.map((f) => f.bitrate);
          const bitrateEntropy = shannonEntropy(bitrates);
          const uniqueBitrates = new Set(bitrates).size;

          findings.push(`VBR detected: ${uniqueBitrates} unique bitrates`);
          findings.push(`Bitrate entropy: ${bitrateEntropy.toFixed(4)}`);

          // Check for unnatural bitrate sequences (encoding data in bitrate selection)
          if (uniqueBitrates === 2) {
            const vals = [...new Set(bitrates)];
            findings.push(`[!] Exactly 2 bitrate values (${vals[0]}, ${vals[1]}) — possible binary encoding via bitrate selection`);
            suspicionScore += 2;
          }
        } else {
          findings.push(`CBR: ${mp3.averageBitrate} kbps`);
        }

        // Check for inter-frame gaps
        let totalGapBytes = 0;
        let gapCount = 0;
        for (let i = 0; i < mp3.frames.length - 1; i++) {
          const expectedNext = mp3.frames[i].offset + mp3.frames[i].frameSize;
          const actualNext = mp3.frames[i + 1].offset;
          const gap = actualNext - expectedNext;
          if (gap > 0) {
            totalGapBytes += gap;
            gapCount++;
          }
        }
        if (gapCount > 0) {
          findings.push(`\n[!] ${gapCount} inter-frame gaps detected (${totalGapBytes} total bytes)`);
          suspicionScore += 2;
        }
        findings.push("");

        // --- Overall verdict ---
        findings.push(`=== Overall Verdict ===`);
        findings.push(`Suspicion score: ${suspicionScore}/15+`);
        if (suspicionScore >= 5) {
          findings.push(`VERDICT: LIKELY MP3 STEGANOGRAPHY DETECTED`);
        } else if (suspicionScore >= 2) {
          findings.push(`VERDICT: SUSPICIOUS — further analysis recommended`);
        } else {
          findings.push(`VERDICT: No obvious steganography indicators found`);
        }

        return text(findings.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. mp3_frame_analysis
  {
    name: "mp3_frame_analysis",
    description:
      "MP3 frame header analysis. Examines bitrate changes, padding patterns, VBR detection, frame size consistency, and layer/version anomalies across audio frames.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== MP3 Frame Header Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Total frames: ${mp3.frameCount}`);
        results.push(`VBR: ${mp3.isVBR}, Avg bitrate: ${mp3.averageBitrate} kbps`);
        results.push(`Duration: ${formatDuration(mp3.duration)}`);
        results.push("");

        if (mp3.frameCount === 0) {
          return text(`No MP3 frames found.`);
        }

        // --- Frame version/layer consistency ---
        results.push(`=== Version/Layer Consistency ===`);
        const versions = new Set(mp3.frames.map((f) => f.version));
        const layers = new Set(mp3.frames.map((f) => f.layer));
        results.push(`MPEG versions found: ${[...versions].join(", ")}`);
        results.push(`Layers found: ${[...layers].join(", ")}`);
        if (versions.size > 1) {
          results.push(`[!] Multiple MPEG versions in one file — unusual`);
        }
        if (layers.size > 1) {
          results.push(`[!] Multiple layers in one file — unusual`);
        }
        results.push("");

        // --- Bitrate distribution ---
        results.push(`=== Bitrate Distribution ===`);
        const bitrateCounts = new Map<number, number>();
        for (const f of mp3.frames) {
          bitrateCounts.set(f.bitrate, (bitrateCounts.get(f.bitrate) ?? 0) + 1);
        }

        const sortedBitrates = [...bitrateCounts.entries()].sort((a, b) => b[1] - a[1]);
        for (const [br, count] of sortedBitrates) {
          const pct = ((count / mp3.frameCount) * 100).toFixed(1);
          const bar = "#".repeat(Math.round((count / mp3.frameCount) * 40));
          results.push(`  ${br} kbps: ${count} frames (${pct}%) ${bar}`);
        }
        results.push("");

        // Bitrate change analysis
        results.push(`=== Bitrate Change Patterns ===`);
        let bitrateChanges = 0;
        const changePositions: number[] = [];
        for (let i = 1; i < mp3.frames.length; i++) {
          if (mp3.frames[i].bitrate !== mp3.frames[i - 1].bitrate) {
            bitrateChanges++;
            if (changePositions.length < 50) changePositions.push(i);
          }
        }

        results.push(`Bitrate changes: ${bitrateChanges}/${mp3.frameCount - 1} transitions`);
        if (mp3.frameCount > 1) {
          results.push(`Change rate: ${((bitrateChanges / (mp3.frameCount - 1)) * 100).toFixed(2)}%`);
        }

        // Check for periodic patterns
        if (bitrateChanges > 5 && bitrateChanges < mp3.frameCount * 0.9) {
          const intervals: number[] = [];
          for (let i = 1; i < changePositions.length; i++) {
            intervals.push(changePositions[i] - changePositions[i - 1]);
          }
          if (intervals.length > 2) {
            const avgInterval = mean(intervals);
            const sd = stddev(intervals);
            results.push(`Change intervals: avg=${avgInterval.toFixed(1)}, stddev=${sd.toFixed(1)}`);
            if (sd < avgInterval * 0.2 && avgInterval > 1) {
              results.push(`[!] Periodic bitrate changes (every ~${Math.round(avgInterval)} frames) — possible data encoding`);
            }
          }
        }
        results.push("");

        // --- Padding pattern analysis ---
        results.push(`=== Padding Pattern Analysis ===`);
        const paddedCount = mp3.frames.filter((f) => f.padding).length;
        const unpaddedCount = mp3.frameCount - paddedCount;
        results.push(`Padded frames: ${paddedCount} (${((paddedCount / mp3.frameCount) * 100).toFixed(1)}%)`);
        results.push(`Unpadded frames: ${unpaddedCount} (${((unpaddedCount / mp3.frameCount) * 100).toFixed(1)}%)`);

        // Check padding bit pattern (could encode data)
        const paddingBits = mp3.frames.map((f) => f.padding ? 1 : 0);
        const paddingEntropy = shannonEntropy(paddingBits);
        results.push(`Padding bit entropy: ${paddingEntropy.toFixed(4)} (1.0 = maximum)`);

        if (paddingEntropy > 0.95 && paddedCount > mp3.frameCount * 0.3 && unpaddedCount > mp3.frameCount * 0.3) {
          results.push(`[!] Near-maximum padding entropy with balanced distribution — possible data in padding bit`);
        }
        results.push("");

        // --- Frame size analysis ---
        results.push(`=== Frame Size Analysis ===`);
        const frameSizes = mp3.frames.map((f) => f.frameSize);
        const uniqueSizes = new Set(frameSizes).size;
        results.push(`Unique frame sizes: ${uniqueSizes}`);
        results.push(`Size range: ${Math.min(...frameSizes)} - ${Math.max(...frameSizes)} bytes`);
        results.push(`Average size: ${mean(frameSizes).toFixed(1)} bytes`);
        results.push(`Size stddev: ${stddev(frameSizes).toFixed(1)}`);

        // --- Channel mode analysis ---
        results.push("");
        results.push(`=== Channel Mode ===`);
        const modeCounts = new Map<string, number>();
        for (const f of mp3.frames) {
          modeCounts.set(f.channelMode, (modeCounts.get(f.channelMode) ?? 0) + 1);
        }
        for (const [mode, count] of modeCounts) {
          results.push(`  ${mode}: ${count} frames`);
        }
        if (modeCounts.size > 1) {
          results.push(`[!] Multiple channel modes — unusual for a single recording`);
        }

        // --- Sample rate ---
        results.push("");
        results.push(`=== Sample Rate ===`);
        const sampleRates = new Set(mp3.frames.map((f) => f.sampleRate));
        results.push(`Sample rates: ${[...sampleRates].map((r) => `${r}Hz`).join(", ")}`);
        if (sampleRates.size > 1) {
          results.push(`[!] Multiple sample rates — highly unusual`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. mp3_id3_hidden
  {
    name: "mp3_id3_hidden",
    description:
      "ID3v1/v2 hidden data analysis. Inspects APIC (image) frames, PRIV (private) frames, excessive padding, unknown frame IDs, and overall tag entropy for signs of steganographic content.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== ID3 Hidden Data Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push("");

        // --- ID3v2 ---
        results.push(`=== ID3v2 Tag ===`);
        if (mp3.id3v2) {
          const tag = mp3.id3v2;
          results.push(`Version: ID3v2.${tag.version}.${tag.revision}`);
          results.push(`Tag size: ${tag.size} bytes`);
          results.push(`Flags: unsync=${tag.flags.unsynchronisation}, extended=${tag.flags.extendedHeader}, experimental=${tag.flags.experimental}`);
          results.push(`Frame count: ${tag.frames.length}`);
          results.push(`Padding: ${tag.padding} bytes`);
          results.push("");

          // Frame inventory
          results.push(`Frame inventory:`);
          let totalFrameDataSize = 0;
          for (const frame of tag.frames) {
            totalFrameDataSize += frame.size;
            const known = tag.version === 2 ? KNOWN_V22_FRAME_IDS : KNOWN_FRAME_IDS;
            const isKnown = known.has(frame.id);
            let line = `  ${frame.id}: ${frame.size} bytes`;
            if (!isKnown) line += ` [!] UNKNOWN FRAME ID`;
            if (frame.flags !== 0) line += ` (flags=0x${frame.flags.toString(16)})`;
            results.push(line);
          }
          results.push(`Total frame data: ${totalFrameDataSize} bytes`);
          results.push(`Overhead (padding + headers): ${tag.size - totalFrameDataSize} bytes`);
          results.push("");

          // --- APIC analysis ---
          const apicFrames = tag.frames.filter((f) => f.id === "APIC" || f.id === "PIC");
          if (apicFrames.length > 0) {
            results.push(`=== APIC (Embedded Image) Frames ===`);
            results.push(`APIC frames: ${apicFrames.length}`);
            for (let i = 0; i < apicFrames.length; i++) {
              const frame = apicFrames[i];
              results.push(`  APIC #${i}: ${frame.size} bytes`);

              // Try to identify image type
              if (frame.data.length > 10) {
                const isPng = frame.data.indexOf(Buffer.from([0x89, 0x50, 0x4e, 0x47])) >= 0;
                const isJpeg = frame.data.indexOf(Buffer.from([0xff, 0xd8, 0xff])) >= 0;
                if (isPng) results.push(`    Format: PNG`);
                else if (isJpeg) results.push(`    Format: JPEG`);
                else results.push(`    Format: Unknown/Other`);
              }

              if (frame.size > 1024 * 1024) {
                results.push(`    [!] Very large embedded image (${(frame.size / 1024).toFixed(0)}KB) — could hide data`);
              }

              const imgEntropy = shannonEntropy(frame.data);
              results.push(`    Data entropy: ${imgEntropy.toFixed(4)}`);
            }
            results.push("");
          }

          // --- PRIV frames ---
          const privFrames = tag.frames.filter((f) => f.id === "PRIV");
          if (privFrames.length > 0) {
            results.push(`=== PRIV (Private) Frames ===`);
            results.push(`PRIV frames: ${privFrames.length}`);
            for (let i = 0; i < privFrames.length; i++) {
              const frame = privFrames[i];
              results.push(`  PRIV #${i}: ${frame.size} bytes`);

              // PRIV format: owner-identifier\0 + data
              const nullIdx = frame.data.indexOf(0x00);
              if (nullIdx > 0) {
                const owner = frame.data.subarray(0, nullIdx).toString("ascii");
                const privData = frame.data.subarray(nullIdx + 1);
                results.push(`    Owner: "${owner}"`);
                results.push(`    Data: ${privData.length} bytes, entropy=${shannonEntropy(privData).toFixed(4)}`);
                if (privData.length > 256) {
                  results.push(`    [!] Large PRIV data — possible hidden content`);
                }
                results.push(`    Hex preview:`);
                results.push(hexDump(privData, 0, Math.min(64, privData.length)));
              } else {
                results.push(`    Raw data (no owner ID):`);
                results.push(hexDump(frame.data, 0, Math.min(64, frame.data.length)));
              }
            }
            results.push("");
          }

          // --- GEOB frames ---
          const geobFrames = tag.frames.filter((f) => f.id === "GEOB" || f.id === "GEO");
          if (geobFrames.length > 0) {
            results.push(`=== GEOB (General Object) Frames ===`);
            for (let i = 0; i < geobFrames.length; i++) {
              const frame = geobFrames[i];
              results.push(`  GEOB #${i}: ${frame.size} bytes`);
              results.push(`    [!] GEOB frames can contain arbitrary binary data`);
              const ent = shannonEntropy(frame.data);
              results.push(`    Entropy: ${ent.toFixed(4)}`);
            }
            results.push("");
          }

          // --- Unknown frames ---
          const unknownFrames = tag.frames.filter((f) => {
            const known = tag.version === 2 ? KNOWN_V22_FRAME_IDS : KNOWN_FRAME_IDS;
            return !known.has(f.id);
          });
          if (unknownFrames.length > 0) {
            results.push(`=== Unknown Frame IDs ===`);
            for (const frame of unknownFrames) {
              results.push(`  [!] "${frame.id}": ${frame.size} bytes`);
              const ent = shannonEntropy(frame.data);
              results.push(`    Entropy: ${ent.toFixed(4)}`);
              results.push(`    Hex preview:`);
              results.push(hexDump(frame.data, 0, Math.min(64, frame.data.length)));
            }
            results.push("");
          }

          // --- Padding analysis ---
          if (tag.padding > 0) {
            results.push(`=== ID3v2 Padding Analysis ===`);
            results.push(`Padding size: ${tag.padding} bytes`);

            const paddingStart = 10 + tag.size - tag.padding;
            const paddingBuf = buf.subarray(paddingStart, 10 + tag.size);
            let nonZero = 0;
            for (const b of paddingBuf) {
              if (b !== 0) nonZero++;
            }
            results.push(`Non-zero bytes in padding: ${nonZero}`);
            if (nonZero > 0) {
              results.push(`[!] PADDING CONTAINS DATA (${nonZero} non-zero bytes)`);
              const paddingEntropy = shannonEntropy(paddingBuf);
              results.push(`Padding entropy: ${paddingEntropy.toFixed(4)}`);
              results.push(`Hex preview:`);
              results.push(hexDump(paddingBuf, 0, Math.min(128, paddingBuf.length)));
            } else if (tag.padding > 4096) {
              results.push(`[!] Excessively large zero padding — could be overwritten with stego data`);
            }
          }
        } else {
          results.push(`No ID3v2 tag found`);
        }
        results.push("");

        // --- ID3v1 ---
        results.push(`=== ID3v1 Tag ===`);
        if (mp3.id3v1) {
          const v1 = mp3.id3v1;
          results.push(`Title: "${v1.title}"`);
          results.push(`Artist: "${v1.artist}"`);
          results.push(`Album: "${v1.album}"`);
          results.push(`Year: "${v1.year}"`);
          results.push(`Comment: "${v1.comment}"`);
          results.push(`Track: ${v1.track ?? "N/A"}`);
          results.push(`Genre: ${v1.genre}`);

          // Check for data hidden in padding of fixed-length fields
          const tagStart = buf.length - 128;
          const rawTitle = buf.subarray(tagStart + 3, tagStart + 33);
          const rawArtist = buf.subarray(tagStart + 33, tagStart + 63);
          const rawAlbum = buf.subarray(tagStart + 63, tagStart + 93);

          // After the null terminator, check for non-null bytes
          const checkField = (name: string, raw: Buffer, text: string) => {
            const textEnd = text.length;
            if (textEnd < raw.length - 1) {
              const nullIdx = raw.indexOf(0x00);
              if (nullIdx >= 0 && nullIdx < raw.length - 1) {
                let hiddenBytes = 0;
                for (let i = nullIdx + 1; i < raw.length; i++) {
                  if (raw[i] !== 0) hiddenBytes++;
                }
                if (hiddenBytes > 0) {
                  results.push(`[!] ${name}: ${hiddenBytes} non-null bytes after text terminator`);
                }
              }
            }
          };

          checkField("Title", rawTitle, v1.title);
          checkField("Artist", rawArtist, v1.artist);
          checkField("Album", rawAlbum, v1.album);
        } else {
          results.push(`No ID3v1 tag found`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. mp3_padding
  {
    name: "mp3_padding",
    description:
      "Bit reservoir and padding manipulation detection. Analyzes the gap before the first audio frame, inter-frame gaps between consecutive frames, and checks for data inserted between or around audio frames.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== MP3 Padding / Gap Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Frames: ${mp3.frameCount}`);
        results.push("");

        if (mp3.frameCount === 0) {
          return text(`No MP3 frames found.`);
        }

        // --- Gap before first frame ---
        results.push(`=== Pre-Audio Gap ===`);
        results.push(`First frame offset: ${mp3.firstFrameOffset}`);
        results.push(`Gap before first frame: ${mp3.gapBeforeFirstFrame} bytes`);

        if (mp3.gapBeforeFirstFrame > 0) {
          const id3v2End = mp3.id3v2 ? 10 + mp3.id3v2.size : 0;
          const gapBuf = buf.subarray(id3v2End, mp3.firstFrameOffset);

          if (gapBuf.length > 0) {
            const gapEntropy = shannonEntropy(gapBuf);
            let nonZero = 0;
            for (const b of gapBuf) {
              if (b !== 0) nonZero++;
            }

            results.push(`Gap content: ${gapBuf.length} bytes, ${nonZero} non-zero`);
            results.push(`Gap entropy: ${gapEntropy.toFixed(4)}`);

            if (nonZero > 0 && gapBuf.length > 32) {
              results.push(`[!] Significant non-zero data in pre-audio gap`);
              results.push(`Hex dump:`);
              results.push(hexDump(gapBuf, 0, Math.min(256, gapBuf.length)));
            }
          }
        }
        results.push("");

        // --- Inter-frame gap analysis ---
        results.push(`=== Inter-Frame Gaps ===`);
        const gaps: { after: number; offset: number; size: number; entropy: number }[] = [];
        let totalGapBytes = 0;

        for (let i = 0; i < mp3.frames.length - 1; i++) {
          const expectedNext = mp3.frames[i].offset + mp3.frames[i].frameSize;
          const actualNext = mp3.frames[i + 1].offset;
          const gap = actualNext - expectedNext;

          if (gap > 0) {
            const gapBuf = buf.subarray(expectedNext, actualNext);
            const ent = gapBuf.length > 0 ? shannonEntropy(gapBuf) : 0;
            gaps.push({ after: i, offset: expectedNext, size: gap, entropy: ent });
            totalGapBytes += gap;
          } else if (gap < 0) {
            // Overlapping frames — unusual
            gaps.push({ after: i, offset: expectedNext, size: gap, entropy: 0 });
          }
        }

        results.push(`Total inter-frame gaps: ${gaps.filter((g) => g.size > 0).length}`);
        results.push(`Total gap bytes: ${totalGapBytes}`);
        results.push(`Overlapping frames: ${gaps.filter((g) => g.size < 0).length}`);
        results.push("");

        if (gaps.length > 0) {
          // Show gap details
          const positiveGaps = gaps.filter((g) => g.size > 0);
          const negativeGaps = gaps.filter((g) => g.size < 0);

          if (positiveGaps.length > 0) {
            results.push(`Gap details:`);
            const gapSizes = positiveGaps.map((g) => g.size);
            results.push(`  Size range: ${Math.min(...gapSizes)} - ${Math.max(...gapSizes)} bytes`);
            results.push(`  Average gap: ${mean(gapSizes).toFixed(1)} bytes`);
            results.push(`  Avg gap entropy: ${mean(positiveGaps.map((g) => g.entropy)).toFixed(4)}`);
            results.push("");

            // Show individual gaps (up to 30)
            for (const gap of positiveGaps.slice(0, 30)) {
              let line = `  After frame ${gap.after}: offset=0x${gap.offset.toString(16)}, size=${gap.size}B, entropy=${gap.entropy.toFixed(3)}`;
              if (gap.entropy > 6.0) line += ` [!] HIGH ENTROPY`;
              results.push(line);

              // Show hex for suspicious gaps
              if (gap.size > 0 && gap.size <= 64) {
                const gapBuf = buf.subarray(gap.offset, gap.offset + gap.size);
                results.push(`    ${Array.from(gapBuf).map((b) => b.toString(16).padStart(2, "0")).join(" ")}`);
              }
            }
            if (positiveGaps.length > 30) {
              results.push(`  ... and ${positiveGaps.length - 30} more gaps`);
            }
          }

          if (negativeGaps.length > 0) {
            results.push("");
            results.push(`[!] Frame overlaps detected:`);
            for (const gap of negativeGaps.slice(0, 10)) {
              results.push(`  Frame ${gap.after}: overlap of ${Math.abs(gap.size)} bytes`);
            }
          }

          if (totalGapBytes > 100) {
            results.push("");
            results.push(`[!] ${totalGapBytes} bytes hidden in inter-frame gaps`);

            // Combine all gap data
            const allGapData: Buffer[] = [];
            for (const gap of positiveGaps) {
              if (gap.size > 0) {
                allGapData.push(buf.subarray(gap.offset, gap.offset + gap.size));
              }
            }
            if (allGapData.length > 0) {
              const combined = Buffer.concat(allGapData);
              const combinedEntropy = shannonEntropy(combined);
              results.push(`Combined gap data: ${combined.length} bytes, entropy=${combinedEntropy.toFixed(4)}`);

              // Check for printable content
              let printable = 0;
              for (const b of combined) {
                if (b >= 0x20 && b <= 0x7e) printable++;
              }
              if (printable / combined.length > 0.7) {
                results.push(`[!] Gap data is mostly printable ASCII:`);
                results.push(combined.toString("ascii").replace(/[^\x20-\x7E]/g, ".").substring(0, 500));
              }
            }
          }
        } else {
          results.push(`No inter-frame gaps detected — frames are contiguous`);
        }
        results.push("");

        // --- Trailing data ---
        results.push(`=== Trailing Data ===`);
        results.push(`Trailing bytes after last frame: ${mp3.trailingData}`);
        if (mp3.trailingData > 0) {
          const lastFrame = mp3.frames[mp3.frameCount - 1];
          const trailStart = lastFrame.offset + lastFrame.frameSize;
          const id3v1Size = mp3.id3v1 ? 128 : 0;
          const trailEnd = mp3.fileSize - id3v1Size;
          const trailBuf = buf.subarray(trailStart, trailEnd);

          if (trailBuf.length > 0) {
            results.push(`Trailing entropy: ${shannonEntropy(trailBuf).toFixed(4)}`);
            results.push(`Hex preview:`);
            results.push(hexDump(trailBuf, 0, Math.min(256, trailBuf.length)));
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. mp3_sample_analysis
  {
    name: "mp3_sample_analysis",
    description:
      "Statistical analysis of decoded MP3 frame sizes. Computes entropy, variance, and anomalies in frame size distribution to detect steganographic manipulation of audio frame data.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== MP3 Frame Size Statistical Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Frames: ${mp3.frameCount}`);
        results.push("");

        if (mp3.frameCount === 0) {
          return text(`No MP3 frames found.`);
        }

        const frameSizes = mp3.frames.map((f) => f.frameSize);

        // --- Global statistics ---
        results.push(`=== Global Frame Size Statistics ===`);
        const avgSize = mean(frameSizes);
        const sizeStd = stddev(frameSizes);
        const minSize = Math.min(...frameSizes);
        const maxSize = Math.max(...frameSizes);
        const medianSize = [...frameSizes].sort((a, b) => a - b)[Math.floor(frameSizes.length / 2)];

        results.push(`Mean: ${avgSize.toFixed(2)} bytes`);
        results.push(`Median: ${medianSize} bytes`);
        results.push(`StdDev: ${sizeStd.toFixed(2)}`);
        results.push(`Range: ${minSize} - ${maxSize} bytes`);
        results.push(`CV (coefficient of variation): ${avgSize > 0 ? (sizeStd / avgSize).toFixed(4) : "N/A"}`);
        results.push("");

        // --- Frame size distribution histogram ---
        results.push(`=== Frame Size Distribution ===`);
        const sizeCounts = new Map<number, number>();
        for (const s of frameSizes) {
          sizeCounts.set(s, (sizeCounts.get(s) ?? 0) + 1);
        }

        const sortedSizes = [...sizeCounts.entries()].sort((a, b) => b[1] - a[1]);
        const maxCount = sortedSizes[0]?.[1] ?? 1;
        for (const [size, count] of sortedSizes.slice(0, 20)) {
          const pct = ((count / mp3.frameCount) * 100).toFixed(1);
          const bar = "#".repeat(Math.round((count / maxCount) * 30));
          results.push(`  ${size}B: ${count} (${pct}%) ${bar}`);
        }
        if (sortedSizes.length > 20) results.push(`  ... and ${sortedSizes.length - 20} more unique sizes`);
        results.push("");

        // --- Entropy analysis of frame sizes ---
        results.push(`=== Entropy Analysis ===`);
        // Low byte entropy of frame sizes
        const sizeLowBytes = frameSizes.map((s) => s & 0xff);
        const sizeEntropy = shannonEntropy(sizeLowBytes);
        results.push(`Frame size low byte entropy: ${sizeEntropy.toFixed(4)}`);

        // Entropy of frame size differences (delta encoding)
        const sizeDiffs: number[] = [];
        for (let i = 1; i < frameSizes.length; i++) {
          sizeDiffs.push(frameSizes[i] - frameSizes[i - 1]);
        }
        if (sizeDiffs.length > 0) {
          const diffEntropy = shannonEntropy(sizeDiffs.map((d) => ((d + 256) & 0xff)));
          results.push(`Size delta entropy: ${diffEntropy.toFixed(4)}`);
        }
        results.push("");

        // --- Anomaly detection ---
        results.push(`=== Anomaly Detection ===`);

        // Detect outlier frames (more than 3 stddev from mean)
        const outliers: { index: number; size: number; deviation: number }[] = [];
        for (let i = 0; i < frameSizes.length; i++) {
          const dev = Math.abs(frameSizes[i] - avgSize) / (sizeStd || 1);
          if (dev > 3.0) {
            outliers.push({ index: i, size: frameSizes[i], deviation: dev });
          }
        }

        results.push(`Outlier frames (>3 stddev): ${outliers.length}`);
        for (const o of outliers.slice(0, 20)) {
          results.push(`  Frame ${o.index}: ${o.size} bytes (${o.deviation.toFixed(1)} stddev)`);
        }
        if (outliers.length > 20) results.push(`  ... and ${outliers.length - 20} more`);
        results.push("");

        // --- Block-level analysis ---
        results.push(`=== Block-Level Analysis ===`);
        const blockFrameCount = Math.min(100, Math.floor(mp3.frameCount / 10));
        if (blockFrameCount > 5) {
          const blockStats: { idx: number; avg: number; std: number; entropy: number }[] = [];

          for (let bStart = 0; bStart < mp3.frameCount; bStart += blockFrameCount) {
            const bEnd = Math.min(bStart + blockFrameCount, mp3.frameCount);
            const blockSizes = frameSizes.slice(bStart, bEnd);

            const bAvg = mean(blockSizes);
            const bStd = stddev(blockSizes);
            const bEnt = shannonEntropy(blockSizes.map((s) => s & 0xff));

            blockStats.push({
              idx: Math.floor(bStart / blockFrameCount),
              avg: bAvg,
              std: bStd,
              entropy: bEnt,
            });
          }

          for (const b of blockStats.slice(0, 20)) {
            results.push(`  Block ${b.idx}: avg=${b.avg.toFixed(1)}, stddev=${b.std.toFixed(1)}, entropy=${b.entropy.toFixed(3)}`);
          }
          if (blockStats.length > 20) results.push(`  ... and ${blockStats.length - 20} more blocks`);

          // Check for blocks with significantly different statistics
          const globalEntropyAvg = mean(blockStats.map((b) => b.entropy));
          const anomalousBlocks = blockStats.filter(
            (b) => Math.abs(b.entropy - globalEntropyAvg) > 1.5,
          );
          if (anomalousBlocks.length > 0) {
            results.push("");
            results.push(`[!] ${anomalousBlocks.length} blocks with anomalous entropy — possible partial embedding`);
          }
        }

        // --- Frame data entropy sampling ---
        results.push("");
        results.push(`=== Frame Data Entropy Sampling ===`);
        const sampleIndices = [0, Math.floor(mp3.frameCount / 4), Math.floor(mp3.frameCount / 2), Math.floor(mp3.frameCount * 3 / 4), mp3.frameCount - 1];
        for (const idx of sampleIndices) {
          if (idx < 0 || idx >= mp3.frameCount) continue;
          const frame = mp3.frames[idx];
          const frameData = buf.subarray(frame.offset, frame.offset + frame.frameSize);
          const ent = shannonEntropy(frameData);
          results.push(`  Frame ${idx} (offset=0x${frame.offset.toString(16)}): ${frame.frameSize}B, entropy=${ent.toFixed(4)}, bitrate=${frame.bitrate}kbps`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. mp3_metadata
  {
    name: "mp3_metadata",
    description:
      "Full MP3 metadata extraction. Reports ID3v1 tag, ID3v2 frames with content, duration, bitrate, VBR status, sample rate, and file structure overview.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== MP3 Metadata ===`);
        results.push(`File: ${filePath}`);
        results.push(`File size: ${mp3.fileSize} bytes (${(mp3.fileSize / 1024).toFixed(1)} KB)`);
        results.push("");

        // --- Audio properties ---
        results.push(`=== Audio Properties ===`);
        results.push(`Duration: ${formatDuration(mp3.duration)} (${mp3.duration.toFixed(3)}s)`);
        results.push(`Frames: ${mp3.frameCount}`);
        results.push(`Average bitrate: ${mp3.averageBitrate} kbps`);
        results.push(`VBR: ${mp3.isVBR}`);

        if (mp3.frameCount > 0) {
          const f0 = mp3.frames[0];
          results.push(`MPEG version: ${f0.version}`);
          results.push(`Layer: ${f0.layer}`);
          results.push(`Sample rate: ${f0.sampleRate} Hz`);
          results.push(`Channel mode: ${f0.channelMode}`);
          results.push(`CRC protection: ${f0.hasCRC}`);
          results.push(`Emphasis: ${f0.emphasis}`);
        }
        results.push("");

        // --- File structure ---
        results.push(`=== File Structure ===`);
        const id3v2Size = mp3.id3v2 ? 10 + mp3.id3v2.size : 0;
        const id3v1Size = mp3.id3v1 ? 128 : 0;

        results.push(`ID3v2 tag: ${id3v2Size > 0 ? `${id3v2Size} bytes (0x0 - 0x${(id3v2Size - 1).toString(16)})` : "none"}`);
        results.push(`Pre-audio gap: ${mp3.gapBeforeFirstFrame} bytes`);
        results.push(`First frame: offset 0x${mp3.firstFrameOffset.toString(16)}`);
        if (mp3.frameCount > 0) {
          const lastFrame = mp3.frames[mp3.frameCount - 1];
          const lastEnd = lastFrame.offset + lastFrame.frameSize;
          results.push(`Last frame end: offset 0x${lastEnd.toString(16)}`);
        }
        results.push(`Trailing data: ${mp3.trailingData} bytes`);
        results.push(`ID3v1 tag: ${id3v1Size > 0 ? `${id3v1Size} bytes (at end)` : "none"}`);
        results.push("");

        // --- ID3v2 ---
        if (mp3.id3v2) {
          results.push(`=== ID3v2 Tag ===`);
          results.push(`Version: ID3v2.${mp3.id3v2.version}.${mp3.id3v2.revision}`);
          results.push(`Size: ${mp3.id3v2.size} bytes`);
          results.push(`Padding: ${mp3.id3v2.padding} bytes`);
          results.push(`Flags: unsync=${mp3.id3v2.flags.unsynchronisation}, extended=${mp3.id3v2.flags.extendedHeader}, experimental=${mp3.id3v2.flags.experimental}`);
          results.push(`Frames: ${mp3.id3v2.frames.length}`);
          results.push("");

          // Decode text frames
          results.push(`ID3v2 Frame Details:`);
          for (const frame of mp3.id3v2.frames) {
            let valueStr = "";

            // Text frames start with T (except TXXX)
            if (frame.id.startsWith("T") && frame.id !== "TXXX") {
              if (frame.data.length > 1) {
                const encoding = frame.data[0];
                const textBuf = frame.data.subarray(1);
                if (encoding === 0 || encoding === 3) {
                  // ISO-8859-1 or UTF-8
                  valueStr = textBuf.toString("utf-8").replace(/\0/g, "");
                } else if (encoding === 1) {
                  // UTF-16 with BOM
                  valueStr = textBuf.toString("utf16le").replace(/\0/g, "");
                } else {
                  valueStr = `(encoding=${encoding}) ${textBuf.subarray(0, 50).toString("hex")}`;
                }
              }
            } else if (frame.id === "TXXX") {
              if (frame.data.length > 1) {
                const textBuf = frame.data.subarray(1);
                const nullIdx = textBuf.indexOf(0x00);
                if (nullIdx >= 0) {
                  const desc = textBuf.subarray(0, nullIdx).toString("utf-8");
                  const val = textBuf.subarray(nullIdx + 1).toString("utf-8").replace(/\0/g, "");
                  valueStr = `"${desc}": "${val}"`;
                }
              }
            } else if (frame.id === "COMM" || frame.id === "USLT") {
              if (frame.data.length > 4) {
                const lang = frame.data.subarray(1, 4).toString("ascii");
                const rest = frame.data.subarray(4);
                const nullIdx = rest.indexOf(0x00);
                if (nullIdx >= 0) {
                  valueStr = `[${lang}] ${rest.subarray(nullIdx + 1).toString("utf-8").replace(/\0/g, "").substring(0, 100)}`;
                }
              }
            } else if (frame.id === "APIC" || frame.id === "PIC") {
              valueStr = `(image, ${frame.size} bytes)`;
            } else if (frame.id === "PRIV") {
              const nullIdx = frame.data.indexOf(0x00);
              if (nullIdx > 0) {
                valueStr = `owner="${frame.data.subarray(0, nullIdx).toString("ascii")}", ${frame.size - nullIdx - 1} data bytes`;
              }
            }

            let line = `  ${frame.id}: ${frame.size} bytes`;
            if (valueStr) line += ` = ${valueStr.substring(0, 150)}`;
            results.push(line);
          }
          results.push("");
        }

        // --- ID3v1 ---
        if (mp3.id3v1) {
          results.push(`=== ID3v1 Tag ===`);
          results.push(`Title: "${mp3.id3v1.title}"`);
          results.push(`Artist: "${mp3.id3v1.artist}"`);
          results.push(`Album: "${mp3.id3v1.album}"`);
          results.push(`Year: "${mp3.id3v1.year}"`);
          results.push(`Comment: "${mp3.id3v1.comment}"`);
          results.push(`Track: ${mp3.id3v1.track ?? "N/A"}`);
          results.push(`Genre: ${mp3.id3v1.genre}`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. mp3_structure
  {
    name: "mp3_structure",
    description:
      "MP3 frame structure visualization. Displays the first N frames with bitrate, padding bit, channel mode, and frame size for a detailed map of the file's audio frame layout.",
    schema: {
      file_path: z.string().describe("Path to MP3 audio file"),
      max_frames: z.number().optional().describe("Maximum frames to display (default: 50)"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const maxFrames = (args.max_frames as number | undefined) ?? 50;
        const buf = await readFileInput(filePath);
        const mp3 = parseMp3(buf);
        const results: string[] = [];

        results.push(`=== MP3 Frame Structure ===`);
        results.push(`File: ${filePath}`);
        results.push(`Total frames: ${mp3.frameCount}`);
        results.push(`Displaying first ${Math.min(maxFrames, mp3.frameCount)} frames`);
        results.push("");

        if (mp3.frameCount === 0) {
          return text(`No MP3 frames found.`);
        }

        // File layout overview
        results.push(`=== File Layout ===`);
        if (mp3.id3v2) {
          results.push(`[ID3v2: ${10 + mp3.id3v2.size}B] `);
        }
        if (mp3.gapBeforeFirstFrame > 0) {
          results.push(`[GAP: ${mp3.gapBeforeFirstFrame}B] `);
        }
        results.push(`[AUDIO: ${mp3.frameCount} frames] `);
        if (mp3.trailingData > 0) {
          results.push(`[TRAIL: ${mp3.trailingData}B] `);
        }
        if (mp3.id3v1) {
          results.push(`[ID3v1: 128B]`);
        }
        results.push("");

        // Column headers
        results.push(`${"Frame".padEnd(7)} ${"Offset".padEnd(10)} ${"Size".padEnd(7)} ${"BR".padEnd(5)} ${"SR".padEnd(7)} ${"Pad".padEnd(4)} ${"Ch".padEnd(14)} ${"CRC".padEnd(4)} ${"Gap"}`);
        results.push("-".repeat(80));

        const displayCount = Math.min(maxFrames, mp3.frameCount);
        for (let i = 0; i < displayCount; i++) {
          const f = mp3.frames[i];

          // Compute gap to next frame
          let gapStr = "";
          if (i < mp3.frameCount - 1) {
            const expectedNext = f.offset + f.frameSize;
            const actualNext = mp3.frames[i + 1].offset;
            const gap = actualNext - expectedNext;
            if (gap > 0) gapStr = `+${gap}B`;
            else if (gap < 0) gapStr = `${gap}B!`;
          }

          const line =
            `${String(i).padEnd(7)} ` +
            `0x${f.offset.toString(16).padStart(6, "0").padEnd(8)} ` +
            `${String(f.frameSize).padEnd(7)} ` +
            `${String(f.bitrate).padEnd(5)} ` +
            `${String(f.sampleRate).padEnd(7)} ` +
            `${(f.padding ? "Y" : "N").padEnd(4)} ` +
            `${f.channelMode.padEnd(14)} ` +
            `${(f.hasCRC ? "Y" : "N").padEnd(4)} ` +
            gapStr;

          results.push(line);
        }

        if (mp3.frameCount > displayCount) {
          results.push(`... (${mp3.frameCount - displayCount} more frames)`);
        }
        results.push("");

        // --- Bitrate map (visual) ---
        results.push(`=== Bitrate Map (first ${Math.min(200, mp3.frameCount)} frames) ===`);
        const bitrateMap: string[] = [];
        const allBitrates = [...new Set(mp3.frames.map((f) => f.bitrate))].sort((a, b) => a - b);
        const brMin = allBitrates[0];
        const brMax = allBitrates[allBitrates.length - 1];

        // Map bitrate to characters
        const mapCount = Math.min(200, mp3.frameCount);
        for (let i = 0; i < mapCount; i++) {
          const br = mp3.frames[i].bitrate;
          if (brMin === brMax) {
            bitrateMap.push("=");
          } else {
            const level = Math.round(((br - brMin) / (brMax - brMin)) * 9);
            bitrateMap.push(String(level));
          }
        }

        // Print in rows of 50
        for (let i = 0; i < bitrateMap.length; i += 50) {
          const chunk = bitrateMap.slice(i, i + 50).join("");
          results.push(`  ${String(i).padStart(5)}: ${chunk}`);
        }
        if (brMin !== brMax) {
          results.push(`  Legend: 0=${brMin}kbps ... 9=${brMax}kbps`);
        }
        results.push("");

        // --- Padding bit map ---
        results.push(`=== Padding Bit Map (first ${mapCount} frames) ===`);
        const paddingMap: string[] = [];
        for (let i = 0; i < mapCount; i++) {
          paddingMap.push(mp3.frames[i].padding ? "1" : "0");
        }

        for (let i = 0; i < paddingMap.length; i += 50) {
          const chunk = paddingMap.slice(i, i + 50).join("");
          results.push(`  ${String(i).padStart(5)}: ${chunk}`);
        }
        results.push(`  Legend: 1=padded, 0=unpadded`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
