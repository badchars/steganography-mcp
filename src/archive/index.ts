import { z } from "zod";
import { readFileInput, hexDump, detectImageFormat } from "../utils/binary.js";
import { shannonEntropy } from "../utils/stats.js";
import {
  parseZip,
  parseExtraFields,
  findEndOfCentralDir,
  type ZipLocalFileHeader,
  type ZipCentralDirEntry,
} from "../utils/zip-parser.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";

// ─── Helpers ───

const COMPRESSION_METHODS: Record<number, string> = {
  0: "Stored (no compression)",
  1: "Shrunk",
  2: "Reduced (factor 1)",
  3: "Reduced (factor 2)",
  4: "Reduced (factor 3)",
  5: "Reduced (factor 4)",
  6: "Imploded",
  8: "Deflated",
  9: "Deflate64",
  10: "PKWARE DCL Imploded",
  12: "BZIP2",
  14: "LZMA",
  18: "IBM TERSE",
  19: "IBM LZ77 z",
  20: "Zstandard (deprecated)",
  93: "Zstandard",
  95: "XZ",
  96: "JPEG variant",
  97: "WavPack",
  98: "PPMd version I, Rev 1",
  99: "AE-x encryption marker",
};

/** Decode a DOS date/time pair into an ISO string */
function decodeDosDateTime(date: number, time: number): string {
  const year = ((date >> 9) & 0x7f) + 1980;
  const month = (date >> 5) & 0x0f;
  const day = date & 0x1f;
  const hour = (time >> 11) & 0x1f;
  const minute = (time >> 5) & 0x3f;
  const second = (time & 0x1f) * 2;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

/** Format version number (e.g., 20 -> "2.0") */
function formatVersion(v: number): string {
  return `${Math.floor(v / 10)}.${v % 10}`;
}

/** Detect format from magic bytes (for polyglot detection) */
function detectFormatFromMagic(buf: Buffer): string | null {
  if (buf.length < 4) return null;
  const imgFmt = detectImageFormat(buf);
  if (imgFmt !== "unknown") return imgFmt.toUpperCase();
  if (buf.subarray(0, 4).toString("ascii") === "%PDF") return "PDF";
  if (buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46) return "ELF";
  if (buf[0] === 0x4d && buf[1] === 0x5a) return "PE/EXE";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF") return "RIFF";
  if (buf[0] === 0x1f && buf[1] === 0x8b) return "GZIP";
  if (buf.subarray(0, 6).toString("ascii") === "GIF89a" || buf.subarray(0, 6).toString("ascii") === "GIF87a") return "GIF";
  if (buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72 && buf[3] === 0x21) return "RAR";
  return null;
}

// ─── Tools ───

export const archiveTools: ToolDef[] = [
  // 1. archive_detect
  {
    name: "archive_detect",
    description:
      "Auto-detect steganography in ZIP archives. Checks for slack spaces between entries, prepended data before the first local header, appended data after the end-of-central-directory record, unusual extra fields, and file/archive comments that may conceal hidden data.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const findings: Array<{
          type: string;
          severity: "info" | "low" | "medium" | "high";
          description: string;
          details?: Record<string, unknown>;
        }> = [];

        // Check prepended data
        if (zip.prependedData > 0) {
          const prependedBuf = buf.subarray(0, zip.prependedData);
          const entropy = shannonEntropy(prependedBuf);
          findings.push({
            type: "prepended_data",
            severity: "high",
            description: `${zip.prependedData} bytes of data before the first local file header`,
            details: {
              size: zip.prependedData,
              entropy: Number(entropy.toFixed(4)),
              preview: prependedBuf.subarray(0, Math.min(32, prependedBuf.length)).toString("hex"),
            },
          });
        }

        // Check appended data
        if (zip.appendedData > 0) {
          const eocd = zip.endOfCentralDir;
          const appendStart = eocd
            ? eocd.offset + 22 + Buffer.byteLength(eocd.comment, "utf-8")
            : buf.length - zip.appendedData;
          const appendedBuf = buf.subarray(appendStart);
          const entropy = shannonEntropy(appendedBuf);
          findings.push({
            type: "appended_data",
            severity: "high",
            description: `${zip.appendedData} bytes of data after the end-of-central-directory record`,
            details: {
              size: zip.appendedData,
              entropy: Number(entropy.toFixed(4)),
              preview: appendedBuf.subarray(0, Math.min(32, appendedBuf.length)).toString("hex"),
            },
          });
        }

        // Check slack spaces
        if (zip.slackSpaces.length > 0) {
          const totalSlack = zip.slackSpaces.reduce((s, g) => s + g.size, 0);
          findings.push({
            type: "slack_spaces",
            severity: totalSlack > 64 ? "high" : "medium",
            description: `${zip.slackSpaces.length} slack space(s) found between entries, totaling ${totalSlack} bytes`,
            details: {
              count: zip.slackSpaces.length,
              totalBytes: totalSlack,
              spaces: zip.slackSpaces.map((s) => ({
                afterFile: s.afterFile,
                offset: s.offset,
                size: s.size,
              })),
            },
          });
        }

        // Check extra fields for unusual entries
        for (const cd of zip.centralDirectory) {
          const extras = cd.extraFields;
          const unusual = extras.filter(
            (f) =>
              f.description.startsWith("Unknown") || f.size > 256,
          );
          if (unusual.length > 0) {
            findings.push({
              type: "unusual_extra_fields",
              severity: "medium",
              description: `File "${cd.fileName}" has ${unusual.length} unusual extra field(s)`,
              details: {
                fileName: cd.fileName,
                fields: unusual.map((f) => ({
                  headerId: `0x${f.headerId.toString(16).padStart(4, "0")}`,
                  description: f.description,
                  size: f.size,
                })),
              },
            });
          }
        }

        // Check archive comment
        if (zip.archiveComment.length > 0) {
          findings.push({
            type: "archive_comment",
            severity: "low",
            description: `Archive contains a comment (${zip.archiveComment.length} chars)`,
            details: {
              length: zip.archiveComment.length,
              preview: zip.archiveComment.substring(0, 200),
            },
          });
        }

        // Check file comments
        for (const cd of zip.centralDirectory) {
          if (cd.fileComment.length > 0) {
            findings.push({
              type: "file_comment",
              severity: "low",
              description: `File "${cd.fileName}" has a comment (${cd.fileComment.length} chars)`,
              details: {
                fileName: cd.fileName,
                length: cd.fileComment.length,
                preview: cd.fileComment.substring(0, 200),
              },
            });
          }
        }

        const stegoScore =
          findings.filter((f) => f.severity === "high").length * 3 +
          findings.filter((f) => f.severity === "medium").length * 2 +
          findings.filter((f) => f.severity === "low").length;

        const verdict =
          stegoScore >= 5
            ? "likely_stego"
            : stegoScore >= 2
              ? "suspicious"
              : "clean";

        return json({
          file: filePath,
          fileSize: buf.length,
          fileCount: zip.fileCount,
          verdict,
          stegoScore,
          findingsCount: findings.length,
          findings,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. archive_structure
  {
    name: "archive_structure",
    description:
      "ZIP entry structure analysis. Lists all local file headers with their byte offsets, compressed and uncompressed sizes, compression method, CRC-32, flags, and data start offsets. Provides a low-level structural map of the archive.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const entries = zip.localFiles.map((lf: ZipLocalFileHeader) => ({
          fileName: lf.fileName,
          headerOffset: lf.offset,
          headerOffsetHex: "0x" + lf.offset.toString(16).padStart(8, "0"),
          dataOffset: lf.dataOffset,
          dataOffsetHex: "0x" + lf.dataOffset.toString(16).padStart(8, "0"),
          compressedSize: lf.compressedSize,
          uncompressedSize: lf.uncompressedSize,
          compressionMethod: lf.compressionMethod,
          compressionName: COMPRESSION_METHODS[lf.compressionMethod] ?? `Unknown (${lf.compressionMethod})`,
          crc32: "0x" + (lf.crc32 >>> 0).toString(16).padStart(8, "0"),
          flags: "0x" + lf.flags.toString(16).padStart(4, "0"),
          hasDataDescriptor: !!(lf.flags & 0x0008),
          isEncrypted: !!(lf.flags & 0x0001),
          versionNeeded: formatVersion(lf.versionNeeded),
          extraFieldLength: lf.extraField.length,
          lastModified: decodeDosDateTime(lf.lastModDate, lf.lastModTime),
        }));

        const eocd = zip.endOfCentralDir;

        return json({
          file: filePath,
          fileSize: buf.length,
          entryCount: entries.length,
          prependedDataBytes: zip.prependedData,
          appendedDataBytes: zip.appendedData,
          centralDirectory: eocd
            ? {
                offset: eocd.cdOffset,
                offsetHex: "0x" + eocd.cdOffset.toString(16).padStart(8, "0"),
                size: eocd.cdSize,
                totalEntries: eocd.cdTotalEntries,
              }
            : null,
          endOfCentralDir: eocd
            ? {
                offset: eocd.offset,
                offsetHex: "0x" + eocd.offset.toString(16).padStart(8, "0"),
                commentLength: eocd.comment.length,
              }
            : null,
          entries,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. archive_extra_fields
  {
    name: "archive_extra_fields",
    description:
      "ZIP extra field analysis. Parses and describes each extra field in every entry of the archive (both local file headers and central directory entries). Extra fields can hide arbitrary data using custom or unknown header IDs.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const localFields = zip.localFiles.map((lf: ZipLocalFileHeader) => {
          const fields = parseExtraFields(lf.extraField);
          return {
            fileName: lf.fileName,
            source: "local_file_header",
            extraFieldTotalBytes: lf.extraField.length,
            fields: fields.map((f) => ({
              headerId: `0x${f.headerId.toString(16).padStart(4, "0")}`,
              description: f.description,
              dataSize: f.size,
              dataHex: f.data.toString("hex"),
              isUnknown: f.description.startsWith("Unknown"),
            })),
          };
        });

        const centralFields = zip.centralDirectory.map((cd: ZipCentralDirEntry) => ({
          fileName: cd.fileName,
          source: "central_directory",
          extraFieldTotalBytes: cd.extraField.length,
          fields: cd.extraFields.map((f) => ({
            headerId: `0x${f.headerId.toString(16).padStart(4, "0")}`,
            description: f.description,
            dataSize: f.size,
            dataHex: f.data.toString("hex"),
            isUnknown: f.description.startsWith("Unknown"),
          })),
        }));

        const allFields = [...localFields, ...centralFields];
        const unknownFieldCount = allFields.reduce(
          (sum, entry) => sum + entry.fields.filter((f) => f.isUnknown).length,
          0,
        );
        const totalFieldBytes = allFields.reduce(
          (sum, entry) => sum + entry.extraFieldTotalBytes,
          0,
        );

        return json({
          file: filePath,
          fileSize: buf.length,
          totalExtraFieldBytes: totalFieldBytes,
          unknownFieldCount,
          suspiciousNote:
            unknownFieldCount > 0
              ? `${unknownFieldCount} extra field(s) with unknown header IDs detected — potential steganographic hiding spot`
              : "All extra fields have recognized header IDs",
          entries: allFields,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. archive_comment
  {
    name: "archive_comment",
    description:
      "Extract archive-level and per-file comments from a ZIP archive. Comments are a common steganographic hiding spot as they can contain arbitrary data without affecting archive functionality.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const fileComments = zip.centralDirectory
          .filter((cd: ZipCentralDirEntry) => cd.fileComment.length > 0)
          .map((cd: ZipCentralDirEntry) => ({
            fileName: cd.fileName,
            commentLength: cd.fileComment.length,
            comment: cd.fileComment,
            commentHex: Buffer.from(cd.fileComment, "utf-8").toString("hex"),
            entropy: Number(shannonEntropy(Buffer.from(cd.fileComment, "utf-8")).toFixed(4)),
          }));

        const archiveCommentBuf = zip.archiveComment.length > 0
          ? Buffer.from(zip.archiveComment, "utf-8")
          : Buffer.alloc(0);

        const hasAnyComments = zip.archiveComment.length > 0 || fileComments.length > 0;

        return json({
          file: filePath,
          fileSize: buf.length,
          hasComments: hasAnyComments,
          archiveComment: zip.archiveComment.length > 0
            ? {
                length: zip.archiveComment.length,
                comment: zip.archiveComment,
                commentHex: archiveCommentBuf.toString("hex"),
                entropy: Number(shannonEntropy(archiveCommentBuf).toFixed(4)),
              }
            : null,
          fileCommentCount: fileComments.length,
          fileComments,
          analysis: hasAnyComments
            ? "Comments detected — review content for hidden messages or encoded data"
            : "No comments found in archive or file entries",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. archive_slack
  {
    name: "archive_slack",
    description:
      "Slack space analysis for ZIP archives. Identifies and hex-dumps gaps between ZIP local file entries. Slack spaces are unused bytes between entries that can conceal hidden data without altering the archive's functionality.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
      max_dump_size: z
        .number()
        .optional()
        .describe("Max bytes to hex-dump per slack space (default: 256)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const maxDump = (args.max_dump_size as number | undefined) ?? 256;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const slackSpaces = zip.slackSpaces.map((s) => {
          const slackBuf = buf.subarray(s.offset, s.offset + s.size);
          const entropy = shannonEntropy(slackBuf);
          const isAllZeros = slackBuf.every((b: number) => b === 0);
          const printableCount = Array.from(slackBuf).filter(
            (b) => b >= 0x20 && b <= 0x7e,
          ).length;
          const printableRatio = slackBuf.length > 0 ? printableCount / slackBuf.length : 0;

          return {
            afterFile: s.afterFile,
            offset: s.offset,
            offsetHex: "0x" + s.offset.toString(16).padStart(8, "0"),
            size: s.size,
            entropy: Number(entropy.toFixed(4)),
            isAllZeros,
            printableRatio: Number(printableRatio.toFixed(4)),
            hexDump: hexDump(buf, s.offset, Math.min(s.size, maxDump)),
            ascii: printableRatio > 0.8
              ? slackBuf.toString("utf-8").replace(/[^\x20-\x7e]/g, ".")
              : null,
          };
        });

        const totalSlack = slackSpaces.reduce((s, g) => s + g.size, 0);

        return json({
          file: filePath,
          fileSize: buf.length,
          slackSpaceCount: slackSpaces.length,
          totalSlackBytes: totalSlack,
          slackPercentage: Number(
            ((totalSlack / buf.length) * 100).toFixed(4),
          ),
          analysis:
            slackSpaces.length === 0
              ? "No slack spaces found — entries are contiguous"
              : `Found ${slackSpaces.length} slack space(s) totaling ${totalSlack} bytes — potential steganographic hiding spots`,
          slackSpaces,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. archive_polyglot
  {
    name: "archive_polyglot",
    description:
      "Archive polyglot detection. Checks if a ZIP archive has prepended data that could make it valid as another file format (e.g., PDF+ZIP, PNG+ZIP, ELF+ZIP). Polyglot files are used in CTF challenges and to bypass file type filters.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const isZip =
          buf.length >= 4 &&
          buf[0] === 0x50 &&
          buf[1] === 0x4b &&
          (buf[2] === 0x03 || buf[2] === 0x05);

        const prependedSize = zip.prependedData;
        let prependedFormat: string | null = null;
        let prependedDetails: Record<string, unknown> = {};

        if (prependedSize > 0) {
          const prependedBuf = buf.subarray(0, prependedSize);
          prependedFormat = detectFormatFromMagic(prependedBuf);
          const entropy = shannonEntropy(prependedBuf);
          prependedDetails = {
            size: prependedSize,
            detectedFormat: prependedFormat,
            entropy: Number(entropy.toFixed(4)),
            headerHex: prependedBuf.subarray(0, Math.min(32, prependedBuf.length)).toString("hex"),
          };
        }

        // Check if appended data could be another format
        let appendedFormat: string | null = null;
        let appendedDetails: Record<string, unknown> = {};
        if (zip.appendedData > 0 && zip.endOfCentralDir) {
          const appendStart =
            zip.endOfCentralDir.offset +
            22 +
            Buffer.byteLength(zip.endOfCentralDir.comment, "utf-8");
          const appendedBuf = buf.subarray(appendStart);
          appendedFormat = detectFormatFromMagic(appendedBuf);
          const entropy = shannonEntropy(appendedBuf);
          appendedDetails = {
            size: zip.appendedData,
            detectedFormat: appendedFormat,
            entropy: Number(entropy.toFixed(4)),
            headerHex: appendedBuf.subarray(0, Math.min(32, appendedBuf.length)).toString("hex"),
          };
        }

        // Also check if the file starts as a non-ZIP format
        const startFormat = detectFormatFromMagic(buf);
        const isPolyglot =
          (prependedFormat !== null) ||
          (appendedFormat !== null) ||
          (startFormat !== null && !isZip);

        const formats: string[] = [];
        if (isZip) formats.push("ZIP");
        if (prependedFormat) formats.push(prependedFormat);
        if (appendedFormat) formats.push(appendedFormat);
        if (startFormat && startFormat !== "ZIP" && !formats.includes(startFormat)) {
          formats.push(startFormat);
        }

        return json({
          file: filePath,
          fileSize: buf.length,
          isPolyglot,
          detectedFormats: formats,
          startsAsZip: isZip,
          prependedData:
            prependedSize > 0
              ? prependedDetails
              : null,
          appendedData:
            zip.appendedData > 0
              ? appendedDetails
              : null,
          analysis: isPolyglot
            ? `Polyglot detected: file is valid as ${formats.join(" + ")}`
            : "No polyglot structure detected — file appears to be a standard ZIP archive",
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. archive_metadata
  {
    name: "archive_metadata",
    description:
      "Archive metadata summary. Reports file count, total compressed and uncompressed sizes, overall compression ratio, per-entry compression ratios, timestamps, version info, and encryption flags. Provides a high-level overview of the archive.",
    schema: {
      file_path: z.string().describe("Path to ZIP archive"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const zip = parseZip(buf);

        const overallRatio =
          zip.totalUncompressedSize > 0
            ? zip.totalCompressedSize / zip.totalUncompressedSize
            : 1;

        const entries = zip.centralDirectory.map((cd: ZipCentralDirEntry) => {
          const ratio =
            cd.uncompressedSize > 0
              ? cd.compressedSize / cd.uncompressedSize
              : 1;
          return {
            fileName: cd.fileName,
            compressedSize: cd.compressedSize,
            uncompressedSize: cd.uncompressedSize,
            compressionRatio: Number(ratio.toFixed(4)),
            compressionMethod: COMPRESSION_METHODS[cd.compressionMethod] ?? `Unknown (${cd.compressionMethod})`,
            lastModified: decodeDosDateTime(cd.lastModDate, cd.lastModTime),
            versionMadeBy: formatVersion(cd.versionMadeBy & 0xff),
            hostOS: (cd.versionMadeBy >> 8) === 0
              ? "MS-DOS/FAT"
              : (cd.versionMadeBy >> 8) === 3
                ? "Unix"
                : `OS code ${cd.versionMadeBy >> 8}`,
            versionNeeded: formatVersion(cd.versionNeeded),
            isEncrypted: !!(cd.flags & 0x0001),
            isDirectory: cd.fileName.endsWith("/"),
            crc32: "0x" + (cd.crc32 >>> 0).toString(16).padStart(8, "0"),
            hasComment: cd.fileComment.length > 0,
            extraFieldBytes: cd.extraField.length,
          };
        });

        // Collect unique timestamps
        const timestamps = entries
          .map((e: { lastModified: string }) => e.lastModified)
          .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
          .sort();

        // Collect compression methods used
        const methods = [
          ...new Set(
            zip.localFiles.map(
              (lf: ZipLocalFileHeader) =>
                COMPRESSION_METHODS[lf.compressionMethod] ?? `Unknown (${lf.compressionMethod})`,
            ),
          ),
        ];

        const encryptedCount = entries.filter((e: { isEncrypted: boolean }) => e.isEncrypted).length;
        const dirCount = entries.filter((e: { isDirectory: boolean }) => e.isDirectory).length;

        return json({
          file: filePath,
          fileSize: buf.length,
          fileCount: zip.fileCount,
          directoryCount: dirCount,
          encryptedEntries: encryptedCount,
          totalCompressedSize: zip.totalCompressedSize,
          totalUncompressedSize: zip.totalUncompressedSize,
          overallCompressionRatio: Number(overallRatio.toFixed(4)),
          compressionMethodsUsed: methods,
          uniqueTimestamps: timestamps,
          archiveComment: zip.archiveComment || null,
          prependedDataBytes: zip.prependedData,
          appendedDataBytes: zip.appendedData,
          slackSpaceCount: zip.slackSpaces.length,
          entries,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
