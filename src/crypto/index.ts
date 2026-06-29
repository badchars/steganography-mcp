import { z } from "zod";
import { shannonEntropy, shannonEntropyStr } from "../utils/stats.js";
import { ENCODING_PATTERNS, HASH_PATTERNS } from "../data/encoding-patterns.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";

// ─── Helpers ───

/** Check if a string is predominantly printable ASCII */
function isPrintableString(str: string, threshold: number = 0.85): boolean {
  if (str.length === 0) return false;
  let printable = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if ((code >= 0x20 && code <= 0x7e) || code === 0x0a || code === 0x0d || code === 0x09) {
      printable++;
    }
  }
  return printable / str.length >= threshold;
}

/** Score how "English-like" a string is based on character frequency */
function englishScore(str: string): number {
  const englishFreq: Record<string, number> = {
    e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1,
    r: 6.0, d: 4.3, l: 4.0, c: 2.8, u: 2.8, m: 2.4, w: 2.4, f: 2.2,
    g: 2.0, y: 2.0, p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15,
    q: 0.1, z: 0.07, " ": 13.0,
  };

  const lower = str.toLowerCase();
  let score = 0;

  for (const ch of lower) {
    if (englishFreq[ch] !== undefined) {
      score += englishFreq[ch];
    } else if (ch >= "a" && ch <= "z") {
      score += 0.01;
    } else if (ch >= "0" && ch <= "9") {
      score += 0.5;
    } else if (ch.charCodeAt(0) >= 0x20 && ch.charCodeAt(0) <= 0x7e) {
      score += 0.1;
    } else {
      score -= 5;
    }
  }

  return score / str.length;
}

/** Calculate Index of Coincidence for a string */
function indexOfCoincidence(str: string): number {
  const upper = str.toUpperCase().replace(/[^A-Z]/g, "");
  if (upper.length < 2) return 0;

  const freq = new Array(26).fill(0);
  for (const ch of upper) {
    freq[ch.charCodeAt(0) - 65]++;
  }

  let sum = 0;
  for (const f of freq) {
    sum += f * (f - 1);
  }

  return sum / (upper.length * (upper.length - 1));
}

/** XOR a buffer with a key */
function xorWithKey(data: Buffer, key: Buffer): Buffer {
  const result = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}

/** Decode input from hex or base64 to Buffer */
function decodeInputToBuffer(input: string): Buffer {
  // Try hex first
  if (/^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0) {
    return Buffer.from(input, "hex");
  }
  // Try base64
  if (/^[A-Za-z0-9+/]+=*$/.test(input)) {
    return Buffer.from(input, "base64");
  }
  // Raw string
  return Buffer.from(input, "utf-8");
}

/** Apply ROT-N to a string */
function rotN(str: string, n: number): string {
  return str.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
  });
}

// ─── Tools ───

