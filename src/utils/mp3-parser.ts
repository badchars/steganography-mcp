// ─── MP3 Types ───

export interface Id3v1Tag {
  title: string;
  artist: string;
  album: string;
  year: string;
  comment: string;
  track: number | null;
  genre: number;
}

export interface Id3v2Frame {
  id: string;
  size: number;
  flags: number;
  data: Buffer;
}

export interface Id3v2Tag {
  version: number;
  revision: number;
  flags: { unsynchronisation: boolean; extendedHeader: boolean; experimental: boolean };
  size: number;
  frames: Id3v2Frame[];
  padding: number;
}

export interface Mp3FrameHeader {
  offset: number;
  version: number;
  layer: number;
  hasCRC: boolean;
  bitrate: number;
  sampleRate: number;
  padding: boolean;
  channelMode: "stereo" | "joint_stereo" | "dual_channel" | "mono";
  modeExtension: number;
  emphasis: string;
  frameSize: number;
}

export interface Mp3ParseResult {
  id3v1: Id3v1Tag | null;
  id3v2: Id3v2Tag | null;
  frames: Mp3FrameHeader[];
  frameCount: number;
  duration: number;
  averageBitrate: number;
  isVBR: boolean;
  firstFrameOffset: number;
  fileSize: number;
  gapBeforeFirstFrame: number;
  trailingData: number;
}

// ─── Bitrate & Sample Rate Lookup Tables ───

// Bitrates in kbps indexed by [version][layer][index]
// version: 1 = MPEG1, 2 = MPEG2/2.5
// layer: 1, 2, 3
const BITRATE_TABLE: Record<number, Record<number, number[]>> = {
  1: {
    1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1],
    2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1],
    3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1],
  },
  2: {
    1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, -1],
    2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1],
    3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1],
  },
};

// Sample rates in Hz indexed by [version][index]
const SAMPLERATE_TABLE: Record<number, number[]> = {
  1: [44100, 48000, 32000, -1],     // MPEG1
  2: [22050, 24000, 16000, -1],     // MPEG2
  2.5: [11025, 12000, 8000, -1],   // MPEG2.5
};

// Samples per frame indexed by [version][layer]
const SAMPLES_PER_FRAME: Record<number, Record<number, number>> = {
  1: { 1: 384, 2: 1152, 3: 1152 },
  2: { 1: 384, 2: 1152, 3: 576 },
  2.5: { 1: 384, 2: 1152, 3: 576 },
};

const CHANNEL_MODES = ["stereo", "joint_stereo", "dual_channel", "mono"] as const;
const EMPHASIS_VALUES = ["none", "50/15 ms", "reserved", "CCIT J.17"] as const;

// ─── ID3v2 Synchsafe Integer ───

/** Decode a 4-byte synchsafe integer (7 bits per byte) */
function decodeSynchsafe(buf: Buffer, offset: number): number {
  return (
    ((buf[offset] & 0x7f) << 21) |
    ((buf[offset + 1] & 0x7f) << 14) |
    ((buf[offset + 2] & 0x7f) << 7) |
    (buf[offset + 3] & 0x7f)
  );
}

/** Strip trailing null bytes and decode as latin1 */
function stripNulls(buf: Buffer): string {
  let end = buf.length;
  while (end > 0 && buf[end - 1] === 0) end--;
  return buf.subarray(0, end).toString("latin1").trim();
}

// ─── ID3v1 Parser ───

/** Parse ID3v1 tag from the last 128 bytes of a buffer */
export function parseId3v1(buf: Buffer): Id3v1Tag | null {
  if (buf.length < 128) return null;

  const tagStart = buf.length - 128;
  const magic = buf.subarray(tagStart, tagStart + 3).toString("ascii");
  if (magic !== "TAG") return null;

  const title = stripNulls(buf.subarray(tagStart + 3, tagStart + 33));
  const artist = stripNulls(buf.subarray(tagStart + 33, tagStart + 63));
  const album = stripNulls(buf.subarray(tagStart + 63, tagStart + 93));
  const year = stripNulls(buf.subarray(tagStart + 93, tagStart + 97));
  const commentBuf = buf.subarray(tagStart + 97, tagStart + 127);
  const genre = buf[tagStart + 127];

  // ID3v1.1: if comment[28] == 0 and comment[29] != 0, it's the track number
  let comment: string;
  let track: number | null = null;

  if (commentBuf[28] === 0 && commentBuf[29] !== 0) {
    comment = stripNulls(commentBuf.subarray(0, 28));
    track = commentBuf[29];
  } else {
    comment = stripNulls(commentBuf);
  }

  return { title, artist, album, year, comment, track, genre };
}

// ─── ID3v2 Parser ───

