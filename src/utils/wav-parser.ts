import { readFileInput } from "./binary.js";

// ─── WAV Types ───

export interface RiffChunk {
  id: string;
  offset: number;
  size: number;
  data: Buffer;
}

export interface WavData {
  sampleRate: number;
  bitDepth: number;
  numChannels: number;
  numSamples: number;
  audioFormat: number; // 1 = PCM, 3 = IEEE float
  byteRate: number;
  blockAlign: number;
  samples: Int16Array | Float32Array;
  rawBuffer: Buffer;
  chunks: RiffChunk[];
  dataOffset: number;
  dataSize: number;
}

// ─── WAV Parsing ───

/** Parse a WAV file into structured data with PCM samples */
export async function parseWav(filePath: string): Promise<WavData> {
  const buf = await readFileInput(filePath);

  // Validate RIFF header
  if (buf.length < 44) throw new Error("File too small to be a valid WAV");
  if (buf.subarray(0, 4).toString("ascii") !== "RIFF") throw new Error("Not a RIFF file");
  if (buf.subarray(8, 12).toString("ascii") !== "WAVE") throw new Error("Not a WAVE file");

  // Parse all chunks
  const chunks: RiffChunk[] = [];
  let offset = 12;

  while (offset + 8 <= buf.length) {
    const id = buf.subarray(offset, offset + 4).toString("ascii");
    const size = buf.readUInt32LE(offset + 4);
    const dataEnd = Math.min(offset + 8 + size, buf.length);
    const data = buf.subarray(offset + 8, dataEnd);
    chunks.push({ id, offset, size, data });
    offset += 8 + size;
    if (size % 2 !== 0) offset++; // Word alignment
  }

  // Parse fmt chunk
  const fmtChunk = chunks.find((c) => c.id === "fmt ");
  if (!fmtChunk) throw new Error("Missing fmt chunk");
  if (fmtChunk.data.length < 16) throw new Error("Invalid fmt chunk");

  const audioFormat = fmtChunk.data.readUInt16LE(0);
  const numChannels = fmtChunk.data.readUInt16LE(2);
  const sampleRate = fmtChunk.data.readUInt32LE(4);
  const byteRate = fmtChunk.data.readUInt32LE(8);
  const blockAlign = fmtChunk.data.readUInt16LE(12);
  const bitDepth = fmtChunk.data.readUInt16LE(14);

  // Parse data chunk
  const dataChunk = chunks.find((c) => c.id === "data");
  if (!dataChunk) throw new Error("Missing data chunk");

  const bytesPerSample = bitDepth / 8;
  const totalSamples = Math.floor(dataChunk.size / bytesPerSample);
  const numSamples = Math.floor(totalSamples / numChannels);

  // Extract PCM samples
  let samples: Int16Array | Float32Array;

  if (audioFormat === 1 && bitDepth === 16) {
    // 16-bit signed PCM (most common)
    samples = new Int16Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const off = i * 2;
      if (off + 1 < dataChunk.data.length) {
        samples[i] = dataChunk.data.readInt16LE(off);
      }
    }
  } else if (audioFormat === 1 && bitDepth === 8) {
    // 8-bit unsigned PCM, convert to Int16 range
    samples = new Int16Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      if (i < dataChunk.data.length) {
        samples[i] = (dataChunk.data[i] - 128) * 256;
      }
    }
  } else if (audioFormat === 1 && bitDepth === 24) {
    // 24-bit signed PCM, convert to Int16 range
    samples = new Int16Array(Math.floor(totalSamples));
    for (let i = 0; i < samples.length; i++) {
      const off = i * 3;
      if (off + 2 < dataChunk.data.length) {
        const val = dataChunk.data[off] | (dataChunk.data[off + 1] << 8) | (dataChunk.data[off + 2] << 16);
        const signed = val >= 0x800000 ? val - 0x1000000 : val;
        samples[i] = Math.round(signed / 256); // Scale to 16-bit range
      }
    }
  } else if (audioFormat === 1 && bitDepth === 32) {
    // 32-bit signed PCM
    samples = new Int16Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const off = i * 4;
      if (off + 3 < dataChunk.data.length) {
        const val = dataChunk.data.readInt32LE(off);
        samples[i] = Math.round(val / 65536); // Scale to 16-bit range
      }
    }
  } else if (audioFormat === 3 && bitDepth === 32) {
    // IEEE 754 float
    samples = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const off = i * 4;
      if (off + 3 < dataChunk.data.length) {
        samples[i] = dataChunk.data.readFloatLE(off);
      }
    }
  } else {
    throw new Error(`Unsupported WAV format: audioFormat=${audioFormat}, bitDepth=${bitDepth}`);
  }

  return {
    sampleRate,
    bitDepth,
    numChannels,
    numSamples,
    audioFormat,
    byteRate,
    blockAlign,
    samples,
    rawBuffer: buf,
    chunks,
    dataOffset: dataChunk.offset + 8,
    dataSize: dataChunk.size,
  };
}

/** Extract metadata from RIFF INFO chunks */
export function extractWavMetadata(chunks: RiffChunk[]): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Look for LIST/INFO chunk
  for (const chunk of chunks) {
    if (chunk.id === "LIST" && chunk.data.length >= 4) {
      const listType = chunk.data.subarray(0, 4).toString("ascii");
      if (listType === "INFO") {
        let offset = 4;
        while (offset + 8 <= chunk.data.length) {
          const subId = chunk.data.subarray(offset, offset + 4).toString("ascii");
          const subSize = chunk.data.readUInt32LE(offset + 4);
          const subData = chunk.data.subarray(offset + 8, offset + 8 + subSize);
          metadata[subId] = subData.toString("utf-8").replace(/\0+$/, "");
          offset += 8 + subSize;
          if (subSize % 2 !== 0) offset++;
        }
      }
    }
  }

  // Known INFO chunk IDs
  const INFO_NAMES: Record<string, string> = {
    IART: "artist",
    ICMT: "comment",
    ICRD: "creation_date",
    IGNR: "genre",
    INAM: "title",
    IPRD: "product",
    ISFT: "software",
    ISRC: "source",
    ISBJ: "subject",
    ICOP: "copyright",
  };

  const readable: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const name = INFO_NAMES[key] ?? key;
    readable[name] = value;
  }

  return readable;
}