export const cryptoTools: ToolDef[] = [
  // 1. crypto_detect
  {
    name: "crypto_detect",
    description: "Auto-detect encoding type of an input string. Tests against all known encoding patterns (Base64, hex, binary, morse, URL encoding, HTML entities, etc.) and returns matches sorted by confidence, with attempted decoding for top results.",
    schema: {
      input: z.string().describe("Encoded string to analyze"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = (args.input as string).trim();

        const matches: Array<{
          encoding: string;
          description: string;
          confidence: number;
          decoded: string | null;
          decodedPrintable: boolean;
        }> = [];

        for (const pattern of ENCODING_PATTERNS) {
          if (pattern.regex.test(input)) {
            const confidence = pattern.confidence(input);
            if (confidence > 0.1) {
              const decoded = pattern.decode(input);
              const decodedPrintable = decoded !== null && isPrintableString(decoded);
              matches.push({
                encoding: pattern.name,
                description: pattern.description,
                confidence: Number(confidence.toFixed(3)),
                decoded: decoded !== null
                  ? (decodedPrintable
                    ? decoded.substring(0, 500)
                    : `(hex) ${Buffer.from(decoded, "utf-8").subarray(0, 64).toString("hex")}`)
                  : null,
                decodedPrintable,
              });
            }
          }
        }

        // Sort by confidence descending
        matches.sort((a, b) => b.confidence - a.confidence);

        // Boost confidence for printable results
        for (const m of matches) {
          if (m.decodedPrintable && m.decoded) {
            m.confidence = Math.min(1.0, m.confidence + 0.1);
          }
        }
        matches.sort((a, b) => b.confidence - a.confidence);

        return json({
          input: input.length > 200 ? input.substring(0, 200) + "..." : input,
          inputLength: input.length,
          matchesFound: matches.length,
          bestGuess: matches.length > 0 ? matches[0].encoding : "unknown",
          matches,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. crypto_decode
  {
    name: "crypto_decode",
    description: "Multi-format decoder supporting Base64, hex, binary, decimal, octal, URL encoding, ROT13, Base32, Morse code, and HTML entities. In auto mode, detects the encoding first and applies the appropriate decoder.",
    schema: {
      input: z.string().describe("String to decode"),
      encoding: z.enum(["base64", "hex", "binary", "decimal", "octal", "url", "rot13", "base32", "morse", "html_entities", "auto"]).optional().describe("Encoding format (default: auto)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = (args.input as string).trim();
        const encoding = (args.encoding as string | undefined) ?? "auto";

        let decoded: string | null = null;
        let usedEncoding = encoding;

        if (encoding === "auto") {
          // Find best matching encoding
          let bestConfidence = 0;
          let bestPattern: typeof ENCODING_PATTERNS[number] | null = null;

          for (const pattern of ENCODING_PATTERNS) {
            if (pattern.regex.test(input)) {
              const conf = pattern.confidence(input);
              const dec = pattern.decode(input);
              // Boost score for printable results
              const adjusted = dec !== null && isPrintableString(dec) ? conf + 0.15 : conf;
              if (adjusted > bestConfidence) {
                bestConfidence = adjusted;
                bestPattern = pattern;
              }
            }
          }

          if (bestPattern) {
            usedEncoding = bestPattern.name.toLowerCase();
            decoded = bestPattern.decode(input);
          }
        } else {
          // Map encoding name to pattern
          const encodingMap: Record<string, string> = {
            base64: "Base64",
            hex: "Hex",
            binary: "Binary",
            decimal: "Decimal",
            octal: "Octal",
            url: "URL Encoding",
            rot13: "ROT13",
            base32: "Base32",
            morse: "Morse Code",
            html_entities: "HTML Entities",
          };

          const patternName = encodingMap[encoding];
          const pattern = ENCODING_PATTERNS.find((p) => p.name === patternName);
          if (pattern) {
            decoded = pattern.decode(input);
          } else {
            return text(`Error: Unknown encoding '${encoding}'`);
          }
        }

        if (decoded === null) {
          return json({
            input: input.length > 200 ? input.substring(0, 200) + "..." : input,
            encoding: usedEncoding,
            success: false,
            error: "Could not decode the input with the specified encoding.",
          });
        }

        const printable = isPrintableString(decoded);

        return json({
          input: input.length > 200 ? input.substring(0, 200) + "..." : input,
          encoding: usedEncoding,
          success: true,
          decoded: printable
            ? decoded.substring(0, 2000)
            : `(non-printable, showing hex) ${Buffer.from(decoded, "utf-8").subarray(0, 128).toString("hex")}`,
          decodedLength: decoded.length,
          isPrintable: printable,
          decodedHex: Buffer.from(decoded, "utf-8").subarray(0, 64).toString("hex"),
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. crypto_frequency
  {
    name: "crypto_frequency",
    description: "Character frequency analysis for cryptanalysis. Counts character occurrences, compares to standard English letter frequency (ETAOINSHRDLU), and calculates the Index of Coincidence. IC near 0.0667 suggests English/monoalphabetic, IC near 0.038 suggests random/polyalphabetic.",
    schema: {
      input: z.string().describe("Text to analyze"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = args.input as string;

        // Character frequency
        const charFreq = new Map<string, number>();
        for (const ch of input) {
          charFreq.set(ch, (charFreq.get(ch) ?? 0) + 1);
        }

        // Letter-only frequency
        const letterFreq = new Map<string, number>();
        let totalLetters = 0;
        for (const ch of input.toUpperCase()) {
          if (ch >= "A" && ch <= "Z") {
            letterFreq.set(ch, (letterFreq.get(ch) ?? 0) + 1);
            totalLetters++;
          }
        }

        // Sort by frequency
        const sortedLetters = Array.from(letterFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([letter, count]) => ({
            letter,
            count,
            percentage: Number(((count / totalLetters) * 100).toFixed(2)),
          }));

        // English reference
        const englishOrder = "ETAOINSHRDLCUMWFGYPBVKJXQZ";
        const observedOrder = sortedLetters.map((l) => l.letter).join("");

        // Index of Coincidence
        const ic = indexOfCoincidence(input);

        // English frequency comparison
        const englishFreqRef: Record<string, number> = {
          E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1,
          R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2,
          G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15,
          Q: 0.1, Z: 0.07,
        };

        const frequencyDeviation = sortedLetters.map((l) => ({
          letter: l.letter,
          observed: l.percentage,
          expected: englishFreqRef[l.letter] ?? 0,
          deviation: Number((l.percentage - (englishFreqRef[l.letter] ?? 0)).toFixed(2)),
        }));

        // Classify based on IC
        let icClassification: string;
        if (ic > 0.060) {
          icClassification = "English or monoalphabetic cipher (IC ~0.0667)";
        } else if (ic > 0.050) {
          icClassification = "Possibly monoalphabetic with some noise, or short polyalphabetic";
        } else if (ic > 0.042) {
          icClassification = "Likely polyalphabetic cipher (e.g., Vigenere)";
        } else {
          icClassification = "Random or very strong polyalphabetic/stream cipher (IC ~0.038)";
        }

        // All characters sorted
        const allChars = Array.from(charFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 50)
          .map(([ch, count]) => ({
            char: ch === " " ? "(space)" : ch === "\n" ? "(newline)" : ch === "\t" ? "(tab)" : ch,
            charCode: ch.charCodeAt(0),
            count,
            percentage: Number(((count / input.length) * 100).toFixed(2)),
          }));

        return json({
          inputLength: input.length,
          uniqueCharacters: charFreq.size,
          totalLetters,
          indexOfCoincidence: Number(ic.toFixed(6)),
          icClassification,
          observedLetterOrder: observedOrder,
          englishLetterOrder: englishOrder,
          letterFrequencies: sortedLetters,
          frequencyDeviation,
          topCharacters: allChars,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. crypto_entropy
  {
    name: "crypto_entropy",
    description: "Shannon entropy calculation and classification for strings. Computes both character-level and byte-level entropy, classifying the result into categories: very low (repeated), low (simple text), normal text, compressed/encoded, or encrypted/random.",
    schema: {
      input: z.string().describe("String to analyze"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = args.input as string;

        // Character-level entropy
        const charEntropy = shannonEntropyStr(input);

        // Byte-level entropy
        const byteEntropy = shannonEntropy(Buffer.from(input, "utf-8"));

        // Maximum possible entropy
        const uniqueChars = new Set(input).size;
        const maxCharEntropy = Math.log2(uniqueChars || 1);
        const maxByteEntropy = 8.0;

        // Efficiency (how close to max)
        const charEfficiency = maxCharEntropy > 0 ? charEntropy / maxCharEntropy : 0;

        // Classification
        let classification: string;
        if (charEntropy < 1.0) {
          classification = "very_low - Highly repetitive data (repeated characters or patterns)";
        } else if (charEntropy < 3.0) {
          classification = "low - Simple text or limited character set";
        } else if (charEntropy < 5.0) {
          classification = "normal - Typical natural language text";
        } else if (charEntropy < 7.0) {
          classification = "high - Compressed, encoded, or mixed content";
        } else {
          classification = "very_high - Encrypted, random, or high-entropy encoded data";
        }

        // Additional analysis
        const isLikelyEncoded = charEntropy > 5.0 && /^[A-Za-z0-9+/=]+$/.test(input);
        const isLikelyEncrypted = byteEntropy > 7.5;
        const isLikelyCompressed = byteEntropy > 7.0 && byteEntropy <= 7.9;

        return json({
          inputLength: input.length,
          inputByteLength: Buffer.from(input, "utf-8").length,
          uniqueCharacters: uniqueChars,
          characterEntropy: Number(charEntropy.toFixed(6)),
          byteEntropy: Number(byteEntropy.toFixed(6)),
          maxCharEntropy: Number(maxCharEntropy.toFixed(6)),
          maxByteEntropy,
          charEfficiency: Number(charEfficiency.toFixed(4)),
          classification,
          analysis: {
            likelyEncoded: isLikelyEncoded,
            likelyEncrypted: isLikelyEncrypted,
            likelyCompressed: isLikelyCompressed,
            likelyNaturalLanguage: charEntropy >= 3.0 && charEntropy <= 5.0,
          },
          entropyScale: {
            "0-1": "Very low (repeated)",
            "1-3": "Low (simple text)",
            "3-5": "Normal (natural language)",
            "5-7": "High (compressed/encoded)",
            "7-8": "Very high (encrypted/random)",
          },
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. crypto_xor
  {
    name: "crypto_xor",
    description: "XOR key brute-force for single-byte and multi-byte keys. Tries all single-byte XOR keys (0x00-0xFF) and scores by printable character ratio. For multi-byte keys, uses Index of Coincidence to estimate key length. Returns top 5 most likely results.",
    schema: {
      input: z.string().describe("Hex-encoded or base64 ciphertext"),
      max_key_length: z.number().optional().describe("Maximum key length to try (default: 4)"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = (args.input as string).trim();
        const maxKeyLen = (args.max_key_length as number | undefined) ?? 4;

        const cipherBuf = decodeInputToBuffer(input);

        if (cipherBuf.length === 0) {
          return text("Error: Input decodes to empty buffer");
        }

        // Single-byte XOR brute force
        const singleByteResults: Array<{
          key: number;
          keyHex: string;
          keyChar: string;
          score: number;
          printableRatio: number;
          preview: string;
        }> = [];

        for (let key = 0; key <= 0xff; key++) {
          const decrypted = Buffer.alloc(cipherBuf.length);
          let printable = 0;

          for (let i = 0; i < cipherBuf.length; i++) {
            decrypted[i] = cipherBuf[i] ^ key;
            const c = decrypted[i];
            if ((c >= 0x20 && c <= 0x7e) || c === 0x0a || c === 0x0d || c === 0x09) {
              printable++;
            }
          }

          const ratio = printable / cipherBuf.length;
          const score = englishScore(decrypted.toString("utf-8"));

          singleByteResults.push({
            key,
            keyHex: "0x" + key.toString(16).padStart(2, "0"),
            keyChar: key >= 0x20 && key <= 0x7e ? String.fromCharCode(key) : "(non-printable)",
            score: Number(score.toFixed(3)),
            printableRatio: Number(ratio.toFixed(3)),
            preview: decrypted.toString("utf-8").substring(0, 100).replace(/[^\x20-\x7e\n\r\t]/g, "."),
          });
        }

        // Sort by score
        singleByteResults.sort((a, b) => b.score - a.score);
        const top5Single = singleByteResults.slice(0, 5);

        // Multi-byte XOR analysis
        const multiByteResults: Array<{
          keyLength: number;
          icAverage: number;
          bestKey: string;
          bestKeyHex: string;
          preview: string;
        }> = [];

        for (let keyLen = 2; keyLen <= Math.min(maxKeyLen, Math.floor(cipherBuf.length / 3)); keyLen++) {
          // Split into keyLen streams and calculate IC for each
          let icSum = 0;
          const keyBytes: number[] = [];

          for (let stream = 0; stream < keyLen; stream++) {
            const streamBytes: number[] = [];
            for (let i = stream; i < cipherBuf.length; i += keyLen) {
              streamBytes.push(cipherBuf[i]);
            }

            // Find best single-byte key for this stream
            let bestKey = 0;
            let bestScore = -Infinity;

            for (let k = 0; k <= 0xff; k++) {
              const decBytes = streamBytes.map((b) => b ^ k);
              const decStr = Buffer.from(decBytes).toString("utf-8");
              const s = englishScore(decStr);
              if (s > bestScore) {
                bestScore = s;
                bestKey = k;
              }
            }

            keyBytes.push(bestKey);

            // Calculate IC for decrypted stream
            const decStream = streamBytes.map((b) => b ^ bestKey);
            const decStr = Buffer.from(decStream).toString("utf-8");
            icSum += indexOfCoincidence(decStr);
          }

          const icAvg = icSum / keyLen;
          const keyBuf = Buffer.from(keyBytes);
          const decrypted = xorWithKey(cipherBuf, keyBuf);

          multiByteResults.push({
            keyLength: keyLen,
            icAverage: Number(icAvg.toFixed(6)),
            bestKey: keyBuf.toString("utf-8").replace(/[^\x20-\x7e]/g, "."),
            bestKeyHex: keyBuf.toString("hex"),
            preview: decrypted.toString("utf-8").substring(0, 100).replace(/[^\x20-\x7e\n\r\t]/g, "."),
          });
        }

        // Sort multi-byte by IC (higher = more likely English)
        multiByteResults.sort((a, b) => b.icAverage - a.icAverage);

        return json({
          inputLength: cipherBuf.length,
          inputFormat: /^[0-9a-fA-F]+$/.test(input) ? "hex" : "base64/raw",
          singleByteXor: {
            description: "Top 5 single-byte XOR keys by English text score",
            results: top5Single,
          },
          multiByteXor: {
            description: `Multi-byte XOR analysis for key lengths 2-${Math.min(maxKeyLen, Math.floor(cipherBuf.length / 3))}`,
            results: multiByteResults.slice(0, 5),
          },
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. crypto_hash_id
  {
    name: "crypto_hash_id",
    description: "Hash type identification. Matches the input against known hash patterns by length and format to identify possible hash algorithms (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, MySQL, etc.).",
    schema: {
      input: z.string().describe("Hash string to identify"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = (args.input as string).trim();

        const matches: Array<{
          name: string;
          description: string;
          expectedLength: number;
          confidence: string;
        }> = [];

        for (const pattern of HASH_PATTERNS) {
          if (pattern.regex.test(input)) {
            // Higher confidence for exact length match
            const lengthMatch = input.length === pattern.length || pattern.name === "bcrypt";
            matches.push({
              name: pattern.name,
              description: pattern.description,
              expectedLength: pattern.length,
              confidence: lengthMatch ? "high" : "medium",
            });
          }
        }

        // Additional checks for specific formats
        if (input.startsWith("$1$")) {
          matches.push({ name: "MD5-crypt", description: "Unix MD5 crypt hash", expectedLength: 34, confidence: "high" });
        }
        if (input.startsWith("$5$")) {
          matches.push({ name: "SHA-256-crypt", description: "Unix SHA-256 crypt hash", expectedLength: 63, confidence: "high" });
        }
        if (input.startsWith("$6$")) {
          matches.push({ name: "SHA-512-crypt", description: "Unix SHA-512 crypt hash", expectedLength: 106, confidence: "high" });
        }
        if (/^\$apr1\$/.test(input)) {
          matches.push({ name: "Apache APR1", description: "Apache APR1 MD5 hash", expectedLength: 37, confidence: "high" });
        }
        if (/^\$argon2(i|d|id)\$/.test(input)) {
          matches.push({ name: "Argon2", description: "Argon2 password hash", expectedLength: input.length, confidence: "high" });
        }
        if (/^[0-9a-f]{32}:[0-9a-f]+$/i.test(input)) {
          matches.push({ name: "MD5+salt", description: "MD5 hash with appended salt", expectedLength: input.length, confidence: "medium" });
        }
        if (/^sha1\$[a-z0-9]+\$[0-9a-f]{40}$/i.test(input)) {
          matches.push({ name: "Django SHA-1", description: "Django SHA-1 password hash", expectedLength: input.length, confidence: "high" });
        }
        if (/^pbkdf2_sha256\$/.test(input)) {
          matches.push({ name: "Django PBKDF2-SHA256", description: "Django PBKDF2-SHA256 password hash", expectedLength: input.length, confidence: "high" });
        }

        // Deduplicate by name
        const seen = new Set<string>();
        const unique = matches.filter((m) => {
          if (seen.has(m.name)) return false;
          seen.add(m.name);
          return true;
        });

        return json({
          input: input.length > 200 ? input.substring(0, 200) + "..." : input,
          inputLength: input.length,
          possibleTypes: unique.length,
          matches: unique,
          analysis: unique.length === 0
            ? "No known hash pattern matches the input."
            : unique.length === 1
              ? `Most likely: ${unique[0].name} (${unique[0].description})`
              : `${unique.length} possible hash types. Most likely: ${unique.filter((m) => m.confidence === "high").map((m) => m.name).join(", ") || unique[0].name}`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. crypto_patterns
  {
    name: "crypto_patterns",
    description: "Known cipher and encoding pattern detection. Analyzes text for indicators of Caesar cipher, substitution cipher, Vigenere, rail fence transposition, Atbash cipher, and reversed text. Uses statistical methods like Index of Coincidence and frequency analysis.",
    schema: {
      input: z.string().describe("Text to analyze"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const input = args.input as string;
        const findings: Array<{
          pattern: string;
          confidence: string;
          description: string;
          details: Record<string, unknown>;
        }> = [];

        const lettersOnly = input.toUpperCase().replace(/[^A-Z]/g, "");
        if (lettersOnly.length < 3) {
          return json({
            input: input.substring(0, 200),
            findings: [],
            summary: "Input too short for meaningful cipher pattern analysis (need at least 3 letters).",
          });
        }

        const ic = indexOfCoincidence(input);
        const entropy = shannonEntropyStr(input);

        // 1. Caesar cipher detection - try all 25 rotations
        const caesarResults: Array<{ shift: number; score: number; preview: string }> = [];
        for (let shift = 1; shift <= 25; shift++) {
          const decoded = rotN(input, shift);
          const score = englishScore(decoded);
          caesarResults.push({
            shift,
            score: Number(score.toFixed(3)),
            preview: decoded.substring(0, 60),
          });
        }
        caesarResults.sort((a, b) => b.score - a.score);

        if (caesarResults[0].score > 3.5 && caesarResults[0].score > caesarResults[12].score * 1.8) {
          findings.push({
            pattern: "Caesar Cipher (ROT-N)",
            confidence: caesarResults[0].score > 5 ? "high" : "medium",
            description: `Likely ROT-${caesarResults[0].shift} cipher. The decrypted text scores well for English.`,
            details: {
              bestShift: caesarResults[0].shift,
              bestScore: caesarResults[0].score,
              preview: caesarResults[0].preview,
              top3: caesarResults.slice(0, 3),
            },
          });
        }

        // 2. Atbash cipher detection
        const atbash = input.replace(/[A-Za-z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
        });
        const atbashScore = englishScore(atbash);
        if (atbashScore > 4.0) {
          findings.push({
            pattern: "Atbash Cipher",
            confidence: atbashScore > 5 ? "high" : "medium",
            description: "Text may be Atbash-encoded (A=Z, B=Y, C=X, ...). Decoded version scores well for English.",
            details: {
              score: Number(atbashScore.toFixed(3)),
              preview: atbash.substring(0, 100),
            },
          });
        }

        // 3. Substitution cipher indicators (monoalphabetic)
        if (ic > 0.060 && entropy < 4.5) {
          const originalScore = englishScore(input);
          if (originalScore < 3.0) {
            findings.push({
              pattern: "Monoalphabetic Substitution",
              confidence: ic > 0.065 ? "high" : "medium",
              description: "IC is consistent with English but text doesn't read as English - likely monoalphabetic substitution cipher.",
              details: {
                indexOfCoincidence: Number(ic.toFixed(6)),
                expectedEnglishIC: 0.0667,
                englishScore: Number(originalScore.toFixed(3)),
              },
            });
          }
        }

        // 4. Vigenere / polyalphabetic cipher indicators
        if (ic > 0.038 && ic < 0.060 && lettersOnly.length > 20) {
          // Estimate key length using IC at different periods
          const keyLengthGuesses: Array<{ length: number; ic: number }> = [];
          for (let kl = 2; kl <= Math.min(20, Math.floor(lettersOnly.length / 3)); kl++) {
            let icSum = 0;
            for (let stream = 0; stream < kl; stream++) {
              let streamStr = "";
              for (let i = stream; i < lettersOnly.length; i += kl) {
                streamStr += lettersOnly[i];
              }
              icSum += indexOfCoincidence(streamStr);
            }
            keyLengthGuesses.push({ length: kl, ic: Number((icSum / kl).toFixed(6)) });
          }
          keyLengthGuesses.sort((a, b) => b.ic - a.ic);

          findings.push({
            pattern: "Polyalphabetic Cipher (Vigenere-like)",
            confidence: ic < 0.050 ? "high" : "medium",
            description: "IC is between random and English, suggesting a polyalphabetic cipher like Vigenere.",
            details: {
              indexOfCoincidence: Number(ic.toFixed(6)),
              expectedRandomIC: 0.0385,
              expectedEnglishIC: 0.0667,
              likelyKeyLengths: keyLengthGuesses.slice(0, 5),
            },
          });
        }

        // 5. Rail fence transposition detection
        for (let rails = 2; rails <= 5; rails++) {
          // Decode rail fence
          const n = input.length;
          const fence: string[][] = Array.from({ length: rails }, () => []);
          const order: number[] = [];

          let rail = 0;
          let direction = 1;
          for (let i = 0; i < n; i++) {
            order.push(rail);
            if (rail === 0) direction = 1;
            if (rail === rails - 1) direction = -1;
            rail += direction;
          }

          // Calculate positions for each rail
          const railLengths = new Array(rails).fill(0);
          for (const r of order) railLengths[r]++;

          const decoded = new Array(n);
          let pos = 0;
          for (let r = 0; r < rails; r++) {
            for (let i = 0; i < n; i++) {
              if (order[i] === r) {
                if (pos < input.length) decoded[i] = input[pos++];
              }
            }
          }

          const decodedStr = decoded.join("");
          const rfScore = englishScore(decodedStr);
          if (rfScore > 4.0) {
            findings.push({
              pattern: `Rail Fence Cipher (${rails} rails)`,
              confidence: rfScore > 5 ? "high" : "medium",
              description: `Rail fence transposition with ${rails} rails produces readable text.`,
              details: {
                rails,
                score: Number(rfScore.toFixed(3)),
                preview: decodedStr.substring(0, 100),
              },
            });
            break; // Only report best rail fence match
          }
        }

        // 6. Reversed text detection
        const reversed = input.split("").reverse().join("");
        const reversedScore = englishScore(reversed);
        const originalScore = englishScore(input);
        if (reversedScore > originalScore * 1.5 && reversedScore > 3.5) {
          findings.push({
            pattern: "Reversed Text",
            confidence: reversedScore > 5 ? "high" : "medium",
            description: "The reversed text scores significantly higher for English than the original.",
            details: {
              originalScore: Number(originalScore.toFixed(3)),
              reversedScore: Number(reversedScore.toFixed(3)),
              preview: reversed.substring(0, 100),
            },
          });
        }

        return json({
          input: input.length > 200 ? input.substring(0, 200) + "..." : input,
          inputLength: input.length,
          letterCount: lettersOnly.length,
          indexOfCoincidence: Number(ic.toFixed(6)),
          entropy: Number(entropy.toFixed(4)),
          findingsCount: findings.length,
          findings,
          summary: findings.length === 0
            ? "No strong cipher patterns detected. The text may be plaintext, use an unknown encoding, or the sample may be too short."
            : `Detected ${findings.length} potential cipher pattern(s). Most likely: ${findings[0].pattern} (${findings[0].confidence} confidence).`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
