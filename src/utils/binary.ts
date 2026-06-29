import { readFile } from "node:fs/promises";

// ─── File Reading ───

export async function readFileInput(
  filePath: string,
  maxSize: number = 50 * 1024 * 1024,
): Promise<Buffer> {
  const buf = await readFile(filePath);
  if (buf.length > maxSize) {
    throw new Error(
      `File too large: ${buf.length} bytes (max ${maxSize})`,
    );
  }
  return buf;
}

// ─── Bit Extraction ───

/** Extract N bits starting from a bit offset within a Buffer (MSB first within each byte) */
export function extractBits(
  buffer: Buffer,
  bitOffset: number,
  bitCount: number,
): number[] {
  const bits: number[] = [];
  for (let i = 0; i < bitCount; i++) {
    const byteIdx = Math.floor((bitOffset + i) / 8);
    const bitIdx = 7 - ((bitOffset + i) % 8);
    if (byteIdx >= buffer.length) break;
    bits.push((buffer[byteIdx] >> bitIdx) & 1);
  }
  return bits;
}

/** Get a specific bit plane (0=LSB, 7=MSB) from RGBA pixel data for a given channel */
export function getBitPlane(
  pixels: Buffer,
  width: number,
  height: number,
  plane: number,
  channel: number,
): Uint8Array {
  const result = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4 + channel;
    if (idx < pixels.length) {
      result[i] = (pixels[idx] >> plane) & 1;
    }
  }
  return result;
}

/** Extract LSB values from RGBA pixels for specified channels */
export function extractLsbValues(
  pixels: Buffer,
  width: number,
  height: number,
  channels: number[] = [0, 1, 2],
  bitPlane: number = 0,
  order: "row" | "column" = "row",
  maxBits: number = 65536,
): number[] {
  const bits: number[] = [];
  const totalPixels = width * height;

  for (let p = 0; p < totalPixels && bits.length < maxBits; p++) {
    let x: number, y: number;
    if (order === "row") {
      x = p % width;
      y = Math.floor(p / width);
    } else {
      x = Math.floor(p / height);
      y = p % height;
    }
    const pixelIdx = (y * width + x) * 4;

    for (const ch of channels) {
      if (bits.length >= maxBits) break;
      if (pixelIdx + ch < pixels.length) {
        bits.push((pixels[pixelIdx + ch] >> bitPlane) & 1);
      }
    }
  }

  return bits;
}

// ─── Bit/Byte Conversion ───

/** Convert an array of bits (0/1) to a Buffer of bytes */
export function bitsToBytes(bits: number[]): Buffer {
  const bytes = Buffer.alloc(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) {
      bytes[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
    }
  }
  return bytes;
}

/** Convert a Buffer to a binary string (e.g., "01001000 01101001") */
export function bytesToBinary(buf: Buffer, separator: string = " "): string {
  return Array.from(buf)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(separator);
}

/** Set the LSB of a byte to a given bit value (0 or 1) */
export function setLsb(byte: number, bit: number): number {
  return (byte & 0xfe) | (bit & 1);
}

/** Convert a string to bits for embedding */
export function stringToBits(str: string): number[] {
  const buf = Buffer.from(str, "utf-8");
  const bits: number[] = [];
  for (const byte of buf) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

/** Convert bits back to a string (attempt UTF-8 decode) */
export function bitsToString(bits: number[]): string {
  const bytes = bitsToBytes(bits);
  return bytes.toString("utf-8");
}

// ─── Format Detection ───

/** Detect image format from magic bytes */
export function detectImageFormat(
  buf: Buffer,
): "png" | "jpeg" | "bmp" | "gif" | "webp" | "unknown" {
  if (buf.length < 4) return "unknown";
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  // BMP: 42 4D
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "bmp";
  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "gif";
  // WebP: RIFF....WEBP
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return "unknown";
}

/** Detect audio format from magic bytes */
export function detectAudioFormat(
  buf: Buffer,
): "wav" | "mp3" | "flac" | "ogg" | "unknown" {
  if (buf.length < 4) return "unknown";
  // WAV: RIFF....WAVE
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WAVE") return "wav";
  // MP3: FF FB / FF F3 / FF F2 / ID3
  if ((buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) || (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33)) return "mp3";
  // FLAC: fLaC
  if (buf[0] === 0x66 && buf[1] === 0x4c && buf[2] === 0x61 && buf[3] === 0x43) return "flac";
  // OGG: OggS
  if (buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return "ogg";
  return "unknown";
}

// ─── Hex Dump ───

/** Generate a hex dump string for a buffer region */
export function hexDump(
  buf: Buffer,
  offset: number = 0,
  length: number = 256,
  bytesPerLine: number = 16,
): string {
  const lines: string[] = [];
  const end = Math.min(offset + length, buf.length);

  for (let i = offset; i < end; i += bytesPerLine) {
    const addr = i.toString(16).padStart(8, "0");
    const hexParts: string[] = [];
    let ascii = "";

    for (let j = 0; j < bytesPerLine; j++) {
      const idx = i + j;
      if (idx < end) {
        hexParts.push(buf[idx].toString(16).padStart(2, "0"));
        ascii += buf[idx] >= 0x20 && buf[idx] <= 0x7e ? String.fromCharCode(buf[idx]) : ".";
      } else {
        hexParts.push("  ");
        ascii += " ";
      }
    }

    const hex = hexParts.join(" ");
    lines.push(`${addr}  ${hex}  |${ascii}|`);
  }

  return lines.join("\n");
}
