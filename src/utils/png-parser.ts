import { PNG } from "pngjs";
import { readFileInput } from "./binary.js";

// ─── PNG Chunk Types ───

export interface PngChunk {
  type: string;
  offset: number;
  length: number;
  data: Buffer;
  crc: number;
}

export interface PngPixelData {
  width: number;
  height: number;
  data: Buffer; // RGBA interleaved
  bitDepth: number;
  colorType: number;
  chunks: PngChunk[];
  rawBuffer: Buffer;
}

export interface PngTextEntry {
  chunkType: string;
  keyword: string;
  text: string;
  compressed: boolean;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// ─── Chunk Parsing ───

/** Parse all PNG chunks from raw buffer */
export function parsePngChunks(buffer: Buffer): PngChunk[] {
  if (buffer.length < 8 || buffer.subarray(0, 8).compare(PNG_SIGNATURE) !== 0) {
    throw new Error("Not a valid PNG file");
  }

  const chunks: PngChunk[] = [];
  let offset = 8;

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");

    if (offset + 12 + length > buffer.length) break;

    const data = buffer.subarray(offset + 8, offset + 8 + length);
    const crc = buffer.readUInt32BE(offset + 8 + length);

    chunks.push({ type, offset, length, data, crc });
    offset += 12 + length;

    if (type === "IEND") break;
  }

  return chunks;
}

// ─── Pixel Extraction ───

/** Decode PNG to RGBA pixel buffer using pngjs */
export async function getPngPixels(filePath: string): Promise<PngPixelData> {
  const raw = await readFileInput(filePath);
  const chunks = parsePngChunks(raw);
  const png = PNG.sync.read(raw);

  // Extract IHDR info
  const ihdr = chunks.find((c) => c.type === "IHDR");
  let bitDepth = 8;
  let colorType = 6;
  if (ihdr && ihdr.data.length >= 10) {
    bitDepth = ihdr.data[8];
    colorType = ihdr.data[9];
  }

  return {
    width: png.width,
    height: png.height,
    data: png.data,
    bitDepth,
    colorType,
    chunks,
    rawBuffer: raw,
  };
}

// ─── Text Chunk Extraction ───

/** Extract text from tEXt, zTXt, and iTXt chunks */
export function extractTextChunks(chunks: PngChunk[]): PngTextEntry[] {
  const { inflateSync } = require("node:zlib") as typeof import("node:zlib");
  const entries: PngTextEntry[] = [];

  for (const chunk of chunks) {
    if (chunk.type === "tEXt") {
      const nullIdx = chunk.data.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = chunk.data.subarray(0, nullIdx).toString("latin1");
        const text = chunk.data.subarray(nullIdx + 1).toString("latin1");
        entries.push({ chunkType: "tEXt", keyword, text, compressed: false });
      }
    } else if (chunk.type === "zTXt") {
      const nullIdx = chunk.data.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = chunk.data.subarray(0, nullIdx).toString("latin1");
        const compressionMethod = chunk.data[nullIdx + 1];
        if (compressionMethod === 0) {
          try {
            const decompressed = inflateSync(chunk.data.subarray(nullIdx + 2));
            entries.push({
              chunkType: "zTXt",
              keyword,
              text: decompressed.toString("latin1"),
              compressed: true,
            });
          } catch {
            entries.push({
              chunkType: "zTXt",
              keyword,
              text: "[decompression failed]",
              compressed: true,
            });
          }
        }
      }
    } else if (chunk.type === "iTXt") {
      const nullIdx = chunk.data.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = chunk.data.subarray(0, nullIdx).toString("utf-8");
        const compressionFlag = chunk.data[nullIdx + 1];
        const compressionMethod = chunk.data[nullIdx + 2];
        // Find language tag and translated keyword
        let offset = nullIdx + 3;
        const langEnd = chunk.data.indexOf(0, offset);
        offset = langEnd + 1;
        const transEnd = chunk.data.indexOf(0, offset);
        offset = transEnd + 1;

        let text: string;
        if (compressionFlag === 1 && compressionMethod === 0) {
          try {
            const decompressed = inflateSync(chunk.data.subarray(offset));
            text = decompressed.toString("utf-8");
          } catch {
            text = "[decompression failed]";
          }
        } else {
          text = chunk.data.subarray(offset).toString("utf-8");
        }
        entries.push({ chunkType: "iTXt", keyword, text, compressed: compressionFlag === 1 });
      }
    }
  }

  return entries;
}

// ─── Appended Data Detection ───

/** Find data appended after the IEND chunk */
export function findPngAppendedData(buffer: Buffer): Buffer | null {
  const chunks = parsePngChunks(buffer);
  const iend = chunks.find((c) => c.type === "IEND");
  if (!iend) return null;

  const endOffset = iend.offset + 12; // 4(length) + 4(type) + 0(IEND data) + 4(CRC)
  if (endOffset < buffer.length) {
    return buffer.subarray(endOffset);
  }
  return null;
}

// ─── Color Type Names ───

export function colorTypeName(colorType: number): string {
  switch (colorType) {
    case 0: return "Grayscale";
    case 2: return "RGB";
    case 3: return "Indexed (Palette)";
    case 4: return "Grayscale + Alpha";
    case 6: return "RGBA";
    default: return `Unknown (${colorType})`;
  }
}
