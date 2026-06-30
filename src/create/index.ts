import { z } from "zod";
import { readFileInput, hexDump, detectImageFormat } from "../utils/binary.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";
import { writeFile } from "node:fs/promises";

// ─── Helpers ───

/** Encode a string to binary bits (each char -> 8 bits) */
function stringToBinaryBits(str: string): number[] {
  const bits: number[] = [];
  const buf = Buffer.from(str, "utf-8");
  for (const byte of buf) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

/** Find PNG IEND chunk offset (start of the IEND chunk, not the end) */
function findPngIendStart(buf: Buffer): number {
  const iendType = Buffer.from([0x49, 0x45, 0x4e, 0x44]);
  // IEND chunk: 4-byte length (0) + 4-byte type + 4-byte CRC = at chunk start
  for (let i = 8; i + 12 <= buf.length; i++) {
    if (buf.subarray(i + 4, i + 8).equals(iendType)) {
      return i; // offset of the length field of IEND
    }
  }
  return -1;
}

/** Find the last JPEG EOI marker (0xFF 0xD9) position */
function findJpegEoi(buf: Buffer): number {
  for (let i = buf.length - 2; i >= 0; i--) {
    if (buf[i] === 0xff && buf[i + 1] === 0xd9) return i + 2;
  }
  return -1;
}

/** Find PNG tEXt insertion point (just before IEND) */
function findPngTextInsertionPoint(buf: Buffer): number {
  const iendStart = findPngIendStart(buf);
  return iendStart >= 0 ? iendStart : -1;
}

/** Build a PNG tEXt chunk: keyword + null + text */
function buildPngTextChunk(keyword: string, textContent: string): Buffer {
  const keyBuf = Buffer.from(keyword, "latin1");
  const textBuf = Buffer.from(textContent, "latin1");
  const dataLen = keyBuf.length + 1 + textBuf.length; // +1 for null separator
  const chunk = Buffer.alloc(12 + dataLen);

  // Length (4 bytes, big-endian)
  chunk.writeUInt32BE(dataLen, 0);
  // Type: tEXt
  chunk.write("tEXt", 4, 4, "ascii");
  // Data: keyword + 0x00 + text
  keyBuf.copy(chunk, 8);
  chunk[8 + keyBuf.length] = 0x00;
  textBuf.copy(chunk, 8 + keyBuf.length + 1);
  // CRC (over type + data)
  const crc = crc32Png(chunk.subarray(4, 8 + dataLen));
  chunk.writeUInt32BE(crc >>> 0, 8 + dataLen);

  return chunk;
}

/** Build a JPEG COM (comment) segment */
function buildJpegComSegment(comment: string): Buffer {
  const commentBuf = Buffer.from(comment, "utf-8");
  const segLen = 2 + commentBuf.length; // 2 bytes for length field itself + comment
  const seg = Buffer.alloc(2 + segLen);
  seg[0] = 0xff;
  seg[1] = 0xfe; // COM marker
  seg.writeUInt16BE(segLen, 2);
  commentBuf.copy(seg, 4);
  return seg;
}

/** CRC-32 for PNG chunks (ISO 3309 / ITU-T V.42) */
function crc32Png(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return crc ^ 0xffffffff;
}

/** Find GIF trailer (0x3B) and comment extension insertion point */
function findGifTrailer(buf: Buffer): number {
  for (let i = buf.length - 1; i >= 0; i--) {
    if (buf[i] === 0x3b) return i;
  }
  return -1;
}

/** Build a GIF comment extension block */
function buildGifCommentExtension(comment: string): Buffer {
  const commentBuf = Buffer.from(comment, "utf-8");
  const chunks: Buffer[] = [];

  // Extension introducer (0x21) + Comment label (0xFE)
  chunks.push(Buffer.from([0x21, 0xfe]));

  // Split comment into sub-blocks of up to 255 bytes
  let offset = 0;
  while (offset < commentBuf.length) {
    const blockLen = Math.min(255, commentBuf.length - offset);
    const block = Buffer.alloc(1 + blockLen);
    block[0] = blockLen;
    commentBuf.copy(block, 1, offset, offset + blockLen);
    chunks.push(block);
    offset += blockLen;
  }

  // Block terminator
  chunks.push(Buffer.from([0x00]));

  return Buffer.concat(chunks);
}

// ─── Tools ───

export const createTools: ToolDef[] = [
  // 1. create_eof_inject
  {
    name: "create_eof_inject",
    description:
      "Append data after a file's end-of-file marker. The injected data is invisible to most viewers/parsers since they stop reading at the format EOF. Supports any file format — simply appends the given data string to the file's end.",
    schema: {
      file_path: z.string().describe("Path to the cover file"),
      data: z.string().describe("String data to inject after EOF"),
      output_path: z.string().describe("Path for the output file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const data = args.data as string;
        const outputPath = args.output_path as string;

        const buf = await readFileInput(filePath);
        const dataBuf = Buffer.from(data, "utf-8");
        const output = Buffer.concat([buf, dataBuf]);

        await writeFile(outputPath, output);

        return json({
          success: true,
          coverFile: filePath,
          outputFile: outputPath,
          originalSize: buf.length,
          injectedBytes: dataBuf.length,
          outputSize: output.length,
          method: "EOF append",
          note: "Data appended after file end. Most viewers will ignore the appended data.",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. create_metadata
  {
    name: "create_metadata",
    description:
      "Inject data into a file's metadata fields. For PNG files, inserts a tEXt chunk with the given field name and data. For JPEG files, inserts EXIF APP1 data. The injected metadata persists in the file and is accessible via metadata readers.",
    schema: {
      file_path: z.string().describe("Path to the cover file"),
      field: z.string().describe("Metadata field name (e.g., 'Comment', 'Author', 'Description')"),
      data: z.string().describe("Data to inject into the metadata field"),
      output_path: z.string().describe("Path for the output file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const field = args.field as string;
        const data = args.data as string;
        const outputPath = args.output_path as string;

        const buf = await readFileInput(filePath);
        const format = detectImageFormat(buf);

        let output: Buffer;
        let method: string;

        if (format === "png") {
          // Insert a tEXt chunk before IEND
          const insertPoint = findPngTextInsertionPoint(buf);
          if (insertPoint < 0) {
            return text("Error: Could not find IEND chunk in PNG file");
          }
          const textChunk = buildPngTextChunk(field, data);
          output = Buffer.concat([
            buf.subarray(0, insertPoint),
            textChunk,
            buf.subarray(insertPoint),
          ]);
          method = `PNG tEXt chunk (keyword: "${field}")`;
        } else if (format === "jpeg") {
          // Insert a COM segment after the SOI marker (FFD8)
          // We use the COM marker with the field name prefix
          const comData = `${field}: ${data}`;
          const comSeg = buildJpegComSegment(comData);
          // Insert right after SOI (offset 2)
          output = Buffer.concat([
            buf.subarray(0, 2),
            comSeg,
            buf.subarray(2),
          ]);
          method = `JPEG COM segment (field: "${field}")`;
        } else {
          // Generic: append as a comment-like block
          const marker = Buffer.from(`\n<!-- ${field}: ${data} -->\n`, "utf-8");
          output = Buffer.concat([buf, marker]);
          method = `Generic append (field: "${field}")`;
        }

        await writeFile(outputPath, output);

        return json({
          success: true,
          coverFile: filePath,
          outputFile: outputPath,
          format: format === "unknown" ? "generic" : format,
          method,
          fieldName: field,
          dataLength: data.length,
          originalSize: buf.length,
          outputSize: output.length,
          sizeIncrease: output.length - buf.length,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. create_whitespace
  {
    name: "create_whitespace",
    description:
      "Embed data in file whitespace using trailing spaces and tabs on text lines. Each bit of the secret data is encoded as a trailing space (0) or tab (1) appended to lines in the cover text file. The whitespace is invisible in most text editors.",
    schema: {
      file_path: z.string().describe("Path to a text cover file"),
      data: z.string().describe("Secret data string to embed"),
      output_path: z.string().describe("Path for the output file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const data = args.data as string;
        const outputPath = args.output_path as string;

        const buf = await readFileInput(filePath);
        const content = buf.toString("utf-8");
        const lines = content.split("\n");

        const bits = stringToBinaryBits(data);

        if (bits.length > lines.length) {
          return text(
            `Error: Not enough lines in cover file. Need ${bits.length} lines but file has ${lines.length}. Each line encodes 1 bit.`,
          );
        }

        // Strip existing trailing whitespace, then append encoding
        const outputLines: string[] = [];
        for (let i = 0; i < lines.length; i++) {
          const stripped = lines[i].replace(/[ \t]+$/, "");
          if (i < bits.length) {
            // space = 0, tab = 1
            outputLines.push(stripped + (bits[i] === 0 ? " " : "\t"));
          } else {
            outputLines.push(stripped);
          }
        }

        const outputContent = outputLines.join("\n");
        await writeFile(outputPath, outputContent, "utf-8");

        return json({
          success: true,
          coverFile: filePath,
          outputFile: outputPath,
          method: "Trailing whitespace encoding (space=0, tab=1)",
          secretDataLength: data.length,
          bitsEncoded: bits.length,
          linesUsed: bits.length,
          totalLines: lines.length,
          capacityUsed: Number(((bits.length / lines.length) * 100).toFixed(2)),
          note: "To decode: read trailing whitespace on each line (space=0, tab=1), reconstruct bytes from 8-bit groups.",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. create_null_cipher
  {
    name: "create_null_cipher",
    description:
      "Create null cipher text that hides a secret message using letter selection. In 'first_letter' mode, the first letter of each word spells out the secret. In 'nth_word' mode, every Nth word's first letter spells the secret. Returns the generated cipher text.",
    schema: {
      cover_text: z
        .string()
        .describe(
          "Cover text to use as source material. Must have enough words for the chosen method.",
        ),
      secret_message: z
        .string()
        .describe("Secret message to embed (letters only, case-insensitive)"),
      method: z
        .enum(["first_letter", "nth_word"])
        .describe(
          "Embedding method: 'first_letter' uses the first letter of each word, 'nth_word' uses every Nth word",
        ),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const coverText = args.cover_text as string;
        const secret = (args.secret_message as string)
          .toLowerCase()
          .replace(/[^a-z]/g, "");
        const method = args.method as "first_letter" | "nth_word";

        if (secret.length === 0) {
          return text("Error: Secret message must contain at least one letter");
        }

        const words = coverText.split(/\s+/).filter((w) => w.length > 0);

        if (method === "first_letter") {
          // The first letter of each output word must match the secret.
          // Select words from cover text that start with the required letter.
          const resultWords: string[] = [];
          let secretIdx = 0;
          let coverIdx = 0;

          while (secretIdx < secret.length && coverIdx < words.length) {
            const needed = secret[secretIdx];
            if (words[coverIdx].toLowerCase().startsWith(needed)) {
              resultWords.push(words[coverIdx]);
              secretIdx++;
            }
            coverIdx++;
          }

          if (secretIdx < secret.length) {
            return text(
              `Error: Could not find enough words starting with required letters. Encoded ${secretIdx}/${secret.length} characters. Missing letter: '${secret[secretIdx]}'. Provide cover text with more word variety.`,
            );
          }

          const output = resultWords.join(" ");
          const decoded = resultWords.map((w) => w[0].toLowerCase()).join("");

          return json({
            success: true,
            method: "first_letter",
            secretMessage: secret,
            cipherText: output,
            wordCount: resultWords.length,
            verification: decoded,
            decodingInstruction:
              "Read the first letter of each word to reveal the secret message.",
          });
        } else {
          // nth_word: every Nth word's first letter spells the secret
          // We need to select N and arrange words so that position 0, N, 2N... spell secret
          const n = Math.max(2, Math.floor(words.length / secret.length));

          if (words.length < secret.length * n) {
            return text(
              `Error: Cover text too short. Need at least ${secret.length * n} words for N=${n}, but only ${words.length} available.`,
            );
          }

          // Build output: place words from cover, ensuring every Nth word starts with the right letter
          const outputWords: string[] = [...words.slice(0, secret.length * n)];
          let allPlaced = true;

          for (let i = 0; i < secret.length; i++) {
            const targetPos = i * n;
            const needed = secret[i];

            if (outputWords[targetPos].toLowerCase().startsWith(needed)) {
              continue; // already correct
            }

            // Find a word in the pool that starts with the needed letter and swap
            let found = false;
            for (let j = 0; j < words.length; j++) {
              if (words[j].toLowerCase().startsWith(needed)) {
                // Avoid swapping from a position that's also a key position
                const isKeyPos = (targetPos: number) => {
                  for (let k = 0; k < secret.length; k++) {
                    if (k * n === targetPos) return true;
                  }
                  return false;
                };
                outputWords[targetPos] = words[j];
                found = true;
                break;
              }
            }
            if (!found) {
              allPlaced = false;
              break;
            }
          }

          if (!allPlaced) {
            return text(
              "Error: Could not arrange all required letters. Provide cover text with more word variety.",
            );
          }

          const output = outputWords.join(" ");
          const decoded = Array.from(
            { length: secret.length },
            (_, i) => outputWords[i * n][0].toLowerCase(),
          ).join("");

          return json({
            success: true,
            method: "nth_word",
            n,
            secretMessage: secret,
            cipherText: output,
            wordCount: outputWords.length,
            verification: decoded,
            decodingInstruction: `Read the first letter of every ${n}th word (positions 0, ${n}, ${2 * n}, ...) to reveal the secret message.`,
          });
        }
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. create_polyglot
  {
    name: "create_polyglot",
    description:
      "Create polyglot files by prepending one file format before another. The resulting file is valid when interpreted as either format. For example, prepend a PDF before a ZIP to create a file that is both a valid PDF and a valid ZIP.",
    schema: {
      file1_path: z
        .string()
        .describe("Path to the first file (will be at the start of the output)"),
      file2_path: z
        .string()
        .describe("Path to the second file (will be appended after the first)"),
      output_path: z.string().describe("Path for the output polyglot file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const file1Path = args.file1_path as string;
        const file2Path = args.file2_path as string;
        const outputPath = args.output_path as string;

        const buf1 = await readFileInput(file1Path);
        const buf2 = await readFileInput(file2Path);

        const format1 = detectImageFormat(buf1);
        const format2 = detectImageFormat(buf2);

        const output = Buffer.concat([buf1, buf2]);
        await writeFile(outputPath, output);

        // Detect formats for reporting
        const fmt1 =
          format1 !== "unknown"
            ? format1.toUpperCase()
            : buf1.subarray(0, 4).toString("ascii").includes("%PDF")
              ? "PDF"
              : buf1[0] === 0x50 && buf1[1] === 0x4b
                ? "ZIP"
                : "unknown";
        const fmt2 =
          format2 !== "unknown"
            ? format2.toUpperCase()
            : buf2.subarray(0, 4).toString("ascii").includes("%PDF")
              ? "PDF"
              : buf2[0] === 0x50 && buf2[1] === 0x4b
                ? "ZIP"
                : "unknown";

        return json({
          success: true,
          file1: { path: file1Path, size: buf1.length, format: fmt1 },
          file2: { path: file2Path, size: buf2.length, format: fmt2 },
          output: {
            path: outputPath,
            size: output.length,
            polyglotType: `${fmt1}+${fmt2}`,
          },
          method: "Simple concatenation (file1 prepended before file2)",
          note: `The output file starts with ${fmt1} data and has ${fmt2} data appended. Parsers for ${fmt1} will read the first part; parsers for ${fmt2} may also recognize their content.`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. create_comment
  {
    name: "create_comment",
    description:
      "Inject data into format-specific comment fields. Supports PNG tEXt chunks, JPEG COM markers, and GIF comment extensions. The comment is stored in a standards-compliant way that most viewers ignore but metadata tools can read.",
    schema: {
      file_path: z.string().describe("Path to the cover image file (PNG, JPEG, or GIF)"),
      comment: z.string().describe("Comment data to inject"),
      output_path: z.string().describe("Path for the output file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const comment = args.comment as string;
        const outputPath = args.output_path as string;

        const buf = await readFileInput(filePath);
        const format = detectImageFormat(buf);

        let output: Buffer;
        let method: string;

        if (format === "png") {
          const insertPoint = findPngTextInsertionPoint(buf);
          if (insertPoint < 0) {
            return text("Error: Could not find IEND chunk in PNG file");
          }
          const textChunk = buildPngTextChunk("Comment", comment);
          output = Buffer.concat([
            buf.subarray(0, insertPoint),
            textChunk,
            buf.subarray(insertPoint),
          ]);
          method = "PNG tEXt chunk (keyword: Comment)";
        } else if (format === "jpeg") {
          const comSeg = buildJpegComSegment(comment);
          // Insert after SOI marker (first 2 bytes: FF D8)
          output = Buffer.concat([
            buf.subarray(0, 2),
            comSeg,
            buf.subarray(2),
          ]);
          method = "JPEG COM marker (0xFFFE)";
        } else if (format === "gif") {
          const trailerPos = findGifTrailer(buf);
          if (trailerPos < 0) {
            return text("Error: Could not find GIF trailer (0x3B)");
          }
          const commentExt = buildGifCommentExtension(comment);
          output = Buffer.concat([
            buf.subarray(0, trailerPos),
            commentExt,
            buf.subarray(trailerPos),
          ]);
          method = "GIF Comment Extension (0x21 0xFE)";
        } else {
          return text(
            `Error: Unsupported format "${format}". This tool supports PNG, JPEG, and GIF files.`,
          );
        }

        await writeFile(outputPath, output);

        return json({
          success: true,
          coverFile: filePath,
          outputFile: outputPath,
          format: format.toUpperCase(),
          method,
          commentLength: comment.length,
          originalSize: buf.length,
          outputSize: output.length,
          sizeIncrease: output.length - buf.length,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. create_palette
  {
    name: "create_palette",
    description:
      "Embed data in palette color entry LSBs for indexed-color images (PNG with PLTE chunk or GIF). Each palette entry has R, G, B values — the least significant bit of each channel encodes one bit of the secret data. Capacity is 3 bits per palette entry.",
    schema: {
      file_path: z
        .string()
        .describe("Path to an indexed-color image (PNG palette or GIF)"),
      data: z.string().describe("Secret data string to embed in palette LSBs"),
      output_path: z.string().describe("Path for the output file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const data = args.data as string;
        const outputPath = args.output_path as string;

        const buf = await readFileInput(filePath);
        const format = detectImageFormat(buf);

        const bits = stringToBinaryBits(data);
        let output: Buffer;
        let paletteEntries = 0;
        let bitsEmbedded = 0;
        let method: string;

        if (format === "png") {
          // Find PLTE chunk
          let plteOffset = -1;
          let plteLength = 0;
          let pos = 8; // skip PNG signature

          while (pos + 12 <= buf.length) {
            const chunkLen = buf.readUInt32BE(pos);
            const chunkType = buf.subarray(pos + 4, pos + 8).toString("ascii");
            if (chunkType === "PLTE") {
              plteOffset = pos + 8; // start of palette data
              plteLength = chunkLen;
              break;
            }
            pos += 12 + chunkLen;
            if (chunkType === "IEND") break;
          }

          if (plteOffset < 0) {
            return text(
              "Error: No PLTE chunk found. This PNG is not an indexed-color image.",
            );
          }

          paletteEntries = Math.floor(plteLength / 3);
          const capacity = paletteEntries * 3; // 3 bits per entry (R, G, B LSBs)

          if (bits.length > capacity) {
            return text(
              `Error: Not enough palette capacity. Need ${bits.length} bits but palette has ${capacity} bits (${paletteEntries} entries x 3 channels).`,
            );
          }

          // Clone buffer and modify palette LSBs
          output = Buffer.from(buf);
          let bitIdx = 0;

          for (let i = 0; i < paletteEntries && bitIdx < bits.length; i++) {
            for (let ch = 0; ch < 3 && bitIdx < bits.length; ch++) {
              const byteOffset = plteOffset + i * 3 + ch;
              output[byteOffset] = (output[byteOffset] & 0xfe) | bits[bitIdx];
              bitIdx++;
            }
          }
          bitsEmbedded = bitIdx;

          // Recalculate PLTE CRC
          const plteChunkStart = plteOffset - 8; // back to length field
          const crcData = output.subarray(plteChunkStart + 4, plteChunkStart + 8 + plteLength);
          const newCrc = crc32Png(crcData);
          output.writeUInt32BE(newCrc >>> 0, plteChunkStart + 8 + plteLength);

          method = "PNG PLTE chunk LSB embedding";
        } else if (format === "gif") {
          // GIF: Global Color Table follows the Logical Screen Descriptor
          if (buf.length < 13) {
            return text("Error: File too small to be a valid GIF");
          }

          const packed = buf[10];
          const hasGct = !!(packed & 0x80);

          if (!hasGct) {
            return text(
              "Error: GIF has no Global Color Table. Cannot embed in palette.",
            );
          }

          const gctSizeBits = packed & 0x07;
          paletteEntries = 1 << (gctSizeBits + 1);
          const gctOffset = 13; // GCT starts right after LSD
          const gctByteLength = paletteEntries * 3;
          const capacity = paletteEntries * 3;

          if (gctOffset + gctByteLength > buf.length) {
            return text("Error: GIF Global Color Table extends beyond file");
          }

          if (bits.length > capacity) {
            return text(
              `Error: Not enough palette capacity. Need ${bits.length} bits but GCT has ${capacity} bits (${paletteEntries} entries x 3 channels).`,
            );
          }

          output = Buffer.from(buf);
          let bitIdx = 0;

          for (let i = 0; i < paletteEntries && bitIdx < bits.length; i++) {
            for (let ch = 0; ch < 3 && bitIdx < bits.length; ch++) {
              const byteOffset = gctOffset + i * 3 + ch;
              output[byteOffset] = (output[byteOffset] & 0xfe) | bits[bitIdx];
              bitIdx++;
            }
          }
          bitsEmbedded = bitIdx;
          method = "GIF Global Color Table LSB embedding";
        } else {
          return text(
            `Error: Unsupported format "${format}". This tool supports PNG (indexed) and GIF files.`,
          );
        }

        await writeFile(outputPath, output);

        return json({
          success: true,
          coverFile: filePath,
          outputFile: outputPath,
          format: format.toUpperCase(),
          method,
          paletteEntries,
          secretDataLength: data.length,
          bitsEmbedded,
          totalCapacityBits: paletteEntries * 3,
          capacityUsed: Number(
            ((bitsEmbedded / (paletteEntries * 3)) * 100).toFixed(2),
          ),
          originalSize: buf.length,
          outputSize: output.length,
          note: "Palette LSBs modified. Visual impact is minimal since each color changes by at most 1 value per channel.",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
