// ─── Encoding Pattern Detection for Steganography Analysis ───

export interface EncodingPattern {
  name: string;
  description: string;
  regex: RegExp;
  confidence: (match: string) => number;
  decode: (input: string) => string | null;
}

/** Detect and decode common encodings used to hide data */
export const ENCODING_PATTERNS: EncodingPattern[] = [
  {
    name: "Base64",
    description: "Standard Base64 encoding (RFC 4648)",
    regex: /^[A-Za-z0-9+/]{4,}={0,2}$/,
    confidence: (m) => {
      if (m.length < 4) return 0;
      if (m.length % 4 === 0) return 0.85;
      return 0.5;
    },
    decode: (input) => {
      try {
        return Buffer.from(input, "base64").toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Base64URL",
    description: "URL-safe Base64 encoding",
    regex: /^[A-Za-z0-9_-]{4,}={0,2}$/,
    confidence: (m) => {
      if (m.length < 4) return 0;
      if (m.includes("-") || m.includes("_")) return 0.8;
      return 0.3;
    },
    decode: (input) => {
      try {
        const std = input.replace(/-/g, "+").replace(/_/g, "/");
        return Buffer.from(std, "base64").toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Hex",
    description: "Hexadecimal encoding",
    regex: /^[0-9a-fA-F]{2,}$/,
    confidence: (m) => {
      if (m.length % 2 !== 0) return 0.2;
      if (m.length >= 8) return 0.75;
      return 0.5;
    },
    decode: (input) => {
      try {
        return Buffer.from(input, "hex").toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Base32",
    description: "Base32 encoding (RFC 4648)",
    regex: /^[A-Z2-7]{8,}={0,6}$/,
    confidence: (m) => {
      if (m.length < 8) return 0;
      if (m.length % 8 === 0) return 0.8;
      return 0.5;
    },
    decode: (input) => {
      try {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const cleaned = input.replace(/=+$/, "").toUpperCase();
        let bits = "";
        for (const c of cleaned) {
          const idx = alphabet.indexOf(c);
          if (idx === -1) return null;
          bits += idx.toString(2).padStart(5, "0");
        }
        const bytes: number[] = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
          bytes.push(parseInt(bits.slice(i, i + 8), 2));
        }
        return Buffer.from(bytes).toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Binary",
    description: "Binary string (8-bit groups)",
    regex: /^[01]{8,}$/,
    confidence: (m) => {
      if (m.length % 8 !== 0) return 0.3;
      return 0.85;
    },
    decode: (input) => {
      try {
        const bytes: number[] = [];
        for (let i = 0; i < input.length; i += 8) {
          bytes.push(parseInt(input.slice(i, i + 8), 2));
        }
        return Buffer.from(bytes).toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Decimal",
    description: "Space-separated decimal ASCII values",
    regex: /^\d{1,3}(\s+\d{1,3}){2,}$/,
    confidence: (m) => {
      const nums = m.split(/\s+/).map(Number);
      if (nums.every((n) => n >= 32 && n <= 126)) return 0.85;
      if (nums.every((n) => n >= 0 && n <= 255)) return 0.6;
      return 0.3;
    },
    decode: (input) => {
      try {
        const bytes = input.split(/\s+/).map(Number);
        if (bytes.some((b) => b < 0 || b > 255)) return null;
        return Buffer.from(bytes).toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "Octal",
    description: "Space-separated octal ASCII values",
    regex: /^[0-7]{1,3}(\s+[0-7]{1,3}){2,}$/,
    confidence: (m) => {
      const nums = m.split(/\s+/).map((n) => parseInt(n, 8));
      if (nums.every((n) => n >= 32 && n <= 126)) return 0.8;
      return 0.4;
    },
    decode: (input) => {
      try {
        const bytes = input.split(/\s+/).map((n) => parseInt(n, 8));
        if (bytes.some((b) => b < 0 || b > 255)) return null;
        return Buffer.from(bytes).toString("utf-8");
      } catch {
        return null;
      }
    },
  },
  {
    name: "URL Encoding",
    description: "Percent-encoded string",
    regex: /(%[0-9A-Fa-f]{2}){2,}/,
    confidence: (m) => {
      const pctCount = (m.match(/%[0-9A-Fa-f]{2}/g) || []).length;
      if (pctCount >= 3) return 0.9;
      return 0.5;
    },
    decode: (input) => {
      try {
        return decodeURIComponent(input);
      } catch {
        return null;
      }
    },
  },
  {
    name: "ROT13",
    description: "ROT13 Caesar cipher (letter rotation)",
    regex: /^[A-Za-z\s.,!?;:'"()-]+$/,
    confidence: () => 0.2, // low confidence — any text matches
    decode: (input) => {
      return input.replace(/[A-Za-z]/g, (c) => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    },
  },
  {
    name: "HTML Entities",
    description: "HTML numeric character references",
    regex: /(&#\d{1,5};){2,}|(&#x[0-9A-Fa-f]{1,4};){2,}/,
    confidence: (m) => {
      const count = (m.match(/&#/g) || []).length;
      if (count >= 5) return 0.9;
      return 0.6;
    },
    decode: (input) => {
      try {
        return input.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
                     .replace(/&#x([0-9A-Fa-f]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
      } catch {
        return null;
      }
    },
  },
  {
    name: "Morse Code",
    description: "Morse code (dots and dashes)",
    regex: /^[.\-/\s]{5,}$/,
    confidence: (m) => {
      if (m.includes("...") || m.includes("---")) return 0.7;
      if (m.includes(".") && m.includes("-")) return 0.5;
      return 0.2;
    },
    decode: (input) => {
      const MORSE: Record<string, string> = {
        ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
        "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
        "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
        ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
        "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y",
        "--..": "Z", ".----": "1", "..---": "2", "...--": "3",
        "....-": "4", ".....": "5", "-....": "6", "--...": "7",
        "---..": "8", "----.": "9", "-----": "0",
      };
      try {
        return input
          .split(/\s{2,}|\//)
          .map((word) =>
            word.split(/\s+/).map((c) => MORSE[c] || "?").join("")
          )
          .join(" ");
      } catch {
        return null;
      }
    },
  },
];

/** Known hash format patterns for identification */
export const HASH_PATTERNS: { name: string; length: number; regex: RegExp; description: string }[] = [
  { name: "MD5", length: 32, regex: /^[0-9a-f]{32}$/i, description: "MD5 (128-bit)" },
  { name: "SHA-1", length: 40, regex: /^[0-9a-f]{40}$/i, description: "SHA-1 (160-bit)" },
  { name: "SHA-224", length: 56, regex: /^[0-9a-f]{56}$/i, description: "SHA-224 (224-bit)" },
  { name: "SHA-256", length: 64, regex: /^[0-9a-f]{64}$/i, description: "SHA-256 (256-bit)" },
  { name: "SHA-384", length: 96, regex: /^[0-9a-f]{96}$/i, description: "SHA-384 (384-bit)" },
  { name: "SHA-512", length: 128, regex: /^[0-9a-f]{128}$/i, description: "SHA-512 (512-bit)" },
  { name: "CRC32", length: 8, regex: /^[0-9a-f]{8}$/i, description: "CRC32 (32-bit)" },
  { name: "RIPEMD-160", length: 40, regex: /^[0-9a-f]{40}$/i, description: "RIPEMD-160 (160-bit)" },
  { name: "bcrypt", length: 60, regex: /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/, description: "bcrypt hash" },
  { name: "NTLM", length: 32, regex: /^[0-9a-f]{32}$/i, description: "NTLM (128-bit)" },
  { name: "MySQL 4.1+", length: 40, regex: /^\*[0-9A-F]{40}$/, description: "MySQL 4.1+ password hash" },
  { name: "SHA-3-256", length: 64, regex: /^[0-9a-f]{64}$/i, description: "SHA-3-256 (256-bit)" },
];
