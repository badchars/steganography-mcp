import { readFileInput } from "./binary.js";

// ─── BMP Types ───

export interface BmpData {
  width: number;
  height: number;
  bitDepth: number;
  compression: number;
  compressionName: string;
  data: Buffer; // RGBA interleaved
  rawBuffer: Buffer;
  fileSize: number;
  dataOffset: number;
  headerSize: number;
  imageSize: number;
  colorsUsed: number;
  palette: Array<{ r: number; g: number; b: number }>;
}

const COMPRESSION_NAMES: Record<number, string> = {
  0: "BI_RGB (None)",
  1: "BI_RLE8",
  2: "BI_RLE4",
  3: "BI_BITFIELDS",
  4: "BI_JPEG",
  5: "BI_PNG",
};

// ─── BMP Parsing ───

/** Parse a BMP file into structured data with RGBA pixels */
export async function parseBmp(filePath: string): Promise<BmpData> {
  const buf = await readFileInput(filePath);

  // Validate signature
  if (buf.length < 54) throw new Error("File too small to be a valid BMP");
  if (buf[0] !== 0x42 || buf[1] !== 0x4d) throw new Error("Not a BMP file (missing BM signature)");

  // File header (14 bytes)
  const fileSize = buf.readUInt32LE(2);
  const dataOffset = buf.readUInt32LE(10);

  // DIB header
  const headerSize = buf.readUInt32LE(14);
  const width = buf.readInt32LE(18);
  const rawHeight = buf.readInt32LE(22);
  const height = Math.abs(rawHeight);
  const topDown = rawHeight < 0;
  const planes = buf.readUInt16LE(26);
  const bitDepth = buf.readUInt16LE(28);
  const compression = buf.readUInt32LE(30);
  const imageSize = buf.readUInt32LE(34);
  const colorsUsed = headerSize >= 40 ? buf.readUInt32LE(46) : 0;
  const compressionName = COMPRESSION_NAMES[compression] ?? `Unknown (${compression})`;

  // Parse color palette (for 1, 4, 8-bit images)
  const palette: Array<{ r: number; g: number; b: number }> = [];
  if (bitDepth <= 8) {
    const paletteOffset = 14 + headerSize;
    const paletteCount = colorsUsed > 0 ? colorsUsed : 1 << bitDepth;
    for (let i = 0; i < paletteCount; i++) {
      const off = paletteOffset + i * 4;
      if (off + 3 <= buf.length) {
        palette.push({
          b: buf[off],
          g: buf[off + 1],
          r: buf[off + 2],
        });
      }
    }
  }

  // Convert to RGBA pixel buffer
  const pixels = Buffer.alloc(width * height * 4);
  const rowSize = Math.ceil((bitDepth * width) / 32) * 4; // Rows padded to 4-byte boundary

  for (let y = 0; y < height; y++) {
    const srcY = topDown ? y : height - 1 - y;
    const rowOffset = dataOffset + srcY * rowSize;

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;

      if (bitDepth === 32) {
        const srcIdx = rowOffset + x * 4;
        if (srcIdx + 3 < buf.length) {
          pixels[dstIdx] = buf[srcIdx + 2]; // R
          pixels[dstIdx + 1] = buf[srcIdx + 1]; // G
          pixels[dstIdx + 2] = buf[srcIdx]; // B
          pixels[dstIdx + 3] = buf[srcIdx + 3]; // A
        }
      } else if (bitDepth === 24) {
        const srcIdx = rowOffset + x * 3;
        if (srcIdx + 2 < buf.length) {
          pixels[dstIdx] = buf[srcIdx + 2]; // R
          pixels[dstIdx + 1] = buf[srcIdx + 1]; // G
          pixels[dstIdx + 2] = buf[srcIdx]; // B
          pixels[dstIdx + 3] = 255; // A
        }
      } else if (bitDepth === 16) {
        const srcIdx = rowOffset + x * 2;
        if (srcIdx + 1 < buf.length) {
          const val = buf.readUInt16LE(srcIdx);
          // 5-5-5 format (most common for 16-bit BMP)
          pixels[dstIdx] = ((val >> 10) & 0x1f) * 8; // R
          pixels[dstIdx + 1] = ((val >> 5) & 0x1f) * 8; // G
          pixels[dstIdx + 2] = (val & 0x1f) * 8; // B
          pixels[dstIdx + 3] = 255; // A
        }
      } else if (bitDepth === 8) {
        const srcIdx = rowOffset + x;
        if (srcIdx < buf.length) {
          const paletteIdx = buf[srcIdx];
          if (paletteIdx < palette.length) {
            pixels[dstIdx] = palette[paletteIdx].r;
            pixels[dstIdx + 1] = palette[paletteIdx].g;
            pixels[dstIdx + 2] = palette[paletteIdx].b;
            pixels[dstIdx + 3] = 255;
          }
        }
      } else if (bitDepth === 4) {
        const srcIdx = rowOffset + Math.floor(x / 2);
        if (srcIdx < buf.length) {
          const paletteIdx = x % 2 === 0 ? (buf[srcIdx] >> 4) & 0x0f : buf[srcIdx] & 0x0f;
          if (paletteIdx < palette.length) {
            pixels[dstIdx] = palette[paletteIdx].r;
            pixels[dstIdx + 1] = palette[paletteIdx].g;
            pixels[dstIdx + 2] = palette[paletteIdx].b;
            pixels[dstIdx + 3] = 255;
          }
        }
      } else if (bitDepth === 1) {
        const srcIdx = rowOffset + Math.floor(x / 8);
        if (srcIdx < buf.length) {
          const bit = (buf[srcIdx] >> (7 - (x % 8))) & 1;
          if (bit < palette.length) {
            pixels[dstIdx] = palette[bit].r;
            pixels[dstIdx + 1] = palette[bit].g;
            pixels[dstIdx + 2] = palette[bit].b;
            pixels[dstIdx + 3] = 255;
          }
        }
      }
    }
  }

  return {
    width,
    height,
    bitDepth,
    compression,
    compressionName,
    data: pixels,
    rawBuffer: buf,
    fileSize,
    dataOffset,
    headerSize,
    imageSize,
    colorsUsed,
    palette,
  };
}

/** Detect data appended after BMP pixel data */
export function findBmpAppendedData(buffer: Buffer): Buffer | null {
  if (buffer.length < 14) return null;
  const fileSize = buffer.readUInt32LE(2);
  if (fileSize < buffer.length) {
    return buffer.subarray(fileSize);
  }
  return null;
}
