import { z } from "zod";
import type { ToolDef, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump, bitsToBytes, bitsToString } from "../utils/binary.js";
import { shannonEntropy, chiSquareLsbTest, blockEntropy } from "../utils/stats.js";
import { parseWav, extractWavMetadata } from "../utils/wav-parser.js";

// ─── Helpers ───

/** Get sample values for a specific channel from interleaved samples */
function getChannelSamples(
  samples: Int16Array | Float32Array,
  numChannels: number,
  channel: number,
): number[] {
  const result: number[] = [];
  for (let i = channel; i < samples.length; i += numChannels) {
    result.push(samples[i]);
  }
  return result;
}

/** Extract LSB bits from sample values */
function extractSampleLsbs(samples: number[], maxBits: number): number[] {
  const bits: number[] = [];
  for (let i = 0; i < samples.length && bits.length < maxBits; i++) {
    // For signed 16-bit values, LSB is bit 0 of the absolute representation
    bits.push(Math.abs(samples[i]) & 1);
  }
  return bits;
}

/** Convert signed sample values to unsigned for histogram analysis */
function samplesToUnsigned(samples: number[], bitDepth: number): number[] {
  if (bitDepth <= 8) {
    return samples.map((s) => Math.max(0, Math.min(255, s + 128)));
  }
  // 16-bit: shift from [-32768, 32767] to [0, 65535], then scale to [0, 255]
  return samples.map((s) => Math.max(0, Math.min(255, Math.round((s + 32768) / 256))));
}

// ─── Tool Definitions ───

