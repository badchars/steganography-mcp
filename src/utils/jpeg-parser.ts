import * as jpeg from "jpeg-js";
import { readFileInput } from "./binary.js";

// ─── JPEG Marker Types ───

export interface JpegMarker {
  marker: number;
  name: string;
  offset: number;
  length: number;
  data: Buffer;
}

export interface JpegPixelData {
  width: number;
  height: number;
  data: Buffer; // RGBA interleaved
  markers: JpegMarker[];
  rawBuffer: Buffer;
}

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  imageWidth?: number;
  imageHeight?: number;
  orientation?: number;
  xResolution?: number;
  yResolution?: number;
  copyright?: string;
  artist?: string;
  description?: string;
  userComment?: string;
  thumbnailOffset?: number;
  thumbnailLength?: number;
  allTags: Record<string, unknown>;
}

export interface QuantizationTable {
  id: number;
  precision: number; // 0 = 8-bit, 1 = 16-bit
  values: number[];
  estimatedQuality: number;
}

// ─── Marker Name Lookup ───

const MARKER_NAMES: Record<number, string> = {
  0xffd8: "SOI",
  0xffe0: "APP0 (JFIF)",
  0xffe1: "APP1 (EXIF/XMP)",
  0xffe2: "APP2 (ICC Profile)",
  0xffe3: "APP3",
  0xffe4: "APP4",
  0xffe5: "APP5",
  0xffe6: "APP6",
  0xffe7: "APP7",
  0xffe8: "APP8",
  0xffe9: "APP9",
  0xffea: "APP10",
  0xffeb: "APP11",
  0xffec: "APP12 (Ducky)",
  0xffed: "APP13 (Photoshop/IPTC)",
  0xffee: "APP14 (Adobe)",
  0xffef: "APP15",
  0xffdb: "DQT (Quantization Table)",
  0xffc0: "SOF0 (Baseline DCT)",
  0xffc1: "SOF1 (Extended Sequential)",
  0xffc2: "SOF2 (Progressive DCT)",
  0xffc3: "SOF3 (Lossless)",
  0xffc4: "DHT (Huffman Table)",
  0xffda: "SOS (Start of Scan)",
  0xffdd: "DRI (Restart Interval)",
  0xfffe: "COM (Comment)",
  0xffd9: "EOI",
  0xffd0: "RST0",
  0xffd1: "RST1",
  0xffd2: "RST2",
  0xffd3: "RST3",
  0xffd4: "RST4",
  0xffd5: "RST5",
  0xffd6: "RST6",
  0xffd7: "RST7",
};

// ─── Marker Parsing ───

/** Parse all JPEG markers from raw buffer */
export function parseJpegMarkers(buffer: Buffer): JpegMarker[] {
  const markers: JpegMarker[] = [];
  let offset = 0;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const markerByte = buffer[offset + 1];
    if (markerByte === 0x00 || markerByte === 0xff) {
      offset++;
      continue;
    }

    const marker = (0xff << 8) | markerByte;
    const name = MARKER_NAMES[marker] ?? `Unknown (0x${marker.toString(16).toUpperCase()})`;

    // SOI and EOI have no length field
    if (marker === 0xffd8 || marker === 0xffd9) {
      markers.push({ marker, name, offset, length: 2, data: Buffer.alloc(0) });
      offset += 2;
      if (marker === 0xffd9) break;
      continue;
    }

    // RST markers have no length
    if (marker >= 0xffd0 && marker <= 0xffd7) {
      markers.push({ marker, name, offset, length: 2, data: Buffer.alloc(0) });
      offset += 2;
      continue;
    }

    // Standard marker with length
    if (offset + 3 >= buffer.length) break;
    const segLen = buffer.readUInt16BE(offset + 2);

    if (marker === 0xffda) {
      // SOS: entropy-coded data follows until next valid marker
      const headerEnd = offset + 2 + segLen;
      let scanEnd = headerEnd;
      while (scanEnd < buffer.length - 1) {
        if (buffer[scanEnd] === 0xff && buffer[scanEnd + 1] !== 0x00 && buffer[scanEnd + 1] !== 0xff) {
          break;
        }
        scanEnd++;
      }
      const data = buffer.subarray(offset + 4, scanEnd);
      markers.push({ marker, name, offset, length: scanEnd - offset, data });
      offset = scanEnd;
      continue;
    }

    const data = buffer.subarray(offset + 4, offset + 2 + segLen);
    markers.push({ marker, name, offset, length: segLen + 2, data });
    offset += 2 + segLen;
  }

  return markers;
}

