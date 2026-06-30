// ─── GIF89a Parser for Steganography Analysis ───

export interface GifHeader {
  version: string;
  width: number;
  height: number;
  hasGlobalColorTable: boolean;
  colorResolution: number;
  sorted: boolean;
  globalColorTableSize: number;
  backgroundColorIndex: number;
  pixelAspectRatio: number;
}

export interface ColorEntry { r: number; g: number; b: number }

export interface GifExtension {
  type: "graphics_control" | "comment" | "application" | "plain_text" | "unknown";
  label: number;
  data: Buffer;
  disposalMethod?: number;
  transparentFlag?: boolean;
  transparentColorIndex?: number;
  delayTime?: number;
  appIdentifier?: string;
  appAuthCode?: string;
}

export interface GifImageDescriptor {
  left: number;
  top: number;
  width: number;
  height: number;
  hasLocalColorTable: boolean;
  interlaced: boolean;
  sorted: boolean;
  localColorTableSize: number;
  localColorTable: ColorEntry[];
  lzwMinCodeSize: number;
  compressedData: Buffer;
  subBlockSizes: number[];
}

export interface GifParseResult {
  header: GifHeader;
  globalColorTable: ColorEntry[];
  extensions: GifExtension[];
  images: GifImageDescriptor[];
  comments: string[];
  appExtensions: GifExtension[];
  isAnimated: boolean;
  frameCount: number;
  fileSize: number;
  trailingData: Buffer | null;
}

// ─── Sub-block Reader ───

/** Read GIF sub-blocks (1-byte size + data, terminated by 0x00) */
export function extractSubBlocks(buf: Buffer, offset: number): { data: Buffer; sizes: number[]; bytesRead: number } {
  const chunks: Buffer[] = [];
  const sizes: number[] = [];
  let pos = offset;
  while (pos < buf.length) {
    const sz = buf[pos++];
    if (sz === 0) break;
    if (pos + sz > buf.length) {
      chunks.push(buf.subarray(pos));
      sizes.push(buf.length - pos);
      pos = buf.length;
      break;
    }
    chunks.push(buf.subarray(pos, pos + sz));
    sizes.push(sz);
    pos += sz;
  }
  return { data: Buffer.concat(chunks), sizes, bytesRead: pos - offset };
}

/** Skip sub-blocks without collecting data (used by findGifAppendedData) */
function skipSubBlocks(buf: Buffer, pos: number): number {
  while (pos < buf.length) {
    const sz = buf[pos++];
    if (sz === 0) break;
    pos += sz;
  }
  return pos;
}

// ─── Color Table ───

/** Parse RGB color table entries from buffer */
export function parseColorTable(buf: Buffer, offset: number, count: number): ColorEntry[] {
  const colors: ColorEntry[] = [];
  for (let i = 0; i < count; i++) {
    const b = offset + i * 3;
    if (b + 2 >= buf.length) break;
    colors.push({ r: buf[b], g: buf[b + 1], b: buf[b + 2] });
  }
  return colors;
}

/** Analyze color table for steganographic anomalies */
export function analyzeColorTable(colors: ColorEntry[]): {
  uniqueColors: number;
  duplicates: Array<{ indices: number[]; color: ColorEntry }>;
  unusedEntries: number;
  isSorted: boolean;
  lsbPattern: { r: number[]; g: number[]; b: number[] };
} {
  const colorMap = new Map<string, number[]>();
  for (let i = 0; i < colors.length; i++) {
    const key = `${colors[i].r},${colors[i].g},${colors[i].b}`;
    const arr = colorMap.get(key);
    if (arr) arr.push(i); else colorMap.set(key, [i]);
  }

  const duplicates: Array<{ indices: number[]; color: ColorEntry }> = [];
  for (const [, idx] of colorMap) {
    if (idx.length > 1) duplicates.push({ indices: idx, color: colors[idx[0]] });
  }

  // Check luminance sort order
  let asc = true, desc = true;
  for (let i = 1; i < colors.length; i++) {
    const prev = colors[i - 1].r * 0.299 + colors[i - 1].g * 0.587 + colors[i - 1].b * 0.114;
    const curr = colors[i].r * 0.299 + colors[i].g * 0.587 + colors[i].b * 0.114;
    if (curr < prev) asc = false;
    if (curr > prev) desc = false;
  }

  // Count repeated (0,0,0) entries as unused palette slots
  let unusedEntries = 0, seenBlack = false;
  for (const c of colors) {
    if (c.r === 0 && c.g === 0 && c.b === 0) {
      if (seenBlack) unusedEntries++;
      seenBlack = true;
    }
  }

  return {
    uniqueColors: colorMap.size,
    duplicates,
    unusedEntries,
    isSorted: colors.length > 1 && (asc || desc),
    lsbPattern: {
      r: colors.map((c) => c.r & 1),
      g: colors.map((c) => c.g & 1),
      b: colors.map((c) => c.b & 1),
    },
  };
}

