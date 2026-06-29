import { z } from "zod";
import type { ToolDef, ToolResult } from "../types/index.js";
import { text, json } from "../types/index.js";
import { shannonEntropyStr } from "../utils/stats.js";
import {
  ZWC_STEGO,
  INVISIBLE_CHARS,
  INVISIBLE_CODEPOINT_SET,
  INVISIBLE_LOOKUP,
  CATEGORY_DESCRIPTIONS,
} from "../data/unicode-invisible.js";

// ─── Homoglyph Data ───

/** Common homoglyph pairs: [non-ASCII codepoint, ASCII equivalent, script name] */
const HOMOGLYPH_MAP: Array<[number, string, string]> = [
  // Cyrillic → Latin
  [0x0430, "a", "Cyrillic"],  // а
  [0x0435, "e", "Cyrillic"],  // е
  [0x043e, "o", "Cyrillic"],  // о
  [0x0440, "p", "Cyrillic"],  // р
  [0x0441, "c", "Cyrillic"],  // с
  [0x0443, "y", "Cyrillic"],  // у
  [0x0456, "i", "Cyrillic"],  // і
  [0x0458, "j", "Cyrillic"],  // ј
  [0x04bb, "h", "Cyrillic"],  // һ
  [0x0455, "s", "Cyrillic"],  // ѕ
  [0x0445, "x", "Cyrillic"],  // х
  [0x0410, "A", "Cyrillic"],  // А
  [0x0412, "B", "Cyrillic"],  // В
  [0x0415, "E", "Cyrillic"],  // Е
  [0x041a, "K", "Cyrillic"],  // К
  [0x041c, "M", "Cyrillic"],  // М
  [0x041d, "H", "Cyrillic"],  // Н
  [0x041e, "O", "Cyrillic"],  // О
  [0x0420, "P", "Cyrillic"],  // Р
  [0x0421, "C", "Cyrillic"],  // С
  [0x0422, "T", "Cyrillic"],  // Т
  [0x0425, "X", "Cyrillic"],  // Х

  // Greek → Latin
  [0x03bf, "o", "Greek"],     // ο
  [0x03b1, "a", "Greek"],     // α (close to a in some fonts)
  [0x03b5, "e", "Greek"],     // ε
  [0x03b9, "i", "Greek"],     // ι
  [0x03ba, "k", "Greek"],     // κ
  [0x03bd, "v", "Greek"],     // ν
  [0x0391, "A", "Greek"],     // Α
  [0x0392, "B", "Greek"],     // Β
  [0x0395, "E", "Greek"],     // Ε
  [0x0396, "Z", "Greek"],     // Ζ
  [0x0397, "H", "Greek"],     // Η
  [0x0399, "I", "Greek"],     // Ι
  [0x039a, "K", "Greek"],     // Κ
  [0x039c, "M", "Greek"],     // Μ
  [0x039d, "N", "Greek"],     // Ν
  [0x039f, "O", "Greek"],     // Ο
  [0x03a1, "P", "Greek"],     // Ρ
  [0x03a4, "T", "Greek"],     // Τ
  [0x03a7, "X", "Greek"],     // Χ
  [0x03a5, "Y", "Greek"],     // Υ

  // Fullwidth Latin
  [0xff41, "a", "Fullwidth"],
  [0xff42, "b", "Fullwidth"],
  [0xff43, "c", "Fullwidth"],
  [0xff4f, "o", "Fullwidth"],

  // Other confusables
  [0x0261, "g", "Latin Ext"],     // ɡ
  [0x026a, "I", "Latin Ext"],     // ɪ (small capital I)
  [0x1d00, "A", "Latin Ext"],     // ᴀ (small capital A)
];

/** Build fast lookup: codepoint → homoglyph info */
const HOMOGLYPH_LOOKUP = new Map<number, { ascii: string; script: string }>();
for (const [cp, ascii, script] of HOMOGLYPH_MAP) {
  HOMOGLYPH_LOOKUP.set(cp, { ascii, script });
}

// ─── Helpers ───

/** Get Unicode script/block category for a codepoint */
function getCharCategory(cp: number): string {
  if (cp <= 0x007f) return "ASCII";
  if (cp <= 0x00ff) return "Latin-1 Supplement";
  if (cp <= 0x024f) return "Latin Extended";
  if (cp >= 0x0370 && cp <= 0x03ff) return "Greek";
  if (cp >= 0x0400 && cp <= 0x04ff) return "Cyrillic";
  if (cp >= 0x0500 && cp <= 0x052f) return "Cyrillic Supplement";
  if (cp >= 0x0530 && cp <= 0x058f) return "Armenian";
  if (cp >= 0x0590 && cp <= 0x05ff) return "Hebrew";
  if (cp >= 0x0600 && cp <= 0x06ff) return "Arabic";
  if (cp >= 0x0900 && cp <= 0x097f) return "Devanagari";
  if (cp >= 0x2000 && cp <= 0x206f) return "General Punctuation";
  if (cp >= 0x2070 && cp <= 0x209f) return "Superscripts/Subscripts";
  if (cp >= 0x20a0 && cp <= 0x20cf) return "Currency Symbols";
  if (cp >= 0x2100 && cp <= 0x214f) return "Letterlike Symbols";
  if (cp >= 0x2150 && cp <= 0x218f) return "Number Forms";
  if (cp >= 0x2190 && cp <= 0x21ff) return "Arrows";
  if (cp >= 0x2200 && cp <= 0x22ff) return "Mathematical Operators";
  if (cp >= 0x2e80 && cp <= 0x9fff) return "CJK";
  if (cp >= 0xa000 && cp <= 0xa4cf) return "Yi";
  if (cp >= 0xac00 && cp <= 0xd7af) return "Hangul";
  if (cp >= 0xe000 && cp <= 0xf8ff) return "Private Use Area";
  if (cp >= 0xf900 && cp <= 0xfaff) return "CJK Compatibility";
  if (cp >= 0xfb00 && cp <= 0xfb4f) return "Alphabetic Presentation Forms";
  if (cp >= 0xfe00 && cp <= 0xfe0f) return "Variation Selectors";
  if (cp >= 0xfe70 && cp <= 0xfeff) return "Arabic Presentation Forms";
  if (cp >= 0xff00 && cp <= 0xffef) return "Halfwidth/Fullwidth Forms";
  if (cp >= 0x10000 && cp <= 0x1007f) return "Linear B Syllabary";
  if (cp >= 0x1f000 && cp <= 0x1f9ff) return "Emoji/Symbols";
  if (cp >= 0xe0000 && cp <= 0xe007f) return "Tags";
  return "Other";
}

