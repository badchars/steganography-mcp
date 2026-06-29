import { z } from "zod";
import { readFileInput, hexDump, detectImageFormat } from "../utils/binary.js";
import { shannonEntropy, blockEntropy, byteFrequency } from "../utils/stats.js";
import { MAGIC_BYTES } from "../data/magic-bytes.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";
import { extname } from "node:path";

// ─── Helpers ───

/** Check if magic bytes match at a given offset in the buffer */
function matchesMagic(buf: Buffer, sig: typeof MAGIC_BYTES[number], baseOffset: number = 0): boolean {
  const start = baseOffset + sig.offset;
  if (start + sig.bytes.length > buf.length) return false;
  for (let i = 0; i < sig.bytes.length; i++) {
    if (buf[start + i] !== sig.bytes[i]) return false;
  }
  return true;
}

/** Find JPEG EOF marker (0xFF 0xD9) */
function findJpegEof(buf: Buffer): number {
  for (let i = buf.length - 2; i >= 0; i--) {
    if (buf[i] === 0xff && buf[i + 1] === 0xd9) return i + 2;
  }
  return -1;
}

/** Find PNG IEND chunk end */
function findPngIend(buf: Buffer): number {
  const iend = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  for (let i = 0; i <= buf.length - iend.length; i++) {
    if (buf.subarray(i, i + iend.length).equals(iend)) return i + iend.length;
  }
  return -1;
}

/** Find BMP file size from header */
function getBmpFileSize(buf: Buffer): number {
  if (buf.length < 6) return -1;
  return buf.readUInt32LE(2);
}

/** Find ZIP end of central directory */
function findZipEocd(buf: Buffer): number {
  const eocdSig = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.subarray(i, i + 4).equals(eocdSig)) {
      if (i + 22 > buf.length) continue;
      const commentLen = buf.readUInt16LE(i + 20);
      return i + 22 + commentLen;
    }
  }
  return -1;
}

/** Find PDF %%EOF marker */
function findPdfEof(buf: Buffer): number {
  const str = buf.toString("ascii", Math.max(0, buf.length - 1024), buf.length);
  const idx = str.lastIndexOf("%%EOF");
  if (idx === -1) return -1;
  const base = Math.max(0, buf.length - 1024);
  return base + idx + 5;
}

/** Check if a character code is printable ASCII */
function isPrintable(code: number): boolean {
  return code >= 0x20 && code <= 0x7e;
}

// ─── Tools ───