/** Parse ID3v2 tag from the beginning of a buffer */
export function parseId3v2(buf: Buffer): Id3v2Tag | null {
  if (buf.length < 10) return null;

  const magic = buf.subarray(0, 3).toString("ascii");
  if (magic !== "ID3") return null;

  const version = buf[3];
  const revision = buf[4];
  const flagByte = buf[5];
  const tagSize = decodeSynchsafe(buf, 6);

  if (version < 2 || version > 4) return null;

  const flags = {
    unsynchronisation: (flagByte & 0x80) !== 0,
    extendedHeader: (flagByte & 0x40) !== 0,
    experimental: (flagByte & 0x20) !== 0,
  };

  const headerSize = 10;
  const tagEnd = headerSize + tagSize;

  if (buf.length < tagEnd) return null;

  // Parse frames
  const frames: Id3v2Frame[] = [];
  let offset = headerSize;

  // Skip extended header if present
  if (flags.extendedHeader && version >= 3) {
    if (offset + 4 > tagEnd) return { version, revision, flags, size: tagSize, frames, padding: 0 };
    const extSize = version === 4
      ? decodeSynchsafe(buf, offset)
      : buf.readUInt32BE(offset);
    offset += version === 4 ? extSize : extSize + 4;
  }

  // Frame header sizes differ by version
  const frameHeaderSize = version === 2 ? 6 : 10;
  const frameIdSize = version === 2 ? 3 : 4;

  while (offset + frameHeaderSize <= tagEnd) {
    // Check for padding (0x00 bytes)
    if (buf[offset] === 0x00) break;

    const frameId = buf.subarray(offset, offset + frameIdSize).toString("ascii");

    // Validate frame ID: should be uppercase letters and digits
    if (!/^[A-Z0-9]+$/.test(frameId)) break;

    let frameSize: number;
    let frameFlags: number;

    if (version === 2) {
      // ID3v2.2: 3-byte size (big-endian), no flags
      frameSize = (buf[offset + 3] << 16) | (buf[offset + 4] << 8) | buf[offset + 5];
      frameFlags = 0;
    } else if (version === 3) {
      // ID3v2.3: 4-byte size (big-endian), 2-byte flags
      frameSize = buf.readUInt32BE(offset + frameIdSize);
      frameFlags = buf.readUInt16BE(offset + frameIdSize + 4);
    } else {
      // ID3v2.4: 4-byte synchsafe size, 2-byte flags
      frameSize = decodeSynchsafe(buf, offset + frameIdSize);
      frameFlags = buf.readUInt16BE(offset + frameIdSize + 4);
    }

    if (frameSize <= 0 || offset + frameHeaderSize + frameSize > tagEnd) break;

    const data = Buffer.from(buf.subarray(offset + frameHeaderSize, offset + frameHeaderSize + frameSize));
    frames.push({ id: frameId, size: frameSize, flags: frameFlags, data });

    offset += frameHeaderSize + frameSize;
  }

  // Calculate padding (remaining 0x00 bytes before tag end)
  let padding = 0;
  while (offset + padding < tagEnd && buf[offset + padding] === 0x00) {
    padding++;
  }

  return { version, revision, flags, size: tagSize, frames, padding };
}

// ─── MP3 Frame Header Parser ───

/** Parse a single MP3 frame header at the given offset */
export function parseFrameHeader(buf: Buffer, offset: number): Mp3FrameHeader | null {
  if (offset + 4 > buf.length) return null;

  const h0 = buf[offset];
  const h1 = buf[offset + 1];
  const h2 = buf[offset + 2];
  const h3 = buf[offset + 3];

  // Check sync word: 11 bits set (0xFFE0 mask on first 2 bytes)
  if (h0 !== 0xff || (h1 & 0xe0) !== 0xe0) return null;

  // Version: bits 4-3 of byte 1
  const versionBits = (h1 >> 3) & 0x03;
  let version: number;
  switch (versionBits) {
    case 0: version = 2.5; break;  // MPEG2.5
    case 2: version = 2; break;    // MPEG2
    case 3: version = 1; break;    // MPEG1
    default: return null;          // Reserved
  }

  // Layer: bits 2-1 of byte 1
  const layerBits = (h1 >> 1) & 0x03;
  let layer: number;
  switch (layerBits) {
    case 1: layer = 3; break;
    case 2: layer = 2; break;
    case 3: layer = 1; break;
    default: return null;  // Reserved
  }

  // CRC protection: bit 0 of byte 1 (0 = protected)
  const hasCRC = (h1 & 0x01) === 0;

  // Bitrate: bits 7-4 of byte 2
  const bitrateIndex = (h2 >> 4) & 0x0f;
  const bitrateVersion = version === 1 ? 1 : 2;
  const bitrateRow = BITRATE_TABLE[bitrateVersion]?.[layer];
  if (!bitrateRow) return null;
  const bitrate = bitrateRow[bitrateIndex];
  if (bitrate <= 0) return null; // Free or bad

  // Sample rate: bits 3-2 of byte 2
  const sampleRateIndex = (h2 >> 2) & 0x03;
  const sampleRateRow = SAMPLERATE_TABLE[version];
  if (!sampleRateRow) return null;
  const sampleRate = sampleRateRow[sampleRateIndex];
  if (sampleRate <= 0) return null;

  // Padding: bit 1 of byte 2
  const padding = ((h2 >> 1) & 0x01) === 1;

  // Channel mode: bits 7-6 of byte 3
  const channelModeIndex = (h3 >> 6) & 0x03;
  const channelMode = CHANNEL_MODES[channelModeIndex];

  // Mode extension: bits 5-4 of byte 3
  const modeExtension = (h3 >> 4) & 0x03;

  // Emphasis: bits 1-0 of byte 3
  const emphasisIndex = h3 & 0x03;
  const emphasis = EMPHASIS_VALUES[emphasisIndex];

  // Frame size calculation
  let frameSize: number;
  if (layer === 1) {
    // Layer I: 4 * (12 * bitrate * 1000 / sampleRate + padding)
    frameSize = Math.floor(12 * bitrate * 1000 / sampleRate + (padding ? 1 : 0)) * 4;
  } else {
    // Layer II & III: floor(144 * bitrate * 1000 / sampleRate) + padding
    const samplesPerFrame = SAMPLES_PER_FRAME[version]?.[layer] ?? 1152;
    const slotSize = layer === 1 ? 4 : 1;
    frameSize = Math.floor(samplesPerFrame / 8 * bitrate * 1000 / sampleRate) * slotSize + (padding ? slotSize : 0);
  }

  if (frameSize < 1) return null;

  return {
    offset,
    version,
    layer,
    hasCRC,
    bitrate,
    sampleRate,
    padding,
    channelMode,
    modeExtension,
    emphasis,
    frameSize,
  };
}