// ─── Appended Data Detection ───

/** Lightweight block-walk to find data after the GIF trailer (0x3B) */
export function findGifAppendedData(buf: Buffer): { offset: number; size: number; data: Buffer } | null {
  if (buf.length < 13 || buf.subarray(0, 3).toString("ascii") !== "GIF") return null;

  let pos = 6; // past signature+version
  if (pos + 7 > buf.length) return null;
  const packed = buf[pos + 4];
  const gctEntries = (packed & 0x80) ? 1 << ((packed & 0x07) + 1) : 0;
  pos += 7 + gctEntries * 3;

  while (pos < buf.length) {
    const id = buf[pos];
    if (id === 0x3b) {
      pos += 1;
      return pos < buf.length ? { offset: pos, size: buf.length - pos, data: buf.subarray(pos) } : null;
    }
    if (id === 0x21) {
      if (pos + 2 > buf.length) break;
      pos = skipSubBlocks(buf, pos + 2);
    } else if (id === 0x2c) {
      if (pos + 10 > buf.length) break;
      const ip = buf[pos + 9];
      const lctEntries = (ip & 0x80) ? 1 << ((ip & 0x07) + 1) : 0;
      pos += 10 + lctEntries * 3;
      if (pos >= buf.length) break;
      pos += 1; // LZW min code size
      pos = skipSubBlocks(buf, pos);
    } else {
      break;
    }
  }
  return null;
}

// ─── Main Parser ───