export const audioTools: ToolDef[] = [
  // 1. audio_detect
  {
    name: "audio_detect",
    description: "Auto-detect audio steganography in a WAV file. Runs LSB chi-square, entropy analysis, metadata inspection, and checks for appended data after the WAV data chunk.",
    schema: {
      file_path: z.string().describe("Path to audio file (WAV)"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const wav = await parseWav(filePath);
        const findings: string[] = [];
        let suspicionScore = 0;

        // --- Format info ---
        findings.push(`=== WAV Format ===`);
        findings.push(`Sample Rate: ${wav.sampleRate} Hz`);
        findings.push(`Bit Depth: ${wav.bitDepth}`);
        findings.push(`Channels: ${wav.numChannels}`);
        findings.push(`Samples: ${wav.numSamples} (per channel)`);
        findings.push(`Audio Format: ${wav.audioFormat === 1 ? "PCM" : wav.audioFormat === 3 ? "IEEE Float" : `Unknown (${wav.audioFormat})`}`);
        findings.push(`Data Size: ${wav.dataSize} bytes`);
        findings.push("");

        // --- LSB Chi-Square analysis ---
        findings.push(`=== LSB Chi-Square Analysis ===`);
        for (let ch = 0; ch < wav.numChannels; ch++) {
          const channelSamples = getChannelSamples(wav.samples, wav.numChannels, ch);
          const unsigned = samplesToUnsigned(channelSamples, wav.bitDepth);
          const lsbResult = chiSquareLsbTest(unsigned);
          findings.push(`Channel ${ch}: chi2=${lsbResult.chiSquare.toFixed(2)}, p=${lsbResult.pValue.toFixed(6)}, embedding_prob=${lsbResult.embeddingProbability.toFixed(4)}, verdict=${lsbResult.verdict}`);
          if (lsbResult.verdict === "likely_stego") suspicionScore += 3;
          else if (lsbResult.verdict === "suspicious") suspicionScore += 1;
        }
        findings.push("");

        // --- Entropy analysis ---
        findings.push(`=== Entropy Analysis ===`);
        const allSampleValues = Array.from(wav.samples).map((s) => Math.abs(s) & 0xff);
        const sampleEntropy = shannonEntropy(allSampleValues);
        findings.push(`Sample byte entropy: ${sampleEntropy.toFixed(4)} bits`);
        if (sampleEntropy > 7.5) {
          findings.push(`[!] Very high entropy — may indicate encrypted/compressed hidden data`);
          suspicionScore += 2;
        }

        // LSB-only entropy
        const lsbBits = extractSampleLsbs(Array.from(wav.samples), Math.min(wav.samples.length, 65536));
        const lsbEntropy = shannonEntropy(lsbBits);
        findings.push(`LSB bit entropy: ${lsbEntropy.toFixed(4)} bits (ideal random = 1.0)`);
        if (lsbEntropy > 0.998) {
          findings.push(`[!] LSB entropy near-perfect randomness — strong indicator of LSB steganography`);
          suspicionScore += 3;
        } else if (lsbEntropy > 0.99) {
          findings.push(`[!] LSB entropy very high — possible LSB steganography`);
          suspicionScore += 1;
        }
        findings.push("");

        // --- Metadata check ---
        findings.push(`=== Metadata ===`);
        const metadata = extractWavMetadata(wav.chunks);
        if (Object.keys(metadata).length > 0) {
          for (const [key, value] of Object.entries(metadata)) {
            findings.push(`  ${key}: ${value}`);
          }
        } else {
          findings.push(`  No RIFF INFO metadata found`);
        }

        // List all chunks
        findings.push(`\nChunks found: ${wav.chunks.map((c) => `${c.id}(${c.size})`).join(", ")}`);
        const unusualChunks = wav.chunks.filter((c) => !["fmt ", "data", "RIFF", "LIST", "fact"].includes(c.id));
        if (unusualChunks.length > 0) {
          findings.push(`[!] Unusual chunks detected: ${unusualChunks.map((c) => c.id).join(", ")}`);
          suspicionScore += 1;
        }
        findings.push("");

        // --- Appended data check ---
        findings.push(`=== Appended Data Check ===`);
        const expectedEnd = wav.dataOffset + wav.dataSize;
        const fileSize = wav.rawBuffer.length;
        const appendedBytes = fileSize - expectedEnd;
        if (appendedBytes > 8) {
          findings.push(`[!] ${appendedBytes} bytes of appended data found after WAV data chunk`);
          findings.push(`Appended data preview (hex):`);
          findings.push(hexDump(wav.rawBuffer, expectedEnd, Math.min(appendedBytes, 256)));
          suspicionScore += 3;
        } else {
          findings.push(`No significant appended data (${Math.max(0, appendedBytes)} trailing bytes)`);
        }
        findings.push("");

        // --- Overall verdict ---
        findings.push(`=== Overall Verdict ===`);
        findings.push(`Suspicion score: ${suspicionScore}/10+`);
        if (suspicionScore >= 5) {
          findings.push(`VERDICT: LIKELY STEGANOGRAPHY DETECTED`);
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

  // 2. audio_lsb_detect
  {
    name: "audio_lsb_detect",
    description: "PCM sample LSB statistical analysis. Performs chi-square test on LSBs grouped by value pairs to detect LSB replacement steganography in WAV audio.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const wav = await parseWav(filePath);
        const results: string[] = [];

        results.push(`=== Audio LSB Statistical Analysis ===`);
        results.push(`Format: ${wav.bitDepth}-bit ${wav.audioFormat === 1 ? "PCM" : "Float"}, ${wav.sampleRate}Hz, ${wav.numChannels}ch`);
        results.push(`Total samples: ${wav.samples.length} (${wav.numSamples} per channel)`);
        results.push("");

        for (let ch = 0; ch < wav.numChannels; ch++) {
          results.push(`--- Channel ${ch} ---`);
          const channelSamples = getChannelSamples(wav.samples, wav.numChannels, ch);

          // Chi-square on unsigned-mapped values (value pair analysis)
          const unsigned = samplesToUnsigned(channelSamples, wav.bitDepth);
          const lsbResult = chiSquareLsbTest(unsigned);

          results.push(`Chi-square statistic: ${lsbResult.chiSquare.toFixed(4)}`);
          results.push(`Degrees of freedom: ${lsbResult.degreesOfFreedom}`);
          results.push(`P-value: ${lsbResult.pValue.toFixed(6)}`);
          results.push(`Embedding probability: ${(lsbResult.embeddingProbability * 100).toFixed(2)}%`);
          results.push(`Verdict: ${lsbResult.verdict.toUpperCase()}`);
          results.push("");

          // LSB distribution
          let zeros = 0;
          let ones = 0;
          for (const s of channelSamples) {
            if (Math.abs(s) & 1) ones++;
            else zeros++;
          }
          const total = zeros + ones;
          results.push(`LSB distribution: 0=${zeros} (${((zeros / total) * 100).toFixed(2)}%), 1=${ones} (${((ones / total) * 100).toFixed(2)}%)`);
          const ratio = Math.min(zeros, ones) / Math.max(zeros, ones);
          results.push(`LSB balance ratio: ${ratio.toFixed(6)} (1.0 = perfectly balanced)`);
          if (ratio > 0.99) {
            results.push(`[!] Nearly perfect LSB balance — consistent with LSB embedding`);
          }
          results.push("");

          // Block-level analysis (check if stego is partial)
          const blockSize = Math.min(10000, Math.floor(channelSamples.length / 10));
          if (blockSize > 100) {
            results.push(`Block-level analysis (block size: ${blockSize} samples):`);
            const blockVerdicts: string[] = [];
            for (let bStart = 0; bStart < channelSamples.length; bStart += blockSize) {
              const bEnd = Math.min(bStart + blockSize, channelSamples.length);
              const block = unsigned.slice(bStart, bEnd);
              if (block.length < 50) continue;
              const blockResult = chiSquareLsbTest(block);
              blockVerdicts.push(`  Block ${Math.floor(bStart / blockSize)}: p=${blockResult.pValue.toFixed(4)} [${blockResult.verdict}]`);
            }
            results.push(...blockVerdicts.slice(0, 20));
            if (blockVerdicts.length > 20) {
              results.push(`  ... and ${blockVerdicts.length - 20} more blocks`);
            }
          }
          results.push("");
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. audio_lsb_extract
  {
    name: "audio_lsb_extract",
    description: "Extract LSB data from audio samples. Reads the least significant bit of each PCM sample and attempts to decode hidden data.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
      max_bytes: z.number().optional().describe("Max bytes to extract (default: 4096)"),
      channel: z.number().optional().describe("Audio channel (default: 0)"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const maxBytes = (args.max_bytes as number | undefined) ?? 4096;
        const channel = (args.channel as number | undefined) ?? 0;
        const wav = await parseWav(filePath);

        if (channel >= wav.numChannels) {
          return text(`Error: Channel ${channel} does not exist (file has ${wav.numChannels} channels)`);
        }

        const results: string[] = [];
        results.push(`=== LSB Extraction ===`);
        results.push(`File: ${filePath}`);
        results.push(`Channel: ${channel}, Max bytes: ${maxBytes}`);
        results.push(`Format: ${wav.bitDepth}-bit, ${wav.sampleRate}Hz`);
        results.push("");

        const channelSamples = getChannelSamples(wav.samples, wav.numChannels, channel);
        const maxBits = maxBytes * 8;
        const lsbBits = extractSampleLsbs(channelSamples, maxBits);

        results.push(`Extracted ${lsbBits.length} LSB bits (${Math.floor(lsbBits.length / 8)} bytes)`);
        results.push("");

        // Convert to bytes
        const extracted = bitsToBytes(lsbBits);

        // Try UTF-8 decode
        results.push(`=== UTF-8 Decode Attempt ===`);
        const decoded = bitsToString(lsbBits);
        // Check how many printable ASCII characters there are
        let printableCount = 0;
        for (let i = 0; i < decoded.length; i++) {
          const code = decoded.charCodeAt(i);
          if (code >= 32 && code <= 126) printableCount++;
        }
        const printableRatio = decoded.length > 0 ? printableCount / decoded.length : 0;

        if (printableRatio > 0.7) {
          results.push(`High printable ratio (${(printableRatio * 100).toFixed(1)}%) — likely contains text:`);
          // Show first 1000 chars
          const preview = decoded.substring(0, 1000);
          results.push(preview);
          if (decoded.length > 1000) results.push(`... (${decoded.length - 1000} more characters)`);
        } else {
          results.push(`Low printable ratio (${(printableRatio * 100).toFixed(1)}%) — data is likely binary or no text message embedded`);
          // Show first 100 chars anyway
          const safePreview = decoded.substring(0, 100).replace(/[^\x20-\x7E]/g, ".");
          results.push(`Preview: ${safePreview}`);
        }
        results.push("");

        // Check for null terminator (common in embedded messages)
        const nullIdx = extracted.indexOf(0x00);
        if (nullIdx > 0 && nullIdx < 1000) {
          results.push(`Null byte found at offset ${nullIdx} — possible message boundary`);
          const msgBytes = extracted.subarray(0, nullIdx);
          const msgText = msgBytes.toString("utf-8");
          const msgPrintable = [...msgText].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
          if (msgPrintable / msgText.length > 0.8) {
            results.push(`Message before null: "${msgText}"`);
          }
          results.push("");
        }

        // Hex dump
        results.push(`=== Hex Dump (first 256 bytes) ===`);
        results.push(hexDump(extracted, 0, Math.min(256, extracted.length)));

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. audio_spectrum
  {
    name: "audio_spectrum",
    description: "Basic spectral analysis for hidden signals in WAV audio. Analyzes sample value distribution, zero-crossing rate, RMS energy per block, and detects anomalous quiet sections with high entropy.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const wav = await parseWav(filePath);
        const results: string[] = [];

        results.push(`=== Audio Spectral Analysis ===`);
        results.push(`Format: ${wav.bitDepth}-bit, ${wav.sampleRate}Hz, ${wav.numChannels}ch`);
        results.push(`Duration: ${(wav.numSamples / wav.sampleRate).toFixed(2)}s`);
        results.push("");

        for (let ch = 0; ch < wav.numChannels; ch++) {
          results.push(`--- Channel ${ch} ---`);
          const channelSamples = getChannelSamples(wav.samples, wav.numChannels, ch);

          // Global statistics
          let min = Infinity, max = -Infinity, sum = 0, sumSq = 0;
          for (const s of channelSamples) {
            if (s < min) min = s;
            if (s > max) max = s;
            sum += s;
            sumSq += s * s;
          }
          const mean = sum / channelSamples.length;
          const rmsGlobal = Math.sqrt(sumSq / channelSamples.length);
          const variance = sumSq / channelSamples.length - mean * mean;
          const stddev = Math.sqrt(Math.max(0, variance));

          results.push(`Sample range: [${min}, ${max}]`);
          results.push(`Mean: ${mean.toFixed(2)}, StdDev: ${stddev.toFixed(2)}`);
          results.push(`Global RMS energy: ${rmsGlobal.toFixed(2)}`);
          results.push("");

          // Zero-crossing rate (per block)
          const blockSizeSamples = Math.min(4096, Math.floor(channelSamples.length / 10));
          if (blockSizeSamples < 64) {
            results.push(`File too short for block analysis`);
            continue;
          }

          results.push(`Block analysis (block size: ${blockSizeSamples} samples):`);
          const blockStats: { idx: number; zcr: number; rms: number; entropy: number }[] = [];
          const anomalies: string[] = [];

          for (let bStart = 0; bStart < channelSamples.length; bStart += blockSizeSamples) {
            const bEnd = Math.min(bStart + blockSizeSamples, channelSamples.length);
            const block = channelSamples.slice(bStart, bEnd);
            if (block.length < 64) continue;

            // Zero-crossing rate
            let zeroCrossings = 0;
            for (let i = 1; i < block.length; i++) {
              if ((block[i] >= 0 && block[i - 1] < 0) || (block[i] < 0 && block[i - 1] >= 0)) {
                zeroCrossings++;
              }
            }
            const zcr = zeroCrossings / block.length;

            // RMS energy
            let blockSumSq = 0;
            for (const s of block) blockSumSq += s * s;
            const rms = Math.sqrt(blockSumSq / block.length);

            // LSB entropy of this block
            const blockLsbs = block.map((s) => Math.abs(s) & 1);
            const ent = shannonEntropy(blockLsbs);

            blockStats.push({ idx: Math.floor(bStart / blockSizeSamples), zcr, rms, entropy: ent });

            // Anomaly: quiet section (low RMS) with high LSB entropy
            if (rms < rmsGlobal * 0.1 && ent > 0.99) {
              anomalies.push(`  [!] Block ${Math.floor(bStart / blockSizeSamples)}: QUIET (rms=${rms.toFixed(1)}) but HIGH LSB entropy (${ent.toFixed(4)}) — possible hidden data in silence`);
            }

            // Anomaly: very high zero-crossing with low amplitude
            if (zcr > 0.45 && rms < rmsGlobal * 0.3) {
              anomalies.push(`  [!] Block ${Math.floor(bStart / blockSizeSamples)}: High ZCR (${zcr.toFixed(3)}) with low energy — unusual pattern`);
            }
          }

          // Summary table (show first/last few)
          const showBlocks = blockStats.slice(0, 10);
          for (const b of showBlocks) {
            results.push(`  Block ${b.idx}: ZCR=${b.zcr.toFixed(4)}, RMS=${b.rms.toFixed(1)}, LSB_Ent=${b.entropy.toFixed(4)}`);
          }
          if (blockStats.length > 10) {
            results.push(`  ... (${blockStats.length - 10} more blocks)`);
          }
          results.push("");

          // Report anomalies
          if (anomalies.length > 0) {
            results.push(`Anomalies detected (${anomalies.length}):`);
            results.push(...anomalies.slice(0, 20));
            if (anomalies.length > 20) results.push(`  ... and ${anomalies.length - 20} more`);
          } else {
            results.push(`No spectral anomalies detected`);
          }
          results.push("");
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. audio_metadata
  {
    name: "audio_metadata",
    description: "Extract metadata from a WAV file including RIFF INFO chunks, format details, and all chunk information.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const wav = await parseWav(filePath);
        const results: string[] = [];

        results.push(`=== WAV Audio Metadata ===`);
        results.push(`File: ${filePath}`);
        results.push(`File size: ${wav.rawBuffer.length} bytes`);
        results.push("");

        // Format details
        results.push(`=== Format ===`);
        results.push(`Audio Format: ${wav.audioFormat} (${wav.audioFormat === 1 ? "PCM" : wav.audioFormat === 3 ? "IEEE Float" : "Compressed"})`);
        results.push(`Channels: ${wav.numChannels}`);
        results.push(`Sample Rate: ${wav.sampleRate} Hz`);
        results.push(`Bit Depth: ${wav.bitDepth}`);
        results.push(`Byte Rate: ${wav.byteRate} bytes/sec`);
        results.push(`Block Align: ${wav.blockAlign}`);
        results.push(`Duration: ${(wav.numSamples / wav.sampleRate).toFixed(3)} seconds`);
        results.push(`Total Samples: ${wav.numSamples} (per channel), ${wav.samples.length} (total)`);
        results.push(`Data Offset: ${wav.dataOffset}`);
        results.push(`Data Size: ${wav.dataSize} bytes`);
        results.push("");

        // RIFF INFO metadata
        results.push(`=== RIFF INFO Metadata ===`);
        const metadata = extractWavMetadata(wav.chunks);
        if (Object.keys(metadata).length > 0) {
          for (const [key, value] of Object.entries(metadata)) {
            results.push(`  ${key}: ${value}`);
          }
        } else {
          results.push(`  (none found)`);
        }
        results.push("");

        // All chunks
        results.push(`=== RIFF Chunks ===`);
        for (const chunk of wav.chunks) {
          results.push(`  ${chunk.id} — offset: ${chunk.offset}, size: ${chunk.size} bytes`);
          // Show non-standard chunk content preview
          if (!["fmt ", "data", "LIST", "fact"].includes(chunk.id) && chunk.size > 0) {
            const preview = hexDump(chunk.data, 0, Math.min(64, chunk.data.length));
            results.push(`    Preview: ${preview.split("\n")[0]}`);
          }
        }
        results.push("");

        // Trailing data
        const expectedEnd = wav.dataOffset + wav.dataSize;
        const trailing = wav.rawBuffer.length - expectedEnd;
        if (trailing > 0) {
          results.push(`=== Trailing Data ===`);
          results.push(`${trailing} bytes after WAV data chunk`);
          if (trailing > 8) {
            results.push(hexDump(wav.rawBuffer, expectedEnd, Math.min(128, trailing)));
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. audio_silence
  {
    name: "audio_silence",
    description: "Analyze silent sections in WAV audio for hidden data. Finds near-zero sample regions and checks their LSBs — silent sections with active LSBs are a strong indicator of steganography.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
      threshold: z.number().optional().describe("Silence threshold (default: 10)"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const threshold = (args.threshold as number | undefined) ?? 10;
        const wav = await parseWav(filePath);
        const results: string[] = [];

        results.push(`=== Silent Section Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Silence threshold: |sample| <= ${threshold}`);
        results.push(`Format: ${wav.bitDepth}-bit, ${wav.sampleRate}Hz, ${wav.numChannels}ch`);
        results.push("");

        for (let ch = 0; ch < wav.numChannels; ch++) {
          results.push(`--- Channel ${ch} ---`);
          const channelSamples = getChannelSamples(wav.samples, wav.numChannels, ch);

          // Find silent regions (contiguous runs of near-zero samples)
          const silentRegions: { start: number; end: number }[] = [];
          let regionStart = -1;

          for (let i = 0; i < channelSamples.length; i++) {
            const isSilent = Math.abs(channelSamples[i]) <= threshold;
            if (isSilent && regionStart === -1) {
              regionStart = i;
            } else if (!isSilent && regionStart !== -1) {
              if (i - regionStart >= 100) {
                silentRegions.push({ start: regionStart, end: i });
              }
              regionStart = -1;
            }
          }
          if (regionStart !== -1 && channelSamples.length - regionStart >= 100) {
            silentRegions.push({ start: regionStart, end: channelSamples.length });
          }

          const totalSilentSamples = silentRegions.reduce((acc, r) => acc + (r.end - r.start), 0);
          results.push(`Silent regions found: ${silentRegions.length}`);
          results.push(`Total silent samples: ${totalSilentSamples} (${((totalSilentSamples / channelSamples.length) * 100).toFixed(1)}%)`);
          results.push("");

          if (silentRegions.length === 0) {
            results.push(`No significant silent regions detected`);
            results.push("");
            continue;
          }

          // Analyze LSBs within silent regions
          let suspiciousRegions = 0;
          const regionDetails: string[] = [];

          for (let ri = 0; ri < Math.min(silentRegions.length, 20); ri++) {
            const region = silentRegions[ri];
            const regionSamples = channelSamples.slice(region.start, region.end);
            const regionLength = region.end - region.start;
            const durationMs = ((regionLength / wav.sampleRate) * 1000).toFixed(1);

            // Extract LSBs from silent region
            const lsbs = regionSamples.map((s) => Math.abs(s) & 1);
            const lsbEntropy = shannonEntropy(lsbs);

            // Count 0s and 1s in LSBs
            const onesCount = lsbs.reduce((a, b) => a + b, 0);
            const zerosCount = lsbs.length - onesCount;
            const balance = Math.min(onesCount, zerosCount) / Math.max(onesCount, zerosCount);

            const isSuspicious = lsbEntropy > 0.95 && balance > 0.9;
            if (isSuspicious) suspiciousRegions++;

            regionDetails.push(
              `  Region ${ri}: samples ${region.start}-${region.end} (${regionLength} samples, ${durationMs}ms)` +
              `\n    LSB entropy: ${lsbEntropy.toFixed(4)}, balance: ${balance.toFixed(4)} (0=${zerosCount}, 1=${onesCount})` +
              (isSuspicious ? `\n    [!] SUSPICIOUS: High LSB activity in silent region` : "")
            );
          }

          if (silentRegions.length > 20) {
            regionDetails.push(`  ... and ${silentRegions.length - 20} more regions`);
          }

          results.push(...regionDetails);
          results.push("");

          // Summary
          if (suspiciousRegions > 0) {
            results.push(`[!] ${suspiciousRegions} suspicious silent region(s) with active LSBs detected`);
            results.push(`This is a strong indicator of audio steganography — data hidden in silence`);
          } else {
            results.push(`No suspicious LSB activity in silent regions`);
          }
          results.push("");
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. audio_echo_detect
  {
    name: "audio_echo_detect",
    description: "Echo hiding detection via autocorrelation analysis. Computes normalized autocorrelation at common echo delays (50-1000 samples). Unusually regular echo patterns indicate steganographic echo hiding.",
    schema: {
      file_path: z.string().describe("Path to WAV file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const wav = await parseWav(filePath);
        const results: string[] = [];

        results.push(`=== Echo Hiding Detection ===`);
        results.push(`File: ${filePath}`);
        results.push(`Format: ${wav.bitDepth}-bit, ${wav.sampleRate}Hz, ${wav.numChannels}ch`);
        results.push(`Duration: ${(wav.numSamples / wav.sampleRate).toFixed(2)}s`);
        results.push("");

        for (let ch = 0; ch < wav.numChannels; ch++) {
          results.push(`--- Channel ${ch} ---`);
          const channelSamples = getChannelSamples(wav.samples, wav.numChannels, ch);

          // Limit analysis window to manage computation
          const maxWindow = Math.min(channelSamples.length, 100000);
          const samples = channelSamples.slice(0, maxWindow);

          // Compute autocorrelation at specific delays
          // Echo hiding typically uses delays of 50-1000 samples
          const delays = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];
          const autocorrelations: { delay: number; correlation: number; delayMs: number }[] = [];

          // Compute energy for normalization
          let energy = 0;
          for (const s of samples) energy += s * s;
          if (energy === 0) {
            results.push(`  Silent channel — skipping`);
            results.push("");
            continue;
          }

          for (const delay of delays) {
            if (delay >= samples.length) continue;
            let crossCorr = 0;
            const n = samples.length - delay;
            for (let i = 0; i < n; i++) {
              crossCorr += samples[i] * samples[i + delay];
            }
            // Normalized autocorrelation
            const norm = crossCorr / energy;
            const delayMs = (delay / wav.sampleRate) * 1000;
            autocorrelations.push({ delay, correlation: norm, delayMs });
          }

          results.push(`Autocorrelation at common echo delays:`);
          for (const ac of autocorrelations) {
            const bar = "#".repeat(Math.max(0, Math.round(Math.abs(ac.correlation) * 50)));
            results.push(`  delay=${ac.delay} (${ac.delayMs.toFixed(2)}ms): r=${ac.correlation.toFixed(6)} ${bar}`);
          }
          results.push("");

          // Detect suspicious patterns
          const anomalies: string[] = [];

          // Check for unusually high correlations at specific delays
          const sortedByCorr = [...autocorrelations].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
          const topCorr = sortedByCorr[0];
          if (topCorr && Math.abs(topCorr.correlation) > 0.3) {
            anomalies.push(`Strong correlation peak at delay ${topCorr.delay} (${topCorr.delayMs.toFixed(2)}ms): r=${topCorr.correlation.toFixed(6)}`);
          }

          // Check for regular spacing in correlation peaks (hallmark of echo hiding)
          const highCorrs = autocorrelations.filter((ac) => Math.abs(ac.correlation) > 0.15);
          if (highCorrs.length >= 3) {
            // Check if peaks are evenly spaced
            const diffs: number[] = [];
            for (let i = 1; i < highCorrs.length; i++) {
              diffs.push(highCorrs[i].delay - highCorrs[i - 1].delay);
            }
            const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            const diffVariance = diffs.reduce((a, d) => a + (d - avgDiff) ** 2, 0) / diffs.length;
            const diffStdDev = Math.sqrt(diffVariance);

            if (diffStdDev < avgDiff * 0.15 && avgDiff > 0) {
              anomalies.push(`[!] Regularly spaced correlation peaks detected (spacing ~${avgDiff.toFixed(0)} samples, stddev=${diffStdDev.toFixed(1)})`);
              anomalies.push(`    This pattern is consistent with echo hiding steganography`);
            }
          }

          // Block-level echo analysis (check if echo pattern changes — indicates bit encoding)
          const blockSize = Math.min(10000, Math.floor(samples.length / 8));
          if (blockSize > 500 && topCorr) {
            const testDelay = topCorr.delay;
            const blockCorrs: number[] = [];

            for (let bStart = 0; bStart + blockSize <= samples.length; bStart += blockSize) {
              const block = samples.slice(bStart, bStart + blockSize);
              let bEnergy = 0;
              let bCross = 0;
              for (let i = 0; i < block.length - testDelay; i++) {
                bEnergy += block[i] * block[i];
                bCross += block[i] * block[i + testDelay];
              }
              if (bEnergy > 0) blockCorrs.push(bCross / bEnergy);
            }

            if (blockCorrs.length >= 4) {
              // If echo strength alternates between blocks, it indicates bit encoding
              let alternations = 0;
              const median = [...blockCorrs].sort((a, b) => a - b)[Math.floor(blockCorrs.length / 2)];
              let prev = blockCorrs[0] > median;
              for (let i = 1; i < blockCorrs.length; i++) {
                const curr = blockCorrs[i] > median;
                if (curr !== prev) alternations++;
                prev = curr;
              }
              const alternationRate = alternations / (blockCorrs.length - 1);

              results.push(`Block echo correlation analysis (delay=${testDelay}):`);
              for (let i = 0; i < Math.min(blockCorrs.length, 15); i++) {
                results.push(`  Block ${i}: r=${blockCorrs[i].toFixed(6)}`);
              }
              if (blockCorrs.length > 15) results.push(`  ... (${blockCorrs.length - 15} more)`);

              results.push(`Alternation rate: ${(alternationRate * 100).toFixed(1)}%`);
              if (alternationRate > 0.6) {
                anomalies.push(`[!] Echo strength alternates between blocks — possible echo hiding bit encoding`);
              }
              results.push("");
            }
          }

          // Verdict
          if (anomalies.length > 0) {
            results.push(`Anomalies:`);
            for (const a of anomalies) results.push(`  ${a}`);
            results.push("");
            results.push(`VERDICT: Potential echo hiding steganography detected`);
          } else {
            results.push(`No echo hiding patterns detected`);
          }
          results.push("");
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