// ─── Pixel Extraction ───

/** Decode JPEG to RGBA pixel buffer using jpeg-js */
export async function getJpegPixels(filePath: string): Promise<JpegPixelData> {
  const raw = await readFileInput(filePath);
  const markers = parseJpegMarkers(raw);

  const decoded = jpeg.decode(raw, {
    useTArray: true,
    formatAsRGBA: true,
    tolerantDecoding: true,
    maxMemoryUsageInMB: 256,
  });

  return {
    width: decoded.width,
    height: decoded.height,
    data: Buffer.from(decoded.data),
    markers,
    rawBuffer: raw,
  };
}

// ─── Quantization Table Extraction ───

/** Extract and analyze quantization tables from DQT markers */
export function extractQuantizationTables(markers: JpegMarker[]): QuantizationTable[] {
  const tables: QuantizationTable[] = [];

  for (const m of markers) {
    if (m.marker !== 0xffdb) continue;

    let offset = 0;
    while (offset < m.data.length) {
      const pq = (m.data[offset] >> 4) & 0x0f; // precision
      const tq = m.data[offset] & 0x0f; // table ID
      offset++;

      const values: number[] = [];
      const count = 64;

      if (pq === 0) {
        // 8-bit values
        for (let i = 0; i < count && offset < m.data.length; i++) {
          values.push(m.data[offset++]);
        }
      } else {
        // 16-bit values
        for (let i = 0; i < count && offset + 1 < m.data.length; i++) {
          values.push((m.data[offset] << 8) | m.data[offset + 1]);
          offset += 2;
        }
      }

      // Estimate JPEG quality from luminance QT
      let estimatedQuality = 0;
      if (values.length === 64) {
        const sum = values.reduce((a, b) => a + b, 0);
        // Rough quality estimation based on QT sum
        if (sum <= 256) estimatedQuality = 95;
        else if (sum <= 512) estimatedQuality = 85;
        else if (sum <= 1024) estimatedQuality = 75;
        else if (sum <= 2048) estimatedQuality = 60;
        else if (sum <= 4096) estimatedQuality = 40;
        else estimatedQuality = 20;
      }

      tables.push({ id: tq, precision: pq, values, estimatedQuality });
    }
  }

  return tables;
}

// ─── EXIF Parsing ───