/** Parse a GIF buffer into structured components for steganography analysis */
export function parseGif(buf: Buffer): GifParseResult {
  if (buf.length < 13) throw new Error("File too small to be a valid GIF");
  if (buf.subarray(0, 3).toString("ascii") !== "GIF") throw new Error("Not a GIF file (missing GIF signature)");

  const version = buf.subarray(3, 6).toString("ascii");
  if (version !== "87a" && version !== "89a") throw new Error(`Unsupported GIF version: ${version}`);

  // Logical Screen Descriptor (7 bytes at offset 6)
  const width = buf.readUInt16LE(6);
  const height = buf.readUInt16LE(8);
  const packed = buf[10];
  const hasGlobalColorTable = (packed & 0x80) !== 0;
  const colorResolution = (packed >> 4) & 0x07;
  const sorted = (packed & 0x08) !== 0;
  const gctField = packed & 0x07;
  const globalColorTableSize = hasGlobalColorTable ? 1 << (gctField + 1) : 0;
  const backgroundColorIndex = buf[11];
  const pixelAspectRatio = buf[12];

  const header: GifHeader = {
    version, width, height, hasGlobalColorTable, colorResolution,
    sorted, globalColorTableSize, backgroundColorIndex, pixelAspectRatio,
  };

  let pos = 13;
  let globalColorTable: ColorEntry[] = [];
  if (hasGlobalColorTable) {
    globalColorTable = parseColorTable(buf, pos, globalColorTableSize);
    pos += globalColorTableSize * 3;
  }

  const extensions: GifExtension[] = [];
  const images: GifImageDescriptor[] = [];
  const comments: string[] = [];
  const appExtensions: GifExtension[] = [];
  let trailingData: Buffer | null = null;

  while (pos < buf.length) {
    const id = buf[pos];

    // Trailer
    if (id === 0x3b) {
      pos += 1;
      if (pos < buf.length) trailingData = buf.subarray(pos);
      break;
    }

    // Extension Block
    if (id === 0x21) {
      if (pos + 2 > buf.length) break;
      const label = buf[pos + 1];
      pos += 2;

      if (label === 0xf9) {
        // Graphics Control Extension
        if (pos >= buf.length) break;
        const bsz = buf[pos++];
        if (bsz >= 4 && pos + 4 <= buf.length) {
          const gp = buf[pos];
          const ext: GifExtension = {
            type: "graphics_control", label,
            data: buf.subarray(pos, pos + bsz),
            disposalMethod: (gp >> 2) & 0x07,
            transparentFlag: (gp & 0x01) !== 0,
            delayTime: buf.readUInt16LE(pos + 1),
            transparentColorIndex: buf[pos + 3],
          };
          pos += bsz;
          if (pos < buf.length && buf[pos] === 0) pos++;
          extensions.push(ext);
        } else {
          const sub = extractSubBlocks(buf, pos - 1);
          pos += sub.bytesRead - 1;
        }
      } else if (label === 0xfe) {
        // Comment Extension
        const sub = extractSubBlocks(buf, pos);
        pos += sub.bytesRead;
        comments.push(sub.data.toString("utf-8"));
        extensions.push({ type: "comment", label, data: sub.data });
      } else if (label === 0xff) {
        // Application Extension
        if (pos >= buf.length) break;
        const absz = buf[pos++];
        let appIdentifier = "", appAuthCode = "";
        if (absz >= 11 && pos + 11 <= buf.length) {
          appIdentifier = buf.subarray(pos, pos + 8).toString("ascii").replace(/\0/g, "");
          appAuthCode = buf.subarray(pos + 8, pos + 11).toString("ascii").replace(/\0/g, "");
        }
        pos += absz;
        const sub = extractSubBlocks(buf, pos);
        pos += sub.bytesRead;
        const ext: GifExtension = { type: "application", label, data: sub.data, appIdentifier, appAuthCode };
        extensions.push(ext);
        appExtensions.push(ext);
      } else if (label === 0x01) {
        // Plain Text Extension
        const sub = extractSubBlocks(buf, pos);
        pos += sub.bytesRead;
        extensions.push({ type: "plain_text", label, data: sub.data });
      } else {
        // Unknown extension
        const sub = extractSubBlocks(buf, pos);
        pos += sub.bytesRead;
        extensions.push({ type: "unknown", label, data: sub.data });
      }
      continue;
    }

    // Image Descriptor
    if (id === 0x2c) {
      if (pos + 10 > buf.length) break;
      const left = buf.readUInt16LE(pos + 1);
      const top = buf.readUInt16LE(pos + 3);
      const imgW = buf.readUInt16LE(pos + 5);
      const imgH = buf.readUInt16LE(pos + 7);
      const ip = buf[pos + 9];
      const hasLct = (ip & 0x80) !== 0;
      const lctField = ip & 0x07;
      const lctSize = hasLct ? 1 << (lctField + 1) : 0;
      pos += 10;

      let localColorTable: ColorEntry[] = [];
      if (hasLct) {
        localColorTable = parseColorTable(buf, pos, lctSize);
        pos += lctSize * 3;
      }

      if (pos >= buf.length) break;
      const lzwMinCodeSize = buf[pos++];
      const sub = extractSubBlocks(buf, pos);
      pos += sub.bytesRead;

      images.push({
        left, top, width: imgW, height: imgH,
        hasLocalColorTable: hasLct, interlaced: (ip & 0x40) !== 0,
        sorted: (ip & 0x20) !== 0, localColorTableSize: lctSize,
        localColorTable, lzwMinCodeSize,
        compressedData: sub.data, subBlockSizes: sub.sizes,
      });
      continue;
    }

    // Unknown block — skip byte to avoid infinite loop
    pos++;
  }

  return {
    header, globalColorTable, extensions, images, comments, appExtensions,
    isAnimated: images.length > 1, frameCount: images.length,
    fileSize: buf.length, trailingData,
  };
}