export const fileTools: ToolDef[] = [
  // 1. file_identify
  {
    name: "file_identify",
    description: "File type identification via magic bytes. Reads the file header and matches against a comprehensive database of known file signatures. Also checks for extension vs actual type mismatch.",
    schema: {
      file_path: z.string().describe("Path to file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const ext = extname(filePath).replace(/^\./, "").toLowerCase();

        const matches: Array<{
          extension: string;
          mime: string;
          description: string;
          offset: number;
          confidence: string;
        }> = [];

        for (const sig of MAGIC_BYTES) {
          if (matchesMagic(buf, sig)) {
            matches.push({
              extension: sig.extension,
              mime: sig.mime,
              description: sig.description,
              offset: sig.offset,
              confidence: sig.bytes.length >= 8 ? "high" : sig.bytes.length >= 4 ? "medium" : "low",
            });
          }
        }

        const primaryMatch = matches[0] || null;
        const extensionMismatch = primaryMatch && ext && ext !== primaryMatch.extension
          && !(primaryMatch.extension === "jpg" && ext === "jpeg")
          && !(primaryMatch.extension === "jpeg" && ext === "jpg");

        return json({
          file: filePath,
          size: buf.length,
          declaredExtension: ext || "(none)",
          identifiedType: primaryMatch
            ? { extension: primaryMatch.extension, mime: primaryMatch.mime, description: primaryMatch.description }
            : { extension: "unknown", mime: "application/octet-stream", description: "Unknown file type" },
          extensionMismatch: extensionMismatch
            ? { declared: ext, actual: primaryMatch!.extension, warning: "File extension does not match detected type" }
            : null,
          allMatches: matches,
          headerHex: buf.subarray(0, Math.min(32, buf.length)).toString("hex"),
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. file_polyglot
  {
    name: "file_polyglot",
    description: "Detect polyglot files that are valid as two or more different file formats simultaneously. Checks for multiple valid file signatures at different offsets (e.g., PDF+ZIP, PNG+PDF). Useful for CTF challenges and forensic analysis.",
    schema: {
      file_path: z.string().describe("Path to file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);

        // Check signatures at file start
        const startMatches: Array<{ extension: string; mime: string; description: string; offset: number }> = [];
        for (const sig of MAGIC_BYTES) {
          if (matchesMagic(buf, sig)) {
            startMatches.push({
              extension: sig.extension,
              mime: sig.mime,
              description: sig.description,
              offset: sig.offset,
            });
          }
        }

        // Scan interior of file for additional magic bytes (skip first 2 bytes to avoid re-matching start)
        const embeddedMatches: Array<{ extension: string; mime: string; description: string; foundAt: number }> = [];
        const scanStep = 1;
        const seenTypes = new Set(startMatches.map((m) => m.extension));

        for (let offset = 2; offset < buf.length - 2; offset += scanStep) {
          for (const sig of MAGIC_BYTES) {
            if (sig.offset !== 0) continue; // only check signatures that expect offset 0
            if (sig.bytes.length < 3) continue; // skip very short signatures for interior scan
            if (offset + sig.bytes.length > buf.length) continue;

            let match = true;
            for (let j = 0; j < sig.bytes.length; j++) {
              if (buf[offset + j] !== sig.bytes[j]) {
                match = false;
                break;
              }
            }

            if (match && !seenTypes.has(`${sig.extension}@${offset}`)) {
              seenTypes.add(`${sig.extension}@${offset}`);
              embeddedMatches.push({
                extension: sig.extension,
                mime: sig.mime,
                description: sig.description,
                foundAt: offset,
              });
            }
          }
        }

        // Deduplicate by extension for polyglot determination
        const allExtensions = new Set<string>();
        startMatches.forEach((m) => allExtensions.add(m.extension));
        embeddedMatches.forEach((m) => allExtensions.add(m.extension));

        const isPolyglot = allExtensions.size >= 2;

        return json({
          file: filePath,
          size: buf.length,
          isPolyglot,
          formatCount: allExtensions.size,
          formats: Array.from(allExtensions),
          startSignatures: startMatches,
          embeddedSignatures: embeddedMatches.slice(0, 50), // limit output
          analysis: isPolyglot
            ? `Polyglot detected: file is valid as ${Array.from(allExtensions).join(", ")}`
            : "No polyglot structure detected",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. file_embedded
  {
    name: "file_embedded",
    description: "Scan for embedded files within a binary, similar to binwalk. Searches for known magic byte signatures at every offset within the file to discover hidden or appended files, concatenated archives, and other embedded content.",
    schema: {
      file_path: z.string().describe("Path to file"),
      scan_depth: z.number().optional().describe("Bytes to scan (default: full file)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const scanDepth = (args.scan_depth as number | undefined) ?? buf.length;
        const limit = Math.min(scanDepth, buf.length);

        const found: Array<{
          offset: number;
          offsetHex: string;
          extension: string;
          mime: string;
          description: string;
          signatureLength: number;
        }> = [];

        for (let offset = 0; offset < limit; offset++) {
          for (const sig of MAGIC_BYTES) {
            if (sig.offset !== 0) continue; // only match sigs that start at offset 0 of their format
            if (offset + sig.bytes.length > limit) continue;
            if (sig.bytes.length < 3) continue; // skip very short sigs to reduce noise

            let match = true;
            for (let j = 0; j < sig.bytes.length; j++) {
              if (buf[offset + j] !== sig.bytes[j]) {
                match = false;
                break;
              }
            }

            if (match) {
              found.push({
                offset,
                offsetHex: "0x" + offset.toString(16).padStart(8, "0"),
                extension: sig.extension,
                mime: sig.mime,
                description: sig.description,
                signatureLength: sig.bytes.length,
              });
            }
          }
        }

        // Also check sigs with non-zero offsets
        for (const sig of MAGIC_BYTES) {
          if (sig.offset === 0) continue;
          if (sig.offset + sig.bytes.length > limit) continue;
          if (matchesMagic(buf, sig)) {
            found.push({
              offset: sig.offset,
              offsetHex: "0x" + sig.offset.toString(16).padStart(8, "0"),
              extension: sig.extension,
              mime: sig.mime,
              description: sig.description,
              signatureLength: sig.bytes.length,
            });
          }
        }

        // Sort by offset
        found.sort((a, b) => a.offset - b.offset);

        return json({
          file: filePath,
          fileSize: buf.length,
          scannedBytes: limit,
          embeddedFilesFound: found.length,
          files: found,
          summary: found.length > 1
            ? `Found ${found.length} embedded file signatures. First at offset 0x${found[0].offset.toString(16)}, potential hidden content detected.`
            : found.length === 1
              ? "Single file signature at start of file (normal)."
              : "No recognized file signatures found.",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. file_appended
  {
    name: "file_appended",
    description: "Detect data appended after a file's format-specific end-of-file marker. Supports PNG (IEND), JPEG (FFD9), BMP (file size header), ZIP (end of central directory), and PDF (%%EOF). Commonly used to hide data in images and documents.",
    schema: {
      file_path: z.string().describe("Path to file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);

        const format = detectImageFormat(buf);
        let eofOffset = -1;
        let formatName = "unknown";

        switch (format) {
          case "png":
            formatName = "PNG";
            eofOffset = findPngIend(buf);
            break;
          case "jpeg":
            formatName = "JPEG";
            eofOffset = findJpegEof(buf);
            break;
          case "bmp":
            formatName = "BMP";
            eofOffset = getBmpFileSize(buf);
            break;
          default: {
            // Try PDF
            if (buf.subarray(0, 4).toString("ascii") === "%PDF") {
              formatName = "PDF";
              eofOffset = findPdfEof(buf);
            }
            // Try ZIP
            else if (buf[0] === 0x50 && buf[1] === 0x4b) {
              formatName = "ZIP";
              eofOffset = findZipEocd(buf);
            }
            break;
          }
        }

        if (eofOffset === -1) {
          return json({
            file: filePath,
            fileSize: buf.length,
            format: formatName,
            eofDetected: false,
            hasAppendedData: false,
            note: "Could not determine EOF position for this format.",
          });
        }

        const appendedBytes = buf.length - eofOffset;
        const hasAppended = appendedBytes > 0;

        const result: Record<string, unknown> = {
          file: filePath,
          fileSize: buf.length,
          format: formatName,
          eofOffset,
          eofOffsetHex: "0x" + eofOffset.toString(16).padStart(8, "0"),
          hasAppendedData: hasAppended,
          appendedBytes,
        };

        if (hasAppended) {
          const preview = buf.subarray(eofOffset, Math.min(eofOffset + 256, buf.length));
          const appendedEntropy = shannonEntropy(buf.subarray(eofOffset));
          result.appendedDataEntropy = Number(appendedEntropy.toFixed(4));
          result.appendedDataPreviewHex = preview.toString("hex");

          // Check if appended data starts with known signature
          const appendedSignatures: string[] = [];
          for (const sig of MAGIC_BYTES) {
            if (sig.offset !== 0 || sig.bytes.length < 3) continue;
            if (eofOffset + sig.bytes.length > buf.length) continue;
            let match = true;
            for (let j = 0; j < sig.bytes.length; j++) {
              if (buf[eofOffset + j] !== sig.bytes[j]) { match = false; break; }
            }
            if (match) appendedSignatures.push(`${sig.description} (${sig.extension})`);
          }
          if (appendedSignatures.length > 0) {
            result.appendedFileType = appendedSignatures;
          }

          result.analysis = appendedEntropy > 7.0
            ? "Appended data has very high entropy - possibly encrypted or compressed content"
            : appendedEntropy > 5.0
              ? "Appended data has moderate-high entropy - possibly encoded or compressed"
              : "Appended data detected after EOF marker";
        }

        return json(result);
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. file_entropy
  {
    name: "file_entropy",
    description: "Section-by-section entropy analysis of a file. Calculates Shannon entropy per block and overall, flagging anomalous high-entropy sections that may indicate encrypted, compressed, or steganographically embedded data.",
    schema: {
      file_path: z.string().describe("Path to file"),
      block_size: z.number().optional().describe("Block size in bytes (default: 1024)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const bs = (args.block_size as number | undefined) ?? 1024;
        const buf = await readFileInput(filePath);

        const result = blockEntropy(buf, bs);
        const freq = byteFrequency(buf);

        // Flag anomalous blocks: entropy significantly different from average
        const anomalous = result.blocks.filter((b) => {
          const diff = Math.abs(b.entropy - result.averageBlockEntropy);
          return diff > 1.5 || b.classification === "encrypted";
        }).map((b) => ({
          offset: b.offset,
          offsetHex: "0x" + b.offset.toString(16).padStart(8, "0"),
          size: b.size,
          entropy: Number(b.entropy.toFixed(4)),
          classification: b.classification,
        }));

        return json({
          file: filePath,
          fileSize: buf.length,
          blockSize: bs,
          totalBlocks: result.blocks.length,
          overallEntropy: Number(result.overallEntropy.toFixed(4)),
          averageBlockEntropy: Number(result.averageBlockEntropy.toFixed(4)),
          highEntropyBlocks: result.highEntropyBlocks,
          uniformityScore: Number(freq.uniformityScore.toFixed(4)),
          entropyClassification: result.overallEntropy < 1.0 ? "very_low (repeated data)"
            : result.overallEntropy < 3.0 ? "low (simple/text)"
            : result.overallEntropy < 6.0 ? "normal"
            : result.overallEntropy < 7.5 ? "high (compressed/encoded)"
            : "very_high (encrypted/random)",
          anomalousBlocks: anomalous,
          blockSummary: result.blocks.map((b) => ({
            offset: b.offset,
            entropy: Number(b.entropy.toFixed(4)),
            classification: b.classification,
          })),
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. file_entropy_visual
  {
    name: "file_entropy_visual",
    description: "ASCII entropy visualization of a file. Renders a text-based bar chart showing entropy levels across the file, making it easy to visually spot high-entropy regions that may contain hidden data, encryption, or compression.",
    schema: {
      file_path: z.string().describe("Path to file"),
      block_size: z.number().optional().describe("Block size (default: 512)"),
      width: z.number().optional().describe("Chart width in characters (default: 60)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const bs = (args.block_size as number | undefined) ?? 512;
        const chartWidth = (args.width as number | undefined) ?? 60;
        const buf = await readFileInput(filePath);

        const result = blockEntropy(buf, bs);
        const maxEntropy = 8.0;

        const lines: string[] = [];
        lines.push(`File: ${filePath} (${buf.length} bytes)`);
        lines.push(`Block size: ${bs} bytes | Blocks: ${result.blocks.length}`);
        lines.push(`Overall entropy: ${result.overallEntropy.toFixed(4)} bits/byte`);
        lines.push("");
        lines.push("Offset      Entropy  Bar");
        lines.push("-".repeat(12 + 9 + chartWidth + 4));

        for (const block of result.blocks) {
          const ratio = Math.min(block.entropy / maxEntropy, 1.0);
          const filled = Math.round(ratio * chartWidth);
          const empty = chartWidth - filled;

          const marker = block.classification === "encrypted" ? "!" :
            block.classification === "high" ? "*" :
            block.classification === "low" ? "." : " ";

          const bar = "\u2593".repeat(filled) + "\u2591".repeat(empty);
          const offsetStr = "0x" + block.offset.toString(16).padStart(8, "0");
          const entropyStr = block.entropy.toFixed(3).padStart(7, " ");

          lines.push(`${offsetStr}  ${entropyStr}  |${bar}| ${marker}`);
        }

        lines.push("");
        lines.push("Legend: \u2593 = entropy level, ! = encrypted/random, * = high, . = low");
        lines.push(`Average block entropy: ${result.averageBlockEntropy.toFixed(4)}`);
        lines.push(`High entropy blocks (>=7.0): ${result.highEntropyBlocks} / ${result.blocks.length}`);

        return text(lines.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. file_strings
  {
    name: "file_strings",
    description: "Extract printable and Unicode strings from binary files, similar to the Unix 'strings' command. Scans for runs of printable characters of a configurable minimum length and reports them with their file offsets. Supports ASCII, UTF-8, and UTF-16.",
    schema: {
      file_path: z.string().describe("Path to file"),
      min_length: z.number().optional().describe("Minimum string length (default: 4)"),
      encoding: z.enum(["ascii", "utf8", "utf16le", "utf16be"]).optional().describe("Encoding to search for (default: ascii)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const minLen = (args.min_length as number | undefined) ?? 4;
        const encoding = (args.encoding as string | undefined) ?? "ascii";
        const buf = await readFileInput(filePath);

        const strings: Array<{ offset: number; offsetHex: string; value: string; length: number }> = [];

        if (encoding === "utf16le" || encoding === "utf16be") {
          const step = 2;
          let currentStr = "";
          let startOffset = 0;

          for (let i = 0; i <= buf.length - step; i += step) {
            const code = encoding === "utf16le"
              ? buf[i] | (buf[i + 1] << 8)
              : (buf[i] << 8) | buf[i + 1];

            if (code >= 0x20 && code <= 0x7e) {
              if (currentStr.length === 0) startOffset = i;
              currentStr += String.fromCharCode(code);
            } else {
              if (currentStr.length >= minLen) {
                strings.push({
                  offset: startOffset,
                  offsetHex: "0x" + startOffset.toString(16).padStart(8, "0"),
                  value: currentStr,
                  length: currentStr.length,
                });
              }
              currentStr = "";
            }
          }
          if (currentStr.length >= minLen) {
            strings.push({
              offset: startOffset,
              offsetHex: "0x" + startOffset.toString(16).padStart(8, "0"),
              value: currentStr,
              length: currentStr.length,
            });
          }
        } else {
          // ASCII / UTF-8 mode
          let currentStr = "";
          let startOffset = 0;

          for (let i = 0; i < buf.length; i++) {
            if (isPrintable(buf[i])) {
              if (currentStr.length === 0) startOffset = i;
              currentStr += String.fromCharCode(buf[i]);
            } else {
              if (currentStr.length >= minLen) {
                strings.push({
                  offset: startOffset,
                  offsetHex: "0x" + startOffset.toString(16).padStart(8, "0"),
                  value: currentStr,
                  length: currentStr.length,
                });
              }
              currentStr = "";
            }
          }
          if (currentStr.length >= minLen) {
            strings.push({
              offset: startOffset,
              offsetHex: "0x" + startOffset.toString(16).padStart(8, "0"),
              value: currentStr,
              length: currentStr.length,
            });
          }
        }

        // Limit output to prevent excessive results
        const maxResults = 500;
        const truncated = strings.length > maxResults;

        return json({
          file: filePath,
          fileSize: buf.length,
          encoding,
          minLength: minLen,
          totalStringsFound: strings.length,
          truncated,
          strings: strings.slice(0, maxResults),
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 8. file_hex
  {
    name: "file_hex",
    description: "Hex dump with ASCII sidebar display. Shows file contents in traditional hex editor format with offset addresses, hexadecimal byte values, and printable ASCII representation. Useful for manual inspection of binary file structures.",
    schema: {
      file_path: z.string().describe("Path to file"),
      offset: z.number().optional().describe("Start offset in bytes"),
      length: z.number().optional().describe("Number of bytes to dump (default: 512)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const startOffset = (args.offset as number | undefined) ?? 0;
        const len = (args.length as number | undefined) ?? 512;
        const buf = await readFileInput(filePath);

        if (startOffset >= buf.length) {
          return text(`Error: Offset ${startOffset} exceeds file size ${buf.length}`);
        }

        const dump = hexDump(buf, startOffset, len);

        const lines: string[] = [];
        lines.push(`File: ${filePath}`);
        lines.push(`Size: ${buf.length} bytes`);
        lines.push(`Showing: offset 0x${startOffset.toString(16)} - 0x${Math.min(startOffset + len, buf.length).toString(16)} (${Math.min(len, buf.length - startOffset)} bytes)`);
        lines.push("");
        lines.push("Offset    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  |ASCII           |");
        lines.push("-".repeat(80));
        lines.push(dump);

        return text(lines.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 9. file_header
  {
    name: "file_header",
    description: "Deep header and structure analysis for known file formats. Parses and displays format-specific header fields including PNG IHDR chunk, JPEG SOF markers, BMP info header, ZIP local file headers, and PDF version/metadata. Provides low-level structural insight.",
    schema: {
      file_path: z.string().describe("Path to file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const format = detectImageFormat(buf);

        const result: Record<string, unknown> = {
          file: filePath,
          fileSize: buf.length,
          headerHex: buf.subarray(0, Math.min(64, buf.length)).toString("hex"),
        };

        if (format === "png" && buf.length >= 33) {
          // PNG: 8-byte sig + IHDR chunk (4 len + 4 type + 13 data + 4 crc)
          const ihdrLen = buf.readUInt32BE(8);
          const ihdrType = buf.subarray(12, 16).toString("ascii");
          if (ihdrType === "IHDR" && buf.length >= 29) {
            const width = buf.readUInt32BE(16);
            const height = buf.readUInt32BE(20);
            const bitDepth = buf[24];
            const colorType = buf[25];
            const compression = buf[26];
            const filter = buf[27];
            const interlace = buf[28];

            const colorTypes: Record<number, string> = {
              0: "Grayscale", 2: "RGB", 3: "Indexed", 4: "Grayscale+Alpha", 6: "RGBA",
            };

            result.format = "PNG";
            result.png = {
              signature: buf.subarray(0, 8).toString("hex"),
              ihdr: {
                chunkLength: ihdrLen,
                width,
                height,
                bitDepth,
                colorType: colorTypes[colorType] ?? `Unknown(${colorType})`,
                compressionMethod: compression,
                filterMethod: filter,
                interlaceMethod: interlace === 0 ? "None" : "Adam7",
              },
            };

            // List all chunks
            const chunks: Array<{ type: string; offset: number; length: number }> = [];
            let pos = 8;
            while (pos + 12 <= buf.length) {
              const cLen = buf.readUInt32BE(pos);
              const cType = buf.subarray(pos + 4, pos + 8).toString("ascii");
              chunks.push({ type: cType, offset: pos, length: cLen });
              pos += 12 + cLen;
              if (cType === "IEND") break;
            }
            result.pngChunks = chunks;
          }
        } else if (format === "jpeg") {
          result.format = "JPEG";
          const jpeg: Record<string, unknown> = {};

          // Parse JPEG markers
          const markers: Array<{ marker: string; offset: number; length?: number; description: string }> = [];
          let pos = 0;

          while (pos < buf.length - 1) {
            if (buf[pos] !== 0xff) { pos++; continue; }
            const marker = buf[pos + 1];

            if (marker === 0xd8) {
              markers.push({ marker: "FFD8", offset: pos, description: "Start of Image (SOI)" });
              pos += 2;
            } else if (marker === 0xd9) {
              markers.push({ marker: "FFD9", offset: pos, description: "End of Image (EOI)" });
              pos += 2;
            } else if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xcc) {
              // SOF marker
              if (pos + 9 < buf.length) {
                const segLen = buf.readUInt16BE(pos + 2);
                const precision = buf[pos + 4];
                const height = buf.readUInt16BE(pos + 5);
                const width = buf.readUInt16BE(pos + 7);
                const components = buf[pos + 9];
                jpeg.sof = { marker: `FF${marker.toString(16).toUpperCase()}`, precision, height, width, components };
                markers.push({ marker: `FF${marker.toString(16).toUpperCase()}`, offset: pos, length: segLen, description: `SOF${marker - 0xc0} (${width}x${height})` });
              }
              pos += 2 + buf.readUInt16BE(pos + 2);
            } else if (marker === 0xe0) {
              // APP0 / JFIF
              const segLen = buf.readUInt16BE(pos + 2);
              if (buf.subarray(pos + 4, pos + 9).toString("ascii") === "JFIF\0") {
                jpeg.jfif = {
                  version: `${buf[pos + 9]}.${buf[pos + 10]}`,
                  densityUnit: buf[pos + 11],
                  xDensity: buf.readUInt16BE(pos + 12),
                  yDensity: buf.readUInt16BE(pos + 14),
                };
              }
              markers.push({ marker: "FFE0", offset: pos, length: segLen, description: "APP0 (JFIF)" });
              pos += 2 + segLen;
            } else if (marker === 0xe1) {
              const segLen = buf.readUInt16BE(pos + 2);
              markers.push({ marker: "FFE1", offset: pos, length: segLen, description: "APP1 (EXIF/XMP)" });
              pos += 2 + segLen;
            } else if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
              pos += 2;
            } else if (pos + 3 < buf.length) {
              const segLen = buf.readUInt16BE(pos + 2);
              markers.push({ marker: `FF${marker.toString(16).toUpperCase().padStart(2, "0")}`, offset: pos, length: segLen, description: `Segment 0x${marker.toString(16)}` });
              pos += 2 + segLen;
            } else {
              pos++;
            }
          }

          jpeg.markers = markers;
          result.jpeg = jpeg;
        } else if (format === "bmp" && buf.length >= 54) {
          result.format = "BMP";
          result.bmp = {
            signature: buf.subarray(0, 2).toString("ascii"),
            fileSize: buf.readUInt32LE(2),
            reserved1: buf.readUInt16LE(6),
            reserved2: buf.readUInt16LE(8),
            pixelDataOffset: buf.readUInt32LE(10),
            infoHeaderSize: buf.readUInt32LE(14),
            width: buf.readInt32LE(18),
            height: buf.readInt32LE(22),
            colorPlanes: buf.readUInt16LE(26),
            bitsPerPixel: buf.readUInt16LE(28),
            compression: buf.readUInt32LE(30),
            imageSize: buf.readUInt32LE(34),
            xPixelsPerMeter: buf.readInt32LE(38),
            yPixelsPerMeter: buf.readInt32LE(42),
            colorsUsed: buf.readUInt32LE(46),
            colorsImportant: buf.readUInt32LE(50),
          };
        } else if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
          // ZIP
          result.format = "ZIP";
          const entries: Array<{ fileName: string; compressedSize: number; uncompressedSize: number; method: number; offset: number }> = [];
          let pos = 0;

          while (pos + 30 <= buf.length) {
            if (buf[pos] !== 0x50 || buf[pos + 1] !== 0x4b || buf[pos + 2] !== 0x03 || buf[pos + 3] !== 0x04) break;

            const method = buf.readUInt16LE(pos + 8);
            const compSize = buf.readUInt32LE(pos + 18);
            const uncompSize = buf.readUInt32LE(pos + 22);
            const nameLen = buf.readUInt16LE(pos + 26);
            const extraLen = buf.readUInt16LE(pos + 28);
            const fileName = buf.subarray(pos + 30, pos + 30 + nameLen).toString("utf-8");

            entries.push({ fileName, compressedSize: compSize, uncompressedSize: uncompSize, method, offset: pos });
            pos += 30 + nameLen + extraLen + compSize;

            if (entries.length >= 100) break; // safety limit
          }

          result.zip = { entries, totalEntries: entries.length };
        } else if (buf.subarray(0, 4).toString("ascii") === "%PDF") {
          // PDF
          result.format = "PDF";
          const headerLine = buf.subarray(0, Math.min(20, buf.length)).toString("ascii").split("\n")[0];
          const version = headerLine.match(/%PDF-(\d+\.\d+)/)?.[1] ?? "unknown";

          const pdfText = buf.toString("ascii", 0, Math.min(buf.length, 65536));

          // Find /Info dictionary entries
          const infoFields: Record<string, string> = {};
          const fieldPatterns = [
            { key: "Title", regex: /\/Title\s*\(([^)]*)\)/i },
            { key: "Author", regex: /\/Author\s*\(([^)]*)\)/i },
            { key: "Creator", regex: /\/Creator\s*\(([^)]*)\)/i },
            { key: "Producer", regex: /\/Producer\s*\(([^)]*)\)/i },
            { key: "CreationDate", regex: /\/CreationDate\s*\(([^)]*)\)/i },
            { key: "ModDate", regex: /\/ModDate\s*\(([^)]*)\)/i },
          ];

          for (const { key, regex } of fieldPatterns) {
            const match = pdfText.match(regex);
            if (match) infoFields[key] = match[1];
          }

          result.pdf = {
            version,
            headerLine,
            metadata: Object.keys(infoFields).length > 0 ? infoFields : null,
            hasJavaScript: /\/JS\b/.test(pdfText),
            hasAutoAction: /\/AA\b/.test(pdfText),
            hasOpenAction: /\/OpenAction\b/.test(pdfText),
            hasEmbeddedFiles: /\/EmbeddedFile/.test(pdfText),
          };
        } else {
          result.format = "unknown";
          result.note = "Format not recognized for deep header analysis. Showing raw header bytes.";
        }

        return json(result);
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 10. file_compare
  {
    name: "file_compare",
    description: "Binary diff between two files. Compares files byte-by-byte and reports size comparison, first N differences with their offsets and values, percentage of identical bytes, and a summary of the changes. Useful for detecting steganographic modifications.",
    schema: {
      file_path_1: z.string().describe("First file path"),
      file_path_2: z.string().describe("Second file path"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const path1 = args.file_path_1 as string;
        const path2 = args.file_path_2 as string;
        const buf1 = await readFileInput(path1);
        const buf2 = await readFileInput(path2);

        const maxLen = Math.max(buf1.length, buf2.length);
        const minLen = Math.min(buf1.length, buf2.length);

        let identicalBytes = 0;
        const maxDiffs = 100;
        const diffs: Array<{
          offset: number;
          offsetHex: string;
          file1: string;
          file2: string;
          file1Decimal: number;
          file2Decimal: number;
        }> = [];

        for (let i = 0; i < minLen; i++) {
          if (buf1[i] === buf2[i]) {
            identicalBytes++;
          } else if (diffs.length < maxDiffs) {
            diffs.push({
              offset: i,
              offsetHex: "0x" + i.toString(16).padStart(8, "0"),
              file1: buf1[i].toString(16).padStart(2, "0"),
              file2: buf2[i].toString(16).padStart(2, "0"),
              file1Decimal: buf1[i],
              file2Decimal: buf2[i],
            });
          }
        }

        // Count differences in tail region
        const tailDiffs = maxLen - minLen;
        const totalDiffs = (minLen - identicalBytes) + tailDiffs;
        const percentIdentical = maxLen > 0 ? (identicalBytes / maxLen) * 100 : 100;

        // Check if differences are only in LSBs (potential steganography)
        let lsbOnlyDiffs = 0;
        for (const d of diffs) {
          const xor = parseInt(d.file1, 16) ^ parseInt(d.file2, 16);
          if (xor === 1) lsbOnlyDiffs++;
        }

        return json({
          file1: { path: path1, size: buf1.length },
          file2: { path: path2, size: buf2.length },
          sizeComparison: {
            sizeDifference: buf1.length - buf2.length,
            file1Larger: buf1.length > buf2.length,
            sameSizeFiles: buf1.length === buf2.length,
          },
          comparison: {
            totalBytes: maxLen,
            identicalBytes,
            differentBytes: totalDiffs,
            percentIdentical: Number(percentIdentical.toFixed(4)),
            truncatedDiffList: diffs.length >= maxDiffs,
          },
          differences: diffs,
          stegoAnalysis: {
            lsbOnlyDifferences: lsbOnlyDiffs,
            lsbDiffPercentage: diffs.length > 0 ? Number(((lsbOnlyDiffs / diffs.length) * 100).toFixed(2)) : 0,
            possibleLsbStego: lsbOnlyDiffs > diffs.length * 0.7 && diffs.length > 10,
          },
          summary: totalDiffs === 0
            ? "Files are identical"
            : `${totalDiffs} byte(s) differ out of ${maxLen} (${percentIdentical.toFixed(2)}% identical)`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
