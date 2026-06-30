// ─── ZIP Archive Parser ───
// Pure TypeScript ZIP parser for steganography analysis.
// No external dependencies — Buffer-based parsing only.
// Detects slack spaces, prepended/appended data, and structural anomalies.

// ─── Constants ───

const LOCAL_FILE_SIG = 0x04034b50;
const CENTRAL_DIR_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const DATA_DESC_SIG = 0x08074b50;
const EOCD_MIN_SIZE = 22;
const EOCD_MAX_COMMENT = 65535;

const EXTRA_FIELD_DESCRIPTIONS: Record<number, string> = {
  0x0001: "Zip64 extended information",
  0x0007: "AV Info",
  0x0008: "Extended language encoding",
  0x0009: "OS/2 extended attributes",
  0x000a: "NTFS extra field",
  0x000c: "OpenVMS",
  0x000d: "Unix",
  0x000e: "File stream and fork descriptors",
  0x000f: "Patch descriptor",
  0x0014: "PKCS#7 store for X.509 Certificates",
  0x0015: "X.509 Certificate ID for central directory",
  0x0016: "X.509 Certificate ID for local file",
  0x0017: "Strong encryption header",
  0x0018: "Record management controls",
  0x0019: "PKCS#7 encryption recipient certificate list",
  0x0065: "IBM S/390 (Z390) attributes — uncompressed",
  0x0066: "IBM S/390 (Z390) attributes — compressed",
  0x4690: "POSZIP 4690",
  0x5455: "Extended timestamp (Unix)",
  0x6375: "Info-ZIP Unicode comment",
  0x7075: "Info-ZIP Unicode path",
  0x7855: "Info-ZIP Unix extra field (type 1)",
  0x7875: "Info-ZIP Unix extra field (type 3 — UID/GID)",
  0xa220: "Microsoft Open Packaging Growth Hint",
  0xcafe: "Java JAR marker",
  0xd935: "Android alignment",
  0xfb4a: "SMS/QDOS",
};

// ─── Interfaces ───

export interface ZipLocalFileHeader {
  offset: number;
  versionNeeded: number;
  flags: number;
  compressionMethod: number; // 0=stored, 8=deflate
  lastModTime: number;
  lastModDate: number;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  fileName: string;
  extraField: Buffer;
  dataOffset: number; // where compressed data starts
}

export interface ZipExtraField {
  headerId: number;
  size: number;
  data: Buffer;
  description: string; // human-readable field type
}

export interface ZipCentralDirEntry {
  offset: number; // offset of this CD entry
  versionMadeBy: number;
  versionNeeded: number;
  flags: number;
  compressionMethod: number;
  lastModTime: number;
  lastModDate: number;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  fileName: string;
  extraField: Buffer;
  fileComment: string;
  diskNumberStart: number;
  internalAttributes: number;
  externalAttributes: number;
  localHeaderOffset: number;
  extraFields: ZipExtraField[];
}

export interface ZipEndOfCentralDir {
  offset: number;
  diskNumber: number;
  cdDiskNumber: number;
  cdEntriesOnDisk: number;
  cdTotalEntries: number;
  cdSize: number;
  cdOffset: number;
  comment: string;
}

export interface ZipParseResult {
  localFiles: ZipLocalFileHeader[];
  centralDirectory: ZipCentralDirEntry[];
  endOfCentralDir: ZipEndOfCentralDir | null;
  fileCount: number;
  archiveComment: string;
  totalCompressedSize: number;
  totalUncompressedSize: number;
  slackSpaces: Array<{ afterFile: string; offset: number; size: number }>;
  prependedData: number; // bytes before first local header
  appendedData: number; // bytes after EOCD
  fileSize: number;
}

// ─── Extra Field Parsing ───

/** Parse ZIP extra field buffer into individual fields */
export function parseExtraFields(buf: Buffer): ZipExtraField[] {
  const fields: ZipExtraField[] = [];
  let offset = 0;
  while (offset + 4 <= buf.length) {
    const headerId = buf.readUInt16LE(offset);
    const size = buf.readUInt16LE(offset + 2);
    if (offset + 4 + size > buf.length) break;
    const data = buf.subarray(offset + 4, offset + 4 + size);
    const description =
      EXTRA_FIELD_DESCRIPTIONS[headerId] ??
      `Unknown (0x${headerId.toString(16).padStart(4, "0")})`;
    fields.push({ headerId, size, data, description });
    offset += 4 + size;
  }
  return fields;
}

// ─── Local File Header Parsing ───