// ─── MP3 Frame Scanner ───

/** Find and parse MP3 audio frames starting from a given offset */
export function findMp3Frames(
  buf: Buffer,
  startOffset: number = 0,
  maxFrames: number = Infinity,
): Mp3FrameHeader[] {
  const frames: Mp3FrameHeader[] = [];
  let offset = startOffset;

  while (offset + 4 <= buf.length && frames.length < maxFrames) {
    // Scan for sync word
    if (buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }

    const frame = parseFrameHeader(buf, offset);
    if (!frame || frame.frameSize < 1) {
      offset++;
      continue;
    }

    // Validate by checking the next frame's sync word (if within bounds)
    const nextOffset = offset + frame.frameSize;
    if (nextOffset + 1 < buf.length) {
      if (buf[nextOffset] !== 0xff || (buf[nextOffset + 1] & 0xe0) !== 0xe0) {
        // Next frame doesn't have a valid sync — might be a false positive
        // Only reject if we haven't found any frames yet (be lenient later)
        if (frames.length === 0) {
          offset++;
          continue;
        }
      }
    }

    frames.push(frame);
    offset = nextOffset;
  }

  return frames;
}

// ─── Full MP3 Parser ───

/** Parse an MP3 buffer: ID3 tags, audio frames, and metadata */
export function parseMp3(buf: Buffer): Mp3ParseResult {
  const fileSize = buf.length;

  // ── ID3v2 at start ──
  const id3v2 = parseId3v2(buf);
  let audioStart = 0;

  if (id3v2) {
    // 10-byte header + tag size
    audioStart = 10 + id3v2.size;
  }

  // ── ID3v1 at end ──
  const id3v1 = parseId3v1(buf);
  const audioEnd = id3v1 ? buf.length - 128 : buf.length;

  // ── Find MP3 frames ──
  const frames = findMp3Frames(buf.subarray(0, audioEnd), audioStart);

  // Adjust frame offsets are already absolute (findMp3Frames uses buf from 0)
  const frameCount = frames.length;

  // First frame offset
  const firstFrameOffset = frameCount > 0 ? frames[0].offset : audioStart;

  // Gap between ID3v2 end and first audio frame
  const gapBeforeFirstFrame = firstFrameOffset - audioStart;

  // Trailing data: bytes after the last frame before ID3v1 (or EOF)
  let trailingData = 0;
  if (frameCount > 0) {
    const lastFrame = frames[frameCount - 1];
    const lastFrameEnd = lastFrame.offset + lastFrame.frameSize;
    trailingData = audioEnd - lastFrameEnd;
    if (trailingData < 0) trailingData = 0;
  }

  // ── Bitrate & VBR detection ──
  let totalBitrate = 0;
  let isVBR = false;
  const firstBitrate = frameCount > 0 ? frames[0].bitrate : 0;

  for (const frame of frames) {
    totalBitrate += frame.bitrate;
    if (frame.bitrate !== firstBitrate) isVBR = true;
  }

  const averageBitrate = frameCount > 0 ? Math.round(totalBitrate / frameCount) : 0;

  // ── Duration estimate ──
  let duration = 0;
  if (frameCount > 0) {
    const sampleRate = frames[0].sampleRate;
    const version = frames[0].version;
    const layer = frames[0].layer;
    const samplesPerFrame = SAMPLES_PER_FRAME[version]?.[layer] ?? 1152;
    duration = (frameCount * samplesPerFrame) / sampleRate;
  }

  return {
    id3v1,
    id3v2,
    frames,
    frameCount,
    duration,
    averageBitrate,
    isVBR,
    firstFrameOffset,
    fileSize,
    gapBeforeFirstFrame,
    trailingData,
  };
}
