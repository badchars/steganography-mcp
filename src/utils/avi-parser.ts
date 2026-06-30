import { readFileInput } from "./binary.js";

// ─── AVI/RIFF Types ───

export interface RiffChunk {
  fourCC: string;    // 4-char code (RIFF, LIST, movi, etc.)
  size: number;      // chunk data size
  offset: number;    // byte offset in file
  data?: Buffer;     // raw data (only for small chunks)
  children?: RiffChunk[];  // sub-chunks for LIST/RIFF
}

export interface AviHeader {
  microSecPerFrame: number;
  maxBytesPerSec: number;
  totalFrames: number;
  width: number;
  height: number;
  streams: number;
}

export interface StreamHeader {
  type: string;      // 'vids' or 'auds'
  codec: string;     // FourCC codec (e.g., 'MJPG', 'H264')
  rate: number;
  scale: number;
  length: number;    // number of frames/samples
  sampleSize: number;
}

export interface AviIndex {
  chunkId: string;   // e.g., '00dc' (video), '01wb' (audio)
  flags: number;
  offset: number;
  size: number;
}

export interface AviParseResult {
  chunks: RiffChunk[];
  header: AviHeader | null;
  streams: StreamHeader[];
  index: AviIndex[];
  frameCount: number;
  hasAudio: boolean;
  fileSize: number;
}

// ─── Constants ───

/** Maximum chunk data size to attach inline (64 KB) */
const MAX_INLINE_DATA = 64 * 1024;

/** Container fourCC codes that hold sub-chunks */
const CONTAINER_TYPES = new Set(["RIFF", "LIST"]);

// ─── RIFF Chunk Parsing ───

/** Recursively parse RIFF/LIST chunk tree from a buffer region */
export function parseRiffChunks(
  buf: Buffer,
  offset: number = 0,
  end?: number,
): RiffChunk[] {
  const limit = end ?? buf.length;
  const chunks: RiffChunk[] = [];

  while (offset + 8 <= limit) {
    const fourCC = buf.subarray(offset, offset + 4).toString("ascii");
    const size = buf.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = Math.min(dataStart + size, limit);

    if (CONTAINER_TYPES.has(fourCC) && dataEnd >= dataStart + 4) {
      // RIFF and LIST have a 4-byte form/list type followed by sub-chunks
      const formType = buf.subarray(dataStart, dataStart + 4).toString("ascii");
      const children = parseRiffChunks(buf, dataStart + 4, dataEnd);

      chunks.push({
        fourCC: formType,
        size,
        offset,
        children,
      });
    } else {
      const chunk: RiffChunk = {
        fourCC,
        size,
        offset,
      };

      // Attach raw data only for reasonably small chunks
      if (size <= MAX_INLINE_DATA && dataEnd <= buf.length) {
        chunk.data = buf.subarray(dataStart, dataEnd);
      }

      chunks.push(chunk);
    }

    // Advance past header + data, respecting word alignment
    offset = dataStart + size;
    if (size % 2 !== 0) offset++;
  }

  return chunks;
}

// ─── AVI Header Parsing ───

/** Parse the main AVI header (avih chunk, 56 bytes) */
function parseAvihChunk(data: Buffer): AviHeader {
  if (data.length < 40) throw new Error("avih chunk too small");

  return {
    microSecPerFrame: data.readUInt32LE(0),
    maxBytesPerSec: data.readUInt32LE(4),
    totalFrames: data.readUInt32LE(16),
    streams: data.readUInt32LE(24),
    width: data.readUInt32LE(32),
    height: data.readUInt32LE(36),
  };
}

/** Parse a stream header (strh chunk, 56 bytes) */
function parseStrhChunk(data: Buffer): StreamHeader {
  if (data.length < 48) throw new Error("strh chunk too small");

  return {
    type: data.subarray(0, 4).toString("ascii"),
    codec: data.subarray(4, 8).toString("ascii"),
    scale: data.readUInt32LE(20),
    rate: data.readUInt32LE(24),
    length: data.readUInt32LE(32),
    sampleSize: data.readUInt32LE(44),
  };
}

// ─── Index Parsing ───

/** Parse the idx1 index table (each entry = 16 bytes) */
function parseIdx1(data: Buffer): AviIndex[] {
  const entries: AviIndex[] = [];
  const entryCount = Math.floor(data.length / 16);

  for (let i = 0; i < entryCount; i++) {
    const off = i * 16;
    entries.push({
      chunkId: data.subarray(off, off + 4).toString("ascii"),
      flags: data.readUInt32LE(off + 4),
      offset: data.readUInt32LE(off + 8),
      size: data.readUInt32LE(off + 12),
    });
  }

  return entries;
}

// ─── Recursive Chunk Search ───

/** Find all chunks matching a fourCC within a parsed tree */
function findChunks(chunks: RiffChunk[], fourCC: string): RiffChunk[] {
  const results: RiffChunk[] = [];

  for (const chunk of chunks) {
    if (chunk.fourCC === fourCC) results.push(chunk);
    if (chunk.children) {
      results.push(...findChunks(chunk.children, fourCC));
    }
  }

  return results;
}

/** Find the first chunk matching a fourCC */
function findChunk(chunks: RiffChunk[], fourCC: string): RiffChunk | undefined {
  return findChunks(chunks, fourCC)[0];
}

// ─── Main AVI Parser ───