/** Parse a single local file header at the given offset */
export function parseLocalFileHeader(buf: Buffer, offset: number): ZipLocalFileHeader | null {
  if (offset + 30 > buf.length) return null;
  if (buf.readUInt32LE(offset) !== LOCAL_FILE_SIG) return null;

  const versionNeeded = buf.readUInt16LE(offset + 4);
  const flags = buf.readUInt16LE(offset + 6);
  const compressionMethod = buf.readUInt16LE(offset + 8);
  const lastModTime = buf.readUInt16LE(offset + 10);
  const lastModDate = buf.readUInt16LE(offset + 12);
  const crc32 = buf.readUInt32LE(offset + 14);
  const compressedSize = buf.readUInt32LE(offset + 18);
  const uncompressedSize = buf.readUInt32LE(offset + 22);
  const fileNameLen = buf.readUInt16LE(offset + 26);
  const extraFieldLen = buf.readUInt16LE(offset + 28);

  if (offset + 30 + fileNameLen + extraFieldLen > buf.length) return null;

  const fileName = buf.subarray(offset + 30, offset + 30 + fileNameLen).toString("utf-8");
  const extraField = buf.subarray(
    offset + 30 + fileNameLen,
    offset + 30 + fileNameLen + extraFieldLen,
  );
  const dataOffset = offset + 30 + fileNameLen + extraFieldLen;

  return {
    offset, versionNeeded, flags, compressionMethod,
    lastModTime, lastModDate, crc32,
    compressedSize, uncompressedSize,
    fileName, extraField, dataOffset,
  };
}

// ─── Central Directory Parsing ───

/** Parse central directory entries starting at offset */
export function parseCentralDirectory(
  buf: Buffer, offset: number, count: number,
): ZipCentralDirEntry[] {
  const entries: ZipCentralDirEntry[] = [];
  let pos = offset;

  for (let i = 0; i < count; i++) {
    if (pos + 46 > buf.length) break;
    if (buf.readUInt32LE(pos) !== CENTRAL_DIR_SIG) break;

    const versionMadeBy = buf.readUInt16LE(pos + 4);
    const versionNeeded = buf.readUInt16LE(pos + 6);
    const flags = buf.readUInt16LE(pos + 8);
    const compressionMethod = buf.readUInt16LE(pos + 10);
    const lastModTime = buf.readUInt16LE(pos + 12);
    const lastModDate = buf.readUInt16LE(pos + 14);
    const crc32 = buf.readUInt32LE(pos + 16);
    const compressedSize = buf.readUInt32LE(pos + 20);
    const uncompressedSize = buf.readUInt32LE(pos + 24);
    const fileNameLen = buf.readUInt16LE(pos + 28);
    const extraFieldLen = buf.readUInt16LE(pos + 30);
    const fileCommentLen = buf.readUInt16LE(pos + 32);
    const diskNumberStart = buf.readUInt16LE(pos + 34);
    const internalAttributes = buf.readUInt16LE(pos + 36);
    const externalAttributes = buf.readUInt32LE(pos + 38);
    const localHeaderOffset = buf.readUInt32LE(pos + 42);

    const varLen = fileNameLen + extraFieldLen + fileCommentLen;
    if (pos + 46 + varLen > buf.length) break;

    const fileName = buf.subarray(pos + 46, pos + 46 + fileNameLen).toString("utf-8");
    const extraField = buf.subarray(pos + 46 + fileNameLen, pos + 46 + fileNameLen + extraFieldLen);
    const fileComment = buf
      .subarray(pos + 46 + fileNameLen + extraFieldLen, pos + 46 + varLen)
      .toString("utf-8");
    const extraFields = parseExtraFields(extraField);

    entries.push({
      offset: pos, versionMadeBy, versionNeeded, flags, compressionMethod,
      lastModTime, lastModDate, crc32, compressedSize, uncompressedSize,
      fileName, extraField, fileComment, diskNumberStart,
      internalAttributes, externalAttributes, localHeaderOffset, extraFields,
    });
    pos += 46 + varLen;
  }

  return entries;
}

// ─── End of Central Directory ───

/** Scan backwards from end of buffer to find End of Central Directory record */
export function findEndOfCentralDir(buf: Buffer): ZipEndOfCentralDir | null {
  const searchStart = Math.max(0, buf.length - EOCD_MIN_SIZE - EOCD_MAX_COMMENT);
  const searchEnd = buf.length - EOCD_MIN_SIZE;

  for (let i = searchEnd; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) !== EOCD_SIG) continue;

    // Validate that comment length matches remaining bytes
    const commentLen = buf.readUInt16LE(i + 20);
    if (i + EOCD_MIN_SIZE + commentLen > buf.length) continue;

    return {
      offset: i,
      diskNumber: buf.readUInt16LE(i + 4),
      cdDiskNumber: buf.readUInt16LE(i + 6),
      cdEntriesOnDisk: buf.readUInt16LE(i + 8),
      cdTotalEntries: buf.readUInt16LE(i + 10),
      cdSize: buf.readUInt32LE(i + 12),
      cdOffset: buf.readUInt32LE(i + 16),
      comment: buf.subarray(i + 22, i + 22 + commentLen).toString("utf-8"),
    };
  }

  return null;
}

// ─── Slack Space Detection ───