// ─── Tool Definitions ───

export const textTools: ToolDef[] = [
  // 1. text_detect
  {
    name: "text_detect",
    description: "Auto-detect text steganography. Checks for zero-width characters, whitespace encoding, invisible Unicode, homoglyphs, and unusual patterns.",
    schema: {
      text: z.string().describe("Text to analyze"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const findings: string[] = [];
        let suspicionScore = 0;

        findings.push(`=== Text Steganography Detection ===`);
        findings.push(`Input length: ${input.length} characters`);
        findings.push("");

        // --- Zero-width characters ---
        findings.push(`--- Zero-Width Characters ---`);
        const zwcCodes = new Set(ZWC_STEGO.map((c) => c.codepoint));
        let zwcCount = 0;
        const zwcFound = new Map<number, number>();
        for (const ch of input) {
          const cp = ch.codePointAt(0)!;
          if (zwcCodes.has(cp)) {
            zwcCount++;
            zwcFound.set(cp, (zwcFound.get(cp) ?? 0) + 1);
          }
        }
        if (zwcCount > 0) {
          findings.push(`[!] Found ${zwcCount} zero-width character(s)`);
          for (const [cp, count] of zwcFound) {
            const info = ZWC_STEGO.find((c) => c.codepoint === cp);
            findings.push(`  U+${cp.toString(16).toUpperCase().padStart(4, "0")} ${info?.name ?? "unknown"}: ${count}x`);
          }
          suspicionScore += Math.min(5, Math.ceil(zwcCount / 2));
        } else {
          findings.push(`None found`);
        }
        findings.push("");

        // --- Whitespace encoding ---
        findings.push(`--- Whitespace Encoding ---`);
        const lines = input.split("\n");
        let trailingWsLines = 0;
        let trailingPattern = false;
        for (const line of lines) {
          const match = line.match(/[\t ]+$/);
          if (match) {
            trailingWsLines++;
            // Check if trailing whitespace has mixed spaces/tabs (encoding pattern)
            if (match[0].includes(" ") && match[0].includes("\t")) {
              trailingPattern = true;
            }
          }
        }
        if (trailingWsLines > 0) {
          findings.push(`[!] ${trailingWsLines}/${lines.length} lines have trailing whitespace`);
          if (trailingPattern) {
            findings.push(`[!] Mixed space/tab trailing patterns detected — likely whitespace encoding`);
            suspicionScore += 3;
          } else {
            suspicionScore += 1;
          }
        } else {
          findings.push(`No trailing whitespace patterns found`);
        }
        findings.push("");

        // --- Invisible Unicode ---
        findings.push(`--- Invisible Unicode ---`);
        let invisibleCount = 0;
        const invisibleCategories = new Map<string, number>();
        for (const ch of input) {
          const cp = ch.codePointAt(0)!;
          if (INVISIBLE_CODEPOINT_SET.has(cp) && !zwcCodes.has(cp)) {
            invisibleCount++;
            const info = INVISIBLE_LOOKUP.get(cp);
            const cat = info?.category ?? "unknown";
            invisibleCategories.set(cat, (invisibleCategories.get(cat) ?? 0) + 1);
          }
        }
        if (invisibleCount > 0) {
          findings.push(`[!] Found ${invisibleCount} invisible Unicode character(s) (excluding ZWC)`);
          for (const [cat, count] of invisibleCategories) {
            findings.push(`  ${cat}: ${count}x`);
          }
          suspicionScore += Math.min(3, Math.ceil(invisibleCount / 3));
        } else {
          findings.push(`No additional invisible characters found`);
        }
        findings.push("");

        // --- Homoglyphs ---
        findings.push(`--- Homoglyph Detection ---`);
        let homoglyphCount = 0;
        const homoglyphScripts = new Map<string, number>();
        for (const ch of input) {
          const cp = ch.codePointAt(0)!;
          const hg = HOMOGLYPH_LOOKUP.get(cp);
          if (hg) {
            homoglyphCount++;
            homoglyphScripts.set(hg.script, (homoglyphScripts.get(hg.script) ?? 0) + 1);
          }
        }
        if (homoglyphCount > 0) {
          findings.push(`[!] Found ${homoglyphCount} potential homoglyph(s)`);
          for (const [script, count] of homoglyphScripts) {
            findings.push(`  ${script}: ${count} character(s) that look like ASCII`);
          }
          suspicionScore += Math.min(4, homoglyphCount);
        } else {
          findings.push(`No homoglyphs detected`);
        }
        findings.push("");

        // --- Unicode entropy / script mixing ---
        findings.push(`--- Script Analysis ---`);
        const scriptCounts = new Map<string, number>();
        for (const ch of input) {
          const cp = ch.codePointAt(0)!;
          if (cp > 0x20) {
            const cat = getCharCategory(cp);
            scriptCounts.set(cat, (scriptCounts.get(cat) ?? 0) + 1);
          }
        }
        const scripts = [...scriptCounts.entries()].sort((a, b) => b[1] - a[1]);
        if (scripts.length > 1) {
          findings.push(`Multiple scripts detected:`);
          for (const [script, count] of scripts) {
            findings.push(`  ${script}: ${count} characters`);
          }
          // If predominantly one script with small amounts of another, suspicious
          if (scripts.length >= 2 && scripts[1][1] < scripts[0][1] * 0.1 && scripts[1][1] > 0) {
            findings.push(`[!] Minor script mixing detected — possible homoglyph substitution`);
            suspicionScore += 1;
          }
        } else if (scripts.length === 1) {
          findings.push(`Single script: ${scripts[0][0]}`);
        }
        findings.push("");

        // --- Overall verdict ---
        findings.push(`=== Overall Verdict ===`);
        findings.push(`Suspicion score: ${suspicionScore}/10+`);
        if (suspicionScore >= 5) {
          findings.push(`VERDICT: LIKELY TEXT STEGANOGRAPHY DETECTED`);
        } else if (suspicionScore >= 2) {
          findings.push(`VERDICT: SUSPICIOUS — further analysis recommended`);
        } else {
          findings.push(`VERDICT: No obvious steganography indicators found`);
        }

        return text(findings.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. text_zwc_detect
  {
    name: "text_zwc_detect",
    description: "Detect zero-width characters (ZWSP, ZWNJ, ZWJ, BOM) in text. Reports positions, counts, and potential encoded message length.",
    schema: {
      text: z.string().describe("Text to analyze"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];
        const zwcCodes = new Set(ZWC_STEGO.map((c) => c.codepoint));

        results.push(`=== Zero-Width Character Detection ===`);
        results.push(`Input length: ${input.length} characters`);
        results.push("");

        // Scan for ZWC chars
        const positions: { pos: number; codepoint: number; name: string; context: string }[] = [];
        const charArray = [...input]; // Proper Unicode iteration

        for (let i = 0; i < charArray.length; i++) {
          const cp = charArray[i].codePointAt(0)!;
          if (zwcCodes.has(cp)) {
            const info = ZWC_STEGO.find((c) => c.codepoint === cp);
            // Get surrounding visible context
            const before = charArray.slice(Math.max(0, i - 3), i).filter((c) => !zwcCodes.has(c.codePointAt(0)!)).join("");
            const after = charArray.slice(i + 1, Math.min(charArray.length, i + 4)).filter((c) => !zwcCodes.has(c.codePointAt(0)!)).join("");
            positions.push({
              pos: i,
              codepoint: cp,
              name: info?.name ?? "unknown",
              context: `"...${before}[HERE]${after}..."`,
            });
          }
        }

        if (positions.length === 0) {
          results.push(`No zero-width characters found.`);
          return text(results.join("\n"));
        }

        // Summary by type
        results.push(`=== Summary ===`);
        const byCp = new Map<number, number>();
        for (const p of positions) {
          byCp.set(p.codepoint, (byCp.get(p.codepoint) ?? 0) + 1);
        }
        for (const [cp, count] of byCp) {
          const info = ZWC_STEGO.find((c) => c.codepoint === cp);
          results.push(`  U+${cp.toString(16).toUpperCase().padStart(4, "0")} ${info?.name ?? "unknown"}: ${count} occurrences`);
        }
        results.push(`Total ZWC characters: ${positions.length}`);
        results.push("");

        // Potential message size estimates
        // 2-char encoding (ZWSP/ZWNJ as binary): 1 bit per ZWC
        // 4-char encoding (all 4 ZWCs as base-4): 2 bits per ZWC
        const uniqueTypes = byCp.size;
        if (uniqueTypes <= 2) {
          const msgBits = positions.length;
          results.push(`Potential message size (binary encoding): ${msgBits} bits = ${Math.floor(msgBits / 8)} bytes`);
        }
        if (uniqueTypes <= 4) {
          const msgBits = positions.length * 2;
          results.push(`Potential message size (base-4 encoding): ${msgBits} bits = ${Math.floor(msgBits / 8)} bytes`);
        }
        results.push("");

        // Detailed positions
        results.push(`=== Positions (showing first 50) ===`);
        for (const p of positions.slice(0, 50)) {
          results.push(`  [${p.pos}] U+${p.codepoint.toString(16).toUpperCase().padStart(4, "0")} ${p.name} ${p.context}`);
        }
        if (positions.length > 50) {
          results.push(`  ... and ${positions.length - 50} more`);
        }

        // Show clusters (groups of consecutive ZWCs)
        const clusters: { start: number; length: number }[] = [];
        let clusterStart = -1;
        let clusterLen = 0;
        for (let i = 0; i < positions.length; i++) {
          if (i === 0 || positions[i].pos === positions[i - 1].pos + 1) {
            if (clusterStart === -1) clusterStart = positions[i].pos;
            clusterLen++;
          } else {
            if (clusterLen >= 2) clusters.push({ start: clusterStart, length: clusterLen });
            clusterStart = positions[i].pos;
            clusterLen = 1;
          }
        }
        if (clusterLen >= 2) clusters.push({ start: clusterStart, length: clusterLen });

        if (clusters.length > 0) {
          results.push("");
          results.push(`=== ZWC Clusters (consecutive groups) ===`);
          for (const cl of clusters.slice(0, 20)) {
            results.push(`  Position ${cl.start}: ${cl.length} consecutive ZWCs`);
          }
          if (clusters.length > 20) results.push(`  ... and ${clusters.length - 20} more clusters`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. text_zwc_extract
  {
    name: "text_zwc_extract",
    description: "Decode a zero-width character encoded message. Extracts ZWC chars and decodes binary: ZWSP=0, ZWNJ=1 (attempts both polarities).",
    schema: {
      text: z.string().describe("Text containing ZWC-encoded message"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];

        results.push(`=== ZWC Message Extraction ===`);
        results.push("");

        // Extract only ZWC characters in order
        const ZWSP = 0x200b;
        const ZWNJ = 0x200c;
        const ZWJ = 0x200d;
        const BOM = 0xfeff;
        const zwcCodes = new Set([ZWSP, ZWNJ, ZWJ, BOM]);

        const zwcSequence: number[] = [];
        for (const ch of input) {
          const cp = ch.codePointAt(0)!;
          if (zwcCodes.has(cp)) {
            zwcSequence.push(cp);
          }
        }

        if (zwcSequence.length === 0) {
          results.push(`No zero-width characters found in input.`);
          return text(results.join("\n"));
        }

        results.push(`Extracted ${zwcSequence.length} ZWC characters`);
        const uniqueTypes = new Set(zwcSequence);
        results.push(`Unique ZWC types: ${uniqueTypes.size}`);
        results.push("");

        // Attempt binary decoding: ZWSP=0, ZWNJ=1 (standard)
        results.push(`=== Binary Decode: ZWSP=0, ZWNJ=1 ===`);
        {
          const bits: number[] = [];
          for (const cp of zwcSequence) {
            if (cp === ZWSP) bits.push(0);
            else if (cp === ZWNJ) bits.push(1);
            // Skip other ZWC types for binary mode
          }
          if (bits.length >= 8) {
            const bytes: number[] = [];
            for (let i = 0; i + 7 < bits.length; i += 8) {
              let byte = 0;
              for (let b = 0; b < 8; b++) {
                byte = (byte << 1) | bits[i + b];
              }
              bytes.push(byte);
            }
            const buf = Buffer.from(bytes);
            const decoded = buf.toString("utf-8");
            const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
            results.push(`Bits: ${bits.length}, Bytes: ${bytes.length}`);
            results.push(`Decoded: ${decoded.substring(0, 500)}`);
            results.push(`Printable ratio: ${((printable / decoded.length) * 100).toFixed(1)}%`);
          } else {
            results.push(`Only ${bits.length} binary bits — not enough for a full byte`);
          }
        }
        results.push("");

        // Attempt inverted binary: ZWSP=1, ZWNJ=0
        results.push(`=== Binary Decode: ZWSP=1, ZWNJ=0 (inverted) ===`);
        {
          const bits: number[] = [];
          for (const cp of zwcSequence) {
            if (cp === ZWSP) bits.push(1);
            else if (cp === ZWNJ) bits.push(0);
          }
          if (bits.length >= 8) {
            const bytes: number[] = [];
            for (let i = 0; i + 7 < bits.length; i += 8) {
              let byte = 0;
              for (let b = 0; b < 8; b++) {
                byte = (byte << 1) | bits[i + b];
              }
              bytes.push(byte);
            }
            const buf = Buffer.from(bytes);
            const decoded = buf.toString("utf-8");
            const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
            results.push(`Decoded: ${decoded.substring(0, 500)}`);
            results.push(`Printable ratio: ${((printable / decoded.length) * 100).toFixed(1)}%`);
          } else {
            results.push(`Not enough bits for decoding`);
          }
        }
        results.push("");

        // Attempt base-4 decoding if 3-4 types present (ZWSP=00, ZWNJ=01, ZWJ=10, BOM=11)
        if (uniqueTypes.size >= 3) {
          results.push(`=== Base-4 Decode: ZWSP=00, ZWNJ=01, ZWJ=10, BOM=11 ===`);
          const bits: number[] = [];
          for (const cp of zwcSequence) {
            if (cp === ZWSP) { bits.push(0, 0); }
            else if (cp === ZWNJ) { bits.push(0, 1); }
            else if (cp === ZWJ) { bits.push(1, 0); }
            else if (cp === BOM) { bits.push(1, 1); }
          }
          if (bits.length >= 8) {
            const bytes: number[] = [];
            for (let i = 0; i + 7 < bits.length; i += 8) {
              let byte = 0;
              for (let b = 0; b < 8; b++) {
                byte = (byte << 1) | bits[i + b];
              }
              bytes.push(byte);
            }
            const buf = Buffer.from(bytes);
            const decoded = buf.toString("utf-8");
            const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
            results.push(`Bits: ${bits.length}, Bytes: ${bytes.length}`);
            results.push(`Decoded: ${decoded.substring(0, 500)}`);
            results.push(`Printable ratio: ${((printable / decoded.length) * 100).toFixed(1)}%`);
          }
          results.push("");
        }

        // Show raw ZWC sequence (first 100)
        results.push(`=== Raw ZWC Sequence (first 100) ===`);
        const seqStr = zwcSequence.slice(0, 100).map((cp) => {
          if (cp === ZWSP) return "S";
          if (cp === ZWNJ) return "N";
          if (cp === ZWJ) return "J";
          if (cp === BOM) return "B";
          return "?";
        }).join("");
        results.push(seqStr);
        if (zwcSequence.length > 100) results.push(`... (${zwcSequence.length - 100} more)`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. text_zwc_embed
  {
    name: "text_zwc_embed",
    description: "Embed a secret message into cover text using zero-width characters. Encodes the message to binary and maps bits to ZWSP(0)/ZWNJ(1), inserting them between characters of the cover text.",
    schema: {
      text: z.string().describe("Cover text"),
      message: z.string().describe("Secret message to embed"),
    },
    execute: async (args) => {
      try {
        const coverText = args.text as string;
        const secretMessage = args.message as string;
        const results: string[] = [];

        results.push(`=== ZWC Embedding ===`);
        results.push(`Cover text length: ${coverText.length} characters`);
        results.push(`Secret message: "${secretMessage}" (${secretMessage.length} chars)`);
        results.push("");

        // Encode message to binary via UTF-8
        const msgBuf = Buffer.from(secretMessage, "utf-8");
        const bits: number[] = [];
        for (const byte of msgBuf) {
          for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
          }
        }

        results.push(`Message bytes: ${msgBuf.length}`);
        results.push(`Bits to embed: ${bits.length}`);

        // Map bits to ZWC: 0 = ZWSP (U+200B), 1 = ZWNJ (U+200C)
        const ZWSP = "\u200B";
        const ZWNJ = "\u200C";
        const zwcChars = bits.map((b) => (b === 0 ? ZWSP : ZWNJ));

        // Check capacity: we insert between characters, so max capacity = coverText.length - 1 positions
        // We can also cluster multiple ZWC chars at each position
        const coverChars = [...coverText];
        const positions = coverChars.length - 1;

        if (positions <= 0) {
          return text(`Error: Cover text must be at least 2 characters long`);
        }

        // Strategy: distribute ZWC chars evenly between cover text characters
        // Insert all ZWC chars between the first and second character (simplest approach)
        // Or spread them: put ceil(bits/positions) chars at each gap
        let stegoText: string;

        if (bits.length <= positions) {
          // Spread one ZWC per gap (simple distribution)
          const chars: string[] = [];
          let bitIdx = 0;
          for (let i = 0; i < coverChars.length; i++) {
            chars.push(coverChars[i]);
            if (i < coverChars.length - 1 && bitIdx < zwcChars.length) {
              chars.push(zwcChars[bitIdx]);
              bitIdx++;
            }
          }
          stegoText = chars.join("");
        } else {
          // Not enough gaps — cluster multiple ZWC chars per gap
          const charsPerGap = Math.ceil(bits.length / positions);
          const chars: string[] = [];
          let bitIdx = 0;
          for (let i = 0; i < coverChars.length; i++) {
            chars.push(coverChars[i]);
            if (i < coverChars.length - 1) {
              for (let j = 0; j < charsPerGap && bitIdx < zwcChars.length; j++) {
                chars.push(zwcChars[bitIdx]);
                bitIdx++;
              }
            }
          }
          stegoText = chars.join("");
        }

        results.push(`Stego text length: ${stegoText.length} characters (visible: ${coverChars.length})`);
        results.push(`ZWC characters inserted: ${zwcChars.length}`);
        results.push("");
        results.push(`=== Output (stego text) ===`);
        results.push(stegoText);
        results.push("");
        results.push(`NOTE: The text above contains invisible zero-width characters.`);
        results.push(`Use text_zwc_extract to recover the hidden message.`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. text_whitespace_detect
  {
    name: "text_whitespace_detect",
    description: "Detect whitespace encoding in text. Checks each line for trailing whitespace patterns where space=0 and tab=1 might encode binary data.",
    schema: {
      text: z.string().describe("Text to analyze"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];
        const lines = input.split("\n");

        results.push(`=== Whitespace Encoding Detection ===`);
        results.push(`Total lines: ${lines.length}`);
        results.push("");

        const lineAnalysis: {
          lineNum: number;
          trailing: string;
          spaces: number;
          tabs: number;
          pattern: string;
        }[] = [];

        let linesWithTrailing = 0;

        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/([\t ]+)$/);
          if (match) {
            linesWithTrailing++;
            const trailing = match[1];
            let spaces = 0, tabs = 0;
            const pattern: string[] = [];
            for (const ch of trailing) {
              if (ch === " ") { spaces++; pattern.push("0"); }
              else if (ch === "\t") { tabs++; pattern.push("1"); }
            }
            lineAnalysis.push({
              lineNum: i + 1,
              trailing,
              spaces,
              tabs,
              pattern: pattern.join(""),
            });
          }
        }

        results.push(`Lines with trailing whitespace: ${linesWithTrailing}/${lines.length}`);
        results.push("");

        if (linesWithTrailing === 0) {
          results.push(`No trailing whitespace found — no whitespace encoding detected.`);
          return text(results.join("\n"));
        }

        // Analyze patterns
        const hasMixed = lineAnalysis.some((la) => la.spaces > 0 && la.tabs > 0);
        const allSpacesOnly = lineAnalysis.every((la) => la.tabs === 0);
        const allTabsOnly = lineAnalysis.every((la) => la.spaces === 0);

        results.push(`=== Pattern Analysis ===`);
        if (hasMixed) {
          results.push(`[!] Mixed space/tab trailing patterns detected — LIKELY whitespace encoding`);
        } else if (allSpacesOnly) {
          results.push(`All trailing whitespace is spaces only — could encode by count or be incidental`);
        } else if (allTabsOnly) {
          results.push(`All trailing whitespace is tabs only — could encode by count or be incidental`);
        }
        results.push("");

        // Show per-line details
        results.push(`=== Line Details (showing first 50 with trailing WS) ===`);
        for (const la of lineAnalysis.slice(0, 50)) {
          const linePreview = lines[la.lineNum - 1].trimEnd().substring(0, 60);
          results.push(`  Line ${la.lineNum}: "${linePreview}" + trailing [${la.pattern}] (${la.spaces}sp, ${la.tabs}tab)`);
        }
        if (lineAnalysis.length > 50) {
          results.push(`  ... and ${lineAnalysis.length - 50} more lines`);
        }
        results.push("");

        // Try to decode the binary pattern
        if (hasMixed || linesWithTrailing >= 8) {
          results.push(`=== Decode Attempt (space=0, tab=1 per line) ===`);
          // Method 1: Each line's trailing ws is one or more bits
          const allBits = lineAnalysis.map((la) => la.pattern).join("");
          const byteCount = Math.floor(allBits.length / 8);
          if (byteCount > 0) {
            const bytes: number[] = [];
            for (let i = 0; i < byteCount; i++) {
              let byte = 0;
              for (let b = 0; b < 8; b++) {
                byte = (byte << 1) | (allBits[i * 8 + b] === "1" ? 1 : 0);
              }
              bytes.push(byte);
            }
            const decoded = Buffer.from(bytes).toString("utf-8");
            const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
            results.push(`Total bits: ${allBits.length}, Bytes: ${byteCount}`);
            results.push(`Decoded: ${decoded.substring(0, 200)}`);
            results.push(`Printable ratio: ${((printable / decoded.length) * 100).toFixed(1)}%`);
          }
          results.push("");

          // Method 2: Each line contributes exactly one bit (space=0, tab=1)
          if (lineAnalysis.length >= 8) {
            results.push(`=== Decode Attempt (1 bit per line: presence of tab=1, space-only=0) ===`);
            const lineBits = lineAnalysis.map((la) => (la.tabs > 0 ? "1" : "0")).join("");
            const lineByteCount = Math.floor(lineBits.length / 8);
            if (lineByteCount > 0) {
              const bytes: number[] = [];
              for (let i = 0; i < lineByteCount; i++) {
                let byte = 0;
                for (let b = 0; b < 8; b++) {
                  byte = (byte << 1) | (lineBits[i * 8 + b] === "1" ? 1 : 0);
                }
                bytes.push(byte);
              }
              const decoded = Buffer.from(bytes).toString("utf-8");
              const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
              results.push(`Bits: ${lineBits.length}, Bytes: ${lineByteCount}`);
              results.push(`Decoded: ${decoded.substring(0, 200)}`);
              results.push(`Printable ratio: ${((printable / decoded.length) * 100).toFixed(1)}%`);
            }
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. text_whitespace_extract
  {
    name: "text_whitespace_extract",
    description: "Extract a whitespace-encoded message from text. Reads trailing whitespace from each line and decodes space=0/tab=1 binary encoding.",
    schema: {
      text: z.string().describe("Text with whitespace encoding"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];
        const lines = input.split("\n");

        results.push(`=== Whitespace Message Extraction ===`);
        results.push(`Total lines: ${lines.length}`);
        results.push("");

        // Extract trailing whitespace from each line
        const trailingBits: string[] = [];
        for (const line of lines) {
          const match = line.match(/([\t ]+)$/);
          if (match) {
            for (const ch of match[1]) {
              trailingBits.push(ch === "\t" ? "1" : "0");
            }
          }
        }

        if (trailingBits.length === 0) {
          results.push(`No trailing whitespace found — nothing to decode.`);
          return text(results.join("\n"));
        }

        results.push(`Total trailing whitespace bits: ${trailingBits.length}`);
        results.push("");

        // Decode: space=0, tab=1
        results.push(`=== Decode: space=0, tab=1 ===`);
        {
          const bitStr = trailingBits.join("");
          const byteCount = Math.floor(bitStr.length / 8);
          const bytes: number[] = [];
          for (let i = 0; i < byteCount; i++) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
              byte = (byte << 1) | (bitStr[i * 8 + b] === "1" ? 1 : 0);
            }
            bytes.push(byte);
          }
          const buf = Buffer.from(bytes);
          const decoded = buf.toString("utf-8");
          const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
          results.push(`Bytes: ${byteCount}`);
          results.push(`Decoded: ${decoded.substring(0, 500)}`);
          results.push(`Printable ratio: ${((printable / Math.max(1, decoded.length)) * 100).toFixed(1)}%`);

          // Check for null terminator
          const nullIdx = bytes.indexOf(0);
          if (nullIdx > 0 && nullIdx < bytes.length - 1) {
            const msgBuf = Buffer.from(bytes.slice(0, nullIdx));
            results.push(`Null byte at offset ${nullIdx} — message before null: "${msgBuf.toString("utf-8")}"`);
          }
        }
        results.push("");

        // Decode inverted: space=1, tab=0
        results.push(`=== Decode: space=1, tab=0 (inverted) ===`);
        {
          const bitStr = trailingBits.map((b) => (b === "0" ? "1" : "0")).join("");
          const byteCount = Math.floor(bitStr.length / 8);
          const bytes: number[] = [];
          for (let i = 0; i < byteCount; i++) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
              byte = (byte << 1) | (bitStr[i * 8 + b] === "1" ? 1 : 0);
            }
            bytes.push(byte);
          }
          const buf = Buffer.from(bytes);
          const decoded = buf.toString("utf-8");
          const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
          results.push(`Decoded: ${decoded.substring(0, 500)}`);
          results.push(`Printable ratio: ${((printable / Math.max(1, decoded.length)) * 100).toFixed(1)}%`);
        }
        results.push("");

        // Show raw bit pattern
        results.push(`=== Raw Bit Pattern (first 200 bits) ===`);
        results.push(trailingBits.slice(0, 200).join(""));
        if (trailingBits.length > 200) results.push(`... (${trailingBits.length - 200} more bits)`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. text_invisible_scan
  {
    name: "text_invisible_scan",
    description: "Scan text for ALL invisible Unicode characters. Checks every character against the full invisible character database and reports positions, names, and categories.",
    schema: {
      text: z.string().describe("Text to scan"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];

        results.push(`=== Invisible Unicode Scan ===`);
        results.push(`Input length: ${input.length} characters`);
        results.push("");

        // Scan every character
        const found: { pos: number; codepoint: number; info: typeof INVISIBLE_CHARS[number] | undefined }[] = [];
        const charArray = [...input];

        for (let i = 0; i < charArray.length; i++) {
          const cp = charArray[i].codePointAt(0)!;
          if (INVISIBLE_CODEPOINT_SET.has(cp)) {
            found.push({ pos: i, codepoint: cp, info: INVISIBLE_LOOKUP.get(cp) });
          }
        }

        if (found.length === 0) {
          results.push(`No invisible Unicode characters found.`);
          return text(results.join("\n"));
        }

        results.push(`Found ${found.length} invisible character(s)`);
        results.push("");

        // Summary by category
        results.push(`=== Summary by Category ===`);
        const byCat = new Map<string, { count: number; chars: Map<number, number> }>();
        for (const f of found) {
          const cat = f.info?.category ?? "unknown";
          if (!byCat.has(cat)) byCat.set(cat, { count: 0, chars: new Map() });
          const entry = byCat.get(cat)!;
          entry.count++;
          entry.chars.set(f.codepoint, (entry.chars.get(f.codepoint) ?? 0) + 1);
        }

        for (const [cat, data] of byCat) {
          const desc = CATEGORY_DESCRIPTIONS[cat] ?? cat;
          results.push(`  ${cat} (${data.count}x) — ${desc}`);
          for (const [cp, count] of data.chars) {
            const info = INVISIBLE_LOOKUP.get(cp);
            results.push(`    U+${cp.toString(16).toUpperCase().padStart(4, "0")} ${info?.name ?? "unknown"}: ${count}x`);
          }
        }
        results.push("");

        // Detailed positions
        results.push(`=== Positions (showing first 100) ===`);
        for (const f of found.slice(0, 100)) {
          const before = charArray.slice(Math.max(0, f.pos - 2), f.pos).filter((c) => !INVISIBLE_CODEPOINT_SET.has(c.codePointAt(0)!)).join("");
          const after = charArray.slice(f.pos + 1, Math.min(charArray.length, f.pos + 3)).filter((c) => !INVISIBLE_CODEPOINT_SET.has(c.codePointAt(0)!)).join("");
          results.push(`  [${f.pos}] U+${f.codepoint.toString(16).toUpperCase().padStart(4, "0")} ${f.info?.name ?? "unknown"} (${f.info?.category ?? "?"}) near "...${before}|${after}..."`);
        }
        if (found.length > 100) {
          results.push(`  ... and ${found.length - 100} more`);
        }

        // Distribution analysis
        results.push("");
        results.push(`=== Distribution ===`);
        const totalChars = charArray.length;
        const invisibleRatio = found.length / totalChars;
        results.push(`Invisible/total ratio: ${found.length}/${totalChars} (${(invisibleRatio * 100).toFixed(2)}%)`);

        // Check for clustering
        if (found.length >= 2) {
          const gaps: number[] = [];
          for (let i = 1; i < found.length; i++) {
            gaps.push(found[i].pos - found[i - 1].pos);
          }
          const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
          const minGap = Math.min(...gaps);
          const maxGap = Math.max(...gaps);
          results.push(`Gap between invisible chars: avg=${avgGap.toFixed(1)}, min=${minGap}, max=${maxGap}`);
          if (minGap === 1 && found.length > 5) {
            results.push(`[!] Consecutive invisible characters detected — likely steganographic encoding`);
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 8. text_homoglyph
  {
    name: "text_homoglyph",
    description: "Detect Unicode homoglyph substitutions in text. Identifies non-ASCII characters that visually resemble ASCII letters (e.g., Cyrillic a vs Latin a, Greek o vs Latin o).",
    schema: {
      text: z.string().describe("Text to analyze"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];

        results.push(`=== Homoglyph Detection ===`);
        results.push(`Input length: ${input.length} characters`);
        results.push("");

        const found: {
          pos: number;
          char: string;
          codepoint: number;
          ascii: string;
          script: string;
          context: string;
        }[] = [];

        const charArray = [...input];
        for (let i = 0; i < charArray.length; i++) {
          const cp = charArray[i].codePointAt(0)!;
          const hg = HOMOGLYPH_LOOKUP.get(cp);
          if (hg) {
            const before = charArray.slice(Math.max(0, i - 5), i).join("");
            const after = charArray.slice(i + 1, Math.min(charArray.length, i + 6)).join("");
            found.push({
              pos: i,
              char: charArray[i],
              codepoint: cp,
              ascii: hg.ascii,
              script: hg.script,
              context: `${before}[${charArray[i]}]${after}`,
            });
          }
        }

        if (found.length === 0) {
          results.push(`No homoglyph substitutions detected.`);
          results.push(`All characters appear to be from their expected scripts.`);
          return text(results.join("\n"));
        }

        results.push(`[!] Found ${found.length} homoglyph substitution(s)`);
        results.push("");

        // Summary by script
        results.push(`=== Summary by Script ===`);
        const byScript = new Map<string, { count: number; chars: Map<string, number> }>();
        for (const f of found) {
          if (!byScript.has(f.script)) byScript.set(f.script, { count: 0, chars: new Map() });
          const entry = byScript.get(f.script)!;
          entry.count++;
          const key = `${f.char} (U+${f.codepoint.toString(16).toUpperCase().padStart(4, "0")}) → ${f.ascii}`;
          entry.chars.set(key, (entry.chars.get(key) ?? 0) + 1);
        }

        for (const [script, data] of byScript) {
          results.push(`  ${script}: ${data.count} substitution(s)`);
          for (const [desc, count] of data.chars) {
            results.push(`    ${desc}: ${count}x`);
          }
        }
        results.push("");

        // Detailed positions
        results.push(`=== Positions (showing first 50) ===`);
        for (const f of found.slice(0, 50)) {
          results.push(`  [${f.pos}] "${f.char}" (U+${f.codepoint.toString(16).toUpperCase().padStart(4, "0")}, ${f.script}) looks like ASCII "${f.ascii}" — ${f.context}`);
        }
        if (found.length > 50) {
          results.push(`  ... and ${found.length - 50} more`);
        }
        results.push("");

        // Extract the "hidden" message (the ASCII equivalents of homoglyphs)
        results.push(`=== Potential Hidden Signal ===`);
        const hiddenChars = found.map((f) => f.ascii).join("");
        results.push(`Homoglyph ASCII equivalents: "${hiddenChars}"`);
        results.push("");

        // Reconstruct the "clean" text (replacing homoglyphs with ASCII)
        results.push(`=== Cleaned Text (homoglyphs replaced with ASCII) ===`);
        const posSet = new Set(found.map((f) => f.pos));
        const posMap = new Map(found.map((f) => [f.pos, f.ascii]));
        const cleanChars = charArray.map((ch, i) => posSet.has(i) ? posMap.get(i)! : ch);
        const cleanText = cleanChars.join("");
        results.push(cleanText.substring(0, 500));
        if (cleanText.length > 500) results.push(`... (truncated)`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 9. text_unicode_analysis
  {
    name: "text_unicode_analysis",
    description: "Full Unicode character distribution analysis. Categorizes all characters by script block, performs entropy analysis, and detects suspicious script mixing.",
    schema: {
      text: z.string().describe("Text to analyze"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const results: string[] = [];

        results.push(`=== Unicode Character Distribution Analysis ===`);
        results.push(`Input length: ${input.length} characters`);
        results.push("");

        const charArray = [...input];

        // Categorize all characters
        const categoryMap = new Map<string, { count: number; examples: Set<string> }>();
        const cpDistribution: number[] = [];

        for (const ch of charArray) {
          const cp = ch.codePointAt(0)!;
          cpDistribution.push(cp);
          const cat = getCharCategory(cp);
          if (!categoryMap.has(cat)) categoryMap.set(cat, { count: 0, examples: new Set() });
          const entry = categoryMap.get(cat)!;
          entry.count++;
          if (entry.examples.size < 10) entry.examples.add(ch);
        }

        // Sort categories by count
        const sortedCats = [...categoryMap.entries()].sort((a, b) => b[1].count - a[1].count);

        results.push(`=== Character Categories ===`);
        for (const [cat, data] of sortedCats) {
          const pct = ((data.count / charArray.length) * 100).toFixed(1);
          const examples = [...data.examples].filter((c) => c.charCodeAt(0) >= 33).slice(0, 5).join(", ");
          results.push(`  ${cat}: ${data.count} (${pct}%)${examples ? ` — e.g.: ${examples}` : ""}`);
        }
        results.push("");

        // Entropy analysis
        results.push(`=== Entropy Analysis ===`);
        const entropy = shannonEntropyStr(input);
        const maxEntropy = Math.log2(new Set(charArray).size || 1);
        results.push(`Shannon entropy: ${entropy.toFixed(4)} bits/char`);
        results.push(`Maximum possible (given unique chars): ${maxEntropy.toFixed(4)} bits/char`);
        results.push(`Unique characters: ${new Set(charArray).size}`);
        results.push(`Efficiency: ${maxEntropy > 0 ? ((entropy / maxEntropy) * 100).toFixed(1) : 0}%`);
        results.push("");

        // Script mixing detection
        results.push(`=== Script Mixing Analysis ===`);
        const mainScripts = sortedCats.filter(([cat]) =>
          !["General Punctuation", "Other"].includes(cat) &&
          !cat.startsWith("Latin-1")
        );

        // Filter to alphabetic-looking categories
        const alphaScripts = mainScripts.filter(([cat]) =>
          ["ASCII", "Latin Extended", "Cyrillic", "Cyrillic Supplement", "Greek",
           "Armenian", "Hebrew", "Arabic", "Devanagari", "CJK", "Hangul",
           "Halfwidth/Fullwidth Forms"].includes(cat)
        );

        if (alphaScripts.length > 1) {
          results.push(`[!] Multiple alphabetic scripts detected:`);
          for (const [cat, data] of alphaScripts) {
            results.push(`  ${cat}: ${data.count} characters`);
          }

          // Check for suspicious mixing (predominantly one script with a few chars from another)
          const dominant = alphaScripts[0];
          const minor = alphaScripts.slice(1);
          for (const [cat, data] of minor) {
            const ratio = data.count / dominant[1].count;
            if (ratio < 0.05) {
              results.push(`  [!] SUSPICIOUS: ${cat} has only ${data.count} chars vs ${dominant[1].count} ${dominant[0]} chars`);
              results.push(`     This pattern is consistent with homoglyph substitution steganography`);
            }
          }
        } else if (alphaScripts.length === 1) {
          results.push(`Single alphabetic script: ${alphaScripts[0][0]}`);
        } else {
          results.push(`No dominant alphabetic script detected`);
        }
        results.push("");

        // Invisible character summary
        let invisCount = 0;
        for (const ch of charArray) {
          if (INVISIBLE_CODEPOINT_SET.has(ch.codePointAt(0)!)) invisCount++;
        }
        results.push(`=== Special Characters ===`);
        results.push(`Invisible characters: ${invisCount}`);
        results.push(`Whitespace (space/tab/newline): ${[...input].filter((c) => /\s/.test(c)).length}`);
        results.push(`Control characters (U+0000-U+001F): ${[...input].filter((c) => c.charCodeAt(0) <= 0x1f).length}`);

        // Codepoint range
        const minCp = Math.min(...cpDistribution);
        const maxCp = Math.max(...cpDistribution);
        results.push(`Codepoint range: U+${minCp.toString(16).toUpperCase().padStart(4, "0")} to U+${maxCp.toString(16).toUpperCase().padStart(4, "0")}`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 10. text_acrostic
  {
    name: "text_acrostic",
    description: "Detect first-letter, first-word, last-letter, last-word, or nth-character patterns (acrostic messages) hidden across lines of text.",
    schema: {
      text: z.string().describe("Text to analyze"),
      mode: z.enum(["first_letter", "first_word", "last_letter", "last_word", "nth_char"]).optional().describe("Detection mode (default: first_letter)"),
      n: z.number().optional().describe("Position for nth_char mode"),
    },
    execute: async (args) => {
      try {
        const input = args.text as string;
        const mode = (args.mode as string | undefined) ?? "first_letter";
        const n = (args.n as number | undefined) ?? 2;
        const results: string[] = [];

        results.push(`=== Acrostic Detection ===`);
        results.push(`Mode: ${mode}${mode === "nth_char" ? ` (n=${n})` : ""}`);
        results.push("");

        const lines = input.split("\n").filter((l) => l.trim().length > 0);
        results.push(`Non-empty lines: ${lines.length}`);
        results.push("");

        if (lines.length === 0) {
          results.push(`No lines to analyze.`);
          return text(results.join("\n"));
        }

        let extracted: string[] = [];

        switch (mode) {
          case "first_letter": {
            for (const line of lines) {
              const trimmed = line.trimStart();
              if (trimmed.length > 0) {
                extracted.push(trimmed[0]);
              }
            }
            break;
          }
          case "first_word": {
            for (const line of lines) {
              const words = line.trim().split(/\s+/);
              if (words.length > 0 && words[0].length > 0) {
                extracted.push(words[0]);
              }
            }
            break;
          }
          case "last_letter": {
            for (const line of lines) {
              const trimmed = line.trimEnd();
              if (trimmed.length > 0) {
                extracted.push(trimmed[trimmed.length - 1]);
              }
            }
            break;
          }
          case "last_word": {
            for (const line of lines) {
              const words = line.trim().split(/\s+/);
              if (words.length > 0) {
                extracted.push(words[words.length - 1]);
              }
            }
            break;
          }
          case "nth_char": {
            for (const line of lines) {
              const chars = [...line];
              if (chars.length > n) {
                extracted.push(chars[n]);
              } else {
                extracted.push("_"); // placeholder for short lines
              }
            }
            break;
          }
        }

        // Show the extraction
        results.push(`=== Extracted Pattern ===`);
        const isWordMode = mode === "first_word" || mode === "last_word";
        if (isWordMode) {
          results.push(`Words: ${extracted.join(" ")}`);
        } else {
          results.push(`Characters: ${extracted.join("")}`);
        }
        results.push("");

        // Show line-by-line extraction
        results.push(`=== Line-by-Line (showing first 50) ===`);
        for (let i = 0; i < Math.min(lines.length, 50); i++) {
          const linePreview = lines[i].substring(0, 70);
          const ext = extracted[i] ?? "";
          results.push(`  [${ext}] ${linePreview}${lines[i].length > 70 ? "..." : ""}`);
        }
        if (lines.length > 50) {
          results.push(`  ... and ${lines.length - 50} more lines`);
        }
        results.push("");

        // Analysis of the extracted pattern
        if (!isWordMode) {
          const message = extracted.join("");
          results.push(`=== Pattern Analysis ===`);
          results.push(`Message: "${message}"`);
          results.push(`Length: ${message.length}`);

          // Check if it forms readable text
          const alpha = [...message].filter((c) => /[a-zA-Z]/.test(c)).length;
          const alphaRatio = alpha / Math.max(1, message.length);
          results.push(`Alphabetic ratio: ${(alphaRatio * 100).toFixed(1)}%`);

          if (alphaRatio > 0.8) {
            results.push(`[!] High alphabetic ratio — this looks like it could be an intentional acrostic message`);
          }

          // Check for known words (simple check for common English words of 3+ letters)
          const lowerMsg = message.toLowerCase();
          const commonWords = ["the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
            "her", "was", "one", "our", "out", "help", "send", "save", "kill", "love",
            "hate", "stop", "run", "hide", "here", "come", "stay", "find", "look"];
          const foundWords = commonWords.filter((w) => lowerMsg.includes(w));
          if (foundWords.length > 0) {
            results.push(`[!] Common words found in pattern: ${foundWords.join(", ")}`);
          }
        } else {
          const message = extracted.join(" ");
          results.push(`=== Pattern Analysis ===`);
          results.push(`Message: "${message}"`);
          results.push(`Words: ${extracted.length}`);
        }

        // Try all modes for comparison
        if (mode === "first_letter") {
          results.push("");
          results.push(`=== Quick Comparison (other modes) ===`);
          // Last letter
          const lastLetters = lines.map((l) => {
            const t = l.trimEnd();
            return t.length > 0 ? t[t.length - 1] : "";
          }).join("");
          results.push(`Last letters: "${lastLetters}"`);

          // First words
          const firstWords = lines.map((l) => l.trim().split(/\s+/)[0] ?? "").join(" ");
          results.push(`First words: "${firstWords.substring(0, 200)}"`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