/** Parse basic EXIF data from APP1 marker data */
export function parseExifData(data: Buffer): ExifData {
  const allTags: Record<string, unknown> = {};

  // Check for "Exif\0\0" header
  if (data.length < 14) return { allTags };
  const exifHeader = data.subarray(0, 6).toString("ascii");
  if (!exifHeader.startsWith("Exif")) return { allTags };

  const tiffOffset = 6;
  const tiffData = data.subarray(tiffOffset);

  // Determine byte order
  const byteOrder = tiffData.subarray(0, 2).toString("ascii");
  const isLittleEndian = byteOrder === "II";

  const read16 = (buf: Buffer, off: number): number =>
    isLittleEndian ? buf.readUInt16LE(off) : buf.readUInt16BE(off);
  const read32 = (buf: Buffer, off: number): number =>
    isLittleEndian ? buf.readUInt32LE(off) : buf.readUInt32BE(off);

  // Verify TIFF magic 42
  if (read16(tiffData, 2) !== 42) return { allTags };

  const ifd0Offset = read32(tiffData, 4);

  // EXIF tag IDs
  const TAG_NAMES: Record<number, string> = {
    0x010f: "make",
    0x0110: "model",
    0x0131: "software",
    0x0132: "dateTime",
    0x0112: "orientation",
    0x011a: "xResolution",
    0x011b: "yResolution",
    0x8298: "copyright",
    0x013b: "artist",
    0x010e: "description",
    0x9286: "userComment",
    0xa002: "imageWidth",
    0xa003: "imageHeight",
    0x0201: "thumbnailOffset",
    0x0202: "thumbnailLength",
  };

  function readIFD(offset: number): void {
    if (offset + 2 > tiffData.length) return;
    const entryCount = read16(tiffData, offset);

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = offset + 2 + i * 12;
      if (entryOffset + 12 > tiffData.length) break;

      const tag = read16(tiffData, entryOffset);
      const type = read16(tiffData, entryOffset + 2);
      const count = read32(tiffData, entryOffset + 4);
      const valueOffset = entryOffset + 8;

      const tagName = TAG_NAMES[tag] ?? `tag_0x${tag.toString(16)}`;

      // Read value based on type
      let value: unknown;
      if (type === 2) {
        // ASCII string
        const strLength = count;
        let strOffset: number;
        if (strLength > 4) {
          strOffset = read32(tiffData, valueOffset);
        } else {
          strOffset = valueOffset;
        }
        if (strOffset + strLength <= tiffData.length) {
          value = tiffData
            .subarray(strOffset, strOffset + strLength)
            .toString("ascii")
            .replace(/\0+$/, "");
        }
      } else if (type === 3) {
        // SHORT
        value = read16(tiffData, count > 2 ? read32(tiffData, valueOffset) : valueOffset);
      } else if (type === 4) {
        // LONG
        value = read32(tiffData, count > 1 ? read32(tiffData, valueOffset) : valueOffset);
      }

      if (value !== undefined) {
        allTags[tagName] = value;
      }
    }
  }

  readIFD(ifd0Offset);

  return {
    make: allTags["make"] as string | undefined,
    model: allTags["model"] as string | undefined,
    software: allTags["software"] as string | undefined,
    dateTime: allTags["dateTime"] as string | undefined,
    orientation: allTags["orientation"] as number | undefined,
    xResolution: allTags["xResolution"] as number | undefined,
    yResolution: allTags["yResolution"] as number | undefined,
    copyright: allTags["copyright"] as string | undefined,
    artist: allTags["artist"] as string | undefined,
    description: allTags["description"] as string | undefined,
    userComment: allTags["userComment"] as string | undefined,
    imageWidth: allTags["imageWidth"] as number | undefined,
    imageHeight: allTags["imageHeight"] as number | undefined,
    thumbnailOffset: allTags["thumbnailOffset"] as number | undefined,
    thumbnailLength: allTags["thumbnailLength"] as number | undefined,
    allTags,
  };
}

// ─── Comment Extraction ───

/** Extract all COM (comment) markers */
export function extractComments(markers: JpegMarker[]): string[] {
  return markers
    .filter((m) => m.marker === 0xfffe)
    .map((m) => m.data.toString("utf-8").replace(/\0+$/, ""));
}

// ─── Appended Data Detection ───

/** Find data appended after EOI marker */
export function findJpegAppendedData(buffer: Buffer): Buffer | null {
  // Search backwards for last EOI (FF D9)
  for (let i = buffer.length - 2; i >= 0; i--) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd9) {
      if (i + 2 < buffer.length) {
        return buffer.subarray(i + 2);
      }
      return null;
    }
  }
  return null;
}

// ─── DCT Coefficient Distribution Analysis ───

/**
 * Approximate DCT coefficient analysis from entropy-coded data.
 * For full accuracy, a complete Huffman decoder would be needed.
 * This provides a statistical approximation by analyzing the SOS segment byte distribution.
 */
export function analyzeSosEntropy(markers: JpegMarker[]): {
  sosSize: number;
  entropy: number;
  zeroBytePercentage: number;
  ffBytePercentage: number;
  anomalies: string[];
} {
  const sos = markers.find((m) => m.marker === 0xffda);
  if (!sos) {
    return { sosSize: 0, entropy: 0, zeroBytePercentage: 0, ffBytePercentage: 0, anomalies: ["No SOS marker found"] };
  }

  const { shannonEntropy } = require("./stats.js") as typeof import("./stats.js");
  const data = sos.data;
  const entropy = shannonEntropy(data);

  let zeros = 0;
  let ffs = 0;
  for (const b of data) {
    if (b === 0x00) zeros++;
    if (b === 0xff) ffs++;
  }

  const anomalies: string[] = [];
  const zeroBytePercentage = (zeros / data.length) * 100;
  const ffBytePercentage = (ffs / data.length) * 100;

  if (entropy < 6.5) anomalies.push("Low entropy in scan data (possible stego or unusual compression)");
  if (zeroBytePercentage > 15) anomalies.push("High zero-byte concentration in scan data");
  if (ffBytePercentage > 10) anomalies.push("High 0xFF byte concentration (possible stuffing anomaly)");

  return { sosSize: data.length, entropy, zeroBytePercentage, ffBytePercentage, anomalies };
}