/** Parse a full AVI file buffer into structured data */
export function parseAvi(buf: Buffer): AviParseResult {
  if (buf.length < 12) throw new Error("File too small to be a valid AVI");
  if (buf.subarray(0, 4).toString("ascii") !== "RIFF") throw new Error("Not a RIFF file");
  if (buf.subarray(8, 12).toString("ascii") !== "AVI ") throw new Error("Not an AVI file");

  const chunks = parseRiffChunks(buf);

  // Parse main header (avih)
  let header: AviHeader | null = null;
  const avihChunk = findChunk(chunks, "avih");
  if (avihChunk?.data) {
    header = parseAvihChunk(avihChunk.data);
  }

  // Parse stream headers (strh) from strl LIST containers
  const streams: StreamHeader[] = [];
  const strhChunks = findChunks(chunks, "strh");
  for (const strh of strhChunks) {
    if (strh.data) {
      try {
        streams.push(parseStrhChunk(strh.data));
      } catch {
        // Skip malformed stream headers
      }
    }
  }

  // Parse index (idx1)
  let index: AviIndex[] = [];
  const idx1Chunk = findChunk(chunks, "idx1");
  if (idx1Chunk?.data) {
    index = parseIdx1(idx1Chunk.data);
  }

  // Derive counts from index entries
  const videoEntries = index.filter((e) => e.chunkId.endsWith("dc") || e.chunkId.endsWith("db"));
  const audioEntries = index.filter((e) => e.chunkId.endsWith("wb"));
  const frameCount = header?.totalFrames ?? videoEntries.length;

  return {
    chunks,
    header,
    streams,
    index,
    frameCount,
    hasAudio: audioEntries.length > 0 || streams.some((s) => s.type === "auds"),
    fileSize: buf.length,
  };
}

// ─── Frame Extraction ───

/** Extract raw frame data from the movi chunk using idx1 entries */
export function extractFrameData(
  buf: Buffer,
  index: AviIndex[],
  frameNumbers?: number[],
): Buffer[] {
  // Find the movi LIST offset — look for 'movi' at (LIST offset + 8)
  let moviOffset = -1;
  let searchPos = 0;

  while (searchPos + 12 <= buf.length) {
    if (
      buf.subarray(searchPos, searchPos + 4).toString("ascii") === "LIST" &&
      buf.subarray(searchPos + 8, searchPos + 12).toString("ascii") === "movi"
    ) {
      moviOffset = searchPos;
      break;
    }
    searchPos++;
  }

  if (moviOffset === -1) throw new Error("movi LIST not found in AVI");

  // idx1 offsets are typically relative to the movi data start (moviOffset + 12)
  // but some files use absolute offsets — detect by checking first entry
  const moviDataStart = moviOffset + 12;
  let baseOffset = moviDataStart;

  if (index.length > 0) {
    const firstEntry = index[0];
    // If the first offset points past the file, it's likely relative
    // If it already points near movi, it could be absolute
    const absoluteCandidate = firstEntry.offset;
    const relativeCandidate = moviDataStart + firstEntry.offset;

    if (
      absoluteCandidate >= moviDataStart &&
      absoluteCandidate + 8 <= buf.length &&
      buf.subarray(absoluteCandidate, absoluteCandidate + 4).toString("ascii") === firstEntry.chunkId
    ) {
      // Offsets are absolute
      baseOffset = 0;
    } else if (
      relativeCandidate + 8 <= buf.length &&
      buf.subarray(relativeCandidate, relativeCandidate + 4).toString("ascii") === firstEntry.chunkId
    ) {
      // Offsets are relative to movi data start
      baseOffset = moviDataStart;
    }
  }

  // Filter to video frame entries only
  const videoEntries = index.filter(
    (e) => e.chunkId.endsWith("dc") || e.chunkId.endsWith("db"),
  );

  // Select specific frames or all
  const selected = frameNumbers
    ? frameNumbers.filter((n) => n >= 0 && n < videoEntries.length).map((n) => videoEntries[n])
    : videoEntries;

  const frames: Buffer[] = [];

  for (const entry of selected) {
    // Each movi sub-chunk: 4-byte chunkId + 4-byte size + data
    const chunkStart = baseOffset + entry.offset;
    const dataStart = chunkStart + 8;
    const dataEnd = dataStart + entry.size;

    if (dataEnd <= buf.length) {
      frames.push(buf.subarray(dataStart, dataEnd));
    }
  }

  return frames;
}

// ─── Appended Data Detection ───

/** Detect data appended after the RIFF container (potential steganography) */
export function findAviAppendedData(
  buf: Buffer,
): { offset: number; size: number; data: Buffer } | null {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 4).toString("ascii") !== "RIFF") return null;

  // RIFF header: 4 bytes "RIFF" + 4 bytes size (covers everything after these 8 bytes)
  const riffSize = buf.readUInt32LE(4);
  const expectedEnd = 8 + riffSize;

  if (expectedEnd < buf.length) {
    return {
      offset: expectedEnd,
      size: buf.length - expectedEnd,
      data: buf.subarray(expectedEnd),
    };
  }

  return null;
}

// ─── Convenience Loader ───

/** Load and parse an AVI file from disk */
export async function loadAvi(filePath: string): Promise<AviParseResult> {
  const buf = await readFileInput(filePath);
  return parseAvi(buf);
}