/** Advance past a data descriptor if the entry uses one (bit 3 of flags) */
function advancePastDataDescriptor(buf: Buffer, entryEnd: number, flags: number): number {
  if (!(flags & 0x0008)) return entryEnd;
  if (entryEnd + 4 <= buf.length && buf.readUInt32LE(entryEnd) === DATA_DESC_SIG) {
    return entryEnd + 16; // signature(4) + crc(4) + compSize(4) + uncompSize(4)
  }
  if (entryEnd + 12 <= buf.length) {
    return entryEnd + 12; // crc(4) + compSize(4) + uncompSize(4) without signature
  }
  return entryEnd;
}

/** Scan forward from offset to find the next ZIP structure signature */
function findNextSignatureOffset(buf: Buffer, start: number): number {
  for (let i = start; i + 4 <= buf.length; i++) {
    const sig = buf.readUInt32LE(i);
    if (sig === LOCAL_FILE_SIG || sig === CENTRAL_DIR_SIG || sig === EOCD_SIG) return i;
  }
  return buf.length;
}

/** Scan buffer for the first local file header signature */
function findFirstLocalHeader(buf: Buffer): number {
  for (let i = 0; i + 4 <= buf.length; i++) {
    if (buf.readUInt32LE(i) === LOCAL_FILE_SIG) return i;
  }
  return -1;
}

/**
 * Find gaps (slack spaces) between local file entries.
 * Slack spaces are potential steganographic hiding spots --
 * data can be concealed in the padding between file entries.
 */
export function findZipSlackSpaces(
  localFiles: ZipLocalFileHeader[],
  buf: Buffer,
): Array<{ afterFile: string; offset: number; size: number }> {
  if (localFiles.length === 0) return [];

  const slackSpaces: Array<{ afterFile: string; offset: number; size: number }> = [];
  const sorted = [...localFiles].sort((a, b) => a.offset - b.offset);

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const entryEnd = advancePastDataDescriptor(
      buf, entry.dataOffset + entry.compressedSize, entry.flags,
    );

    const nextOffset = i + 1 < sorted.length
      ? sorted[i + 1].offset
      : findNextSignatureOffset(buf, entryEnd);

    const gap = nextOffset - entryEnd;
    if (gap > 0) {
      slackSpaces.push({ afterFile: entry.fileName, offset: entryEnd, size: gap });
    }
  }

  return slackSpaces;
}

// ─── Main Parse Function ───

/** Parse a ZIP archive buffer into a structured result with stego-relevant metadata */
export function parseZip(buf: Buffer): ZipParseResult {
  const result: ZipParseResult = {
    localFiles: [],
    centralDirectory: [],
    endOfCentralDir: null,
    fileCount: 0,
    archiveComment: "",
    totalCompressedSize: 0,
    totalUncompressedSize: 0,
    slackSpaces: [],
    prependedData: 0,
    appendedData: 0,
    fileSize: buf.length,
  };

  // Step 1: Find End of Central Directory
  const eocd = findEndOfCentralDir(buf);
  result.endOfCentralDir = eocd;

  if (eocd) {
    result.archiveComment = eocd.comment;
    const eocdEnd = eocd.offset + EOCD_MIN_SIZE + Buffer.byteLength(eocd.comment, "utf-8");
    result.appendedData = Math.max(0, buf.length - eocdEnd);

    // Step 2: Parse Central Directory
    if (eocd.cdOffset + eocd.cdSize <= buf.length) {
      result.centralDirectory = parseCentralDirectory(buf, eocd.cdOffset, eocd.cdTotalEntries);
    }

    // Step 3: Parse Local File Headers using CD entries as guide
    for (const cdEntry of result.centralDirectory) {
      const local = parseLocalFileHeader(buf, cdEntry.localHeaderOffset);
      if (local) result.localFiles.push(local);
    }
  }

  // Fallback: if no CD entries found, scan sequentially for local file headers
  if (result.localFiles.length === 0) {
    let offset = findFirstLocalHeader(buf);
    while (offset >= 0 && offset + 30 <= buf.length) {
      const header = parseLocalFileHeader(buf, offset);
      if (!header) break;
      result.localFiles.push(header);

      const nextOffset = advancePastDataDescriptor(
        buf, header.dataOffset + header.compressedSize, header.flags,
      );
      if (nextOffset + 4 <= buf.length && buf.readUInt32LE(nextOffset) === LOCAL_FILE_SIG) {
        offset = nextOffset;
      } else {
        break;
      }
    }
  }

  // Step 4: Calculate prepended data
  if (result.localFiles.length > 0) {
    result.prependedData = Math.min(...result.localFiles.map((f) => f.offset));
  } else {
    const first = findFirstLocalHeader(buf);
    result.prependedData = first >= 0 ? first : 0;
  }

  // Step 5: Compute totals
  result.fileCount = result.localFiles.length;
  for (const entry of result.localFiles) {
    result.totalCompressedSize += entry.compressedSize;
    result.totalUncompressedSize += entry.uncompressedSize;
  }

  // Step 6: Detect slack spaces
  result.slackSpaces = findZipSlackSpaces(result.localFiles, buf);

  return result;
}
