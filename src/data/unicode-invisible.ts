// ─── Invisible Unicode Characters for Steganography Detection ───

export interface InvisibleChar {
  codepoint: number;
  name: string;
  category: string;
  hex: string;
}

/** Zero-width characters commonly used for text steganography */
export const ZWC_STEGO: InvisibleChar[] = [
  { codepoint: 0x200b, name: "ZERO WIDTH SPACE", category: "zwc", hex: "200B" },
  { codepoint: 0x200c, name: "ZERO WIDTH NON-JOINER", category: "zwc", hex: "200C" },
  { codepoint: 0x200d, name: "ZERO WIDTH JOINER", category: "zwc", hex: "200D" },
  { codepoint: 0xfeff, name: "ZERO WIDTH NO-BREAK SPACE", category: "zwc", hex: "FEFF" },
];

/** All invisible Unicode characters by category */
export const INVISIBLE_CHARS: InvisibleChar[] = [
  // Zero-width characters
  ...ZWC_STEGO,

  // Format characters
  { codepoint: 0x00ad, name: "SOFT HYPHEN", category: "format", hex: "00AD" },
  { codepoint: 0x034f, name: "COMBINING GRAPHEME JOINER", category: "format", hex: "034F" },
  { codepoint: 0x061c, name: "ARABIC LETTER MARK", category: "format", hex: "061C" },
  { codepoint: 0x115f, name: "HANGUL CHOSEONG FILLER", category: "format", hex: "115F" },
  { codepoint: 0x1160, name: "HANGUL JUNGSEONG FILLER", category: "format", hex: "1160" },
  { codepoint: 0x17b4, name: "KHMER VOWEL INHERENT AQ", category: "format", hex: "17B4" },
  { codepoint: 0x17b5, name: "KHMER VOWEL INHERENT AA", category: "format", hex: "17B5" },
  { codepoint: 0x180e, name: "MONGOLIAN VOWEL SEPARATOR", category: "format", hex: "180E" },

  // Directional markers
  { codepoint: 0x200e, name: "LEFT-TO-RIGHT MARK", category: "directional", hex: "200E" },
  { codepoint: 0x200f, name: "RIGHT-TO-LEFT MARK", category: "directional", hex: "200F" },
  { codepoint: 0x202a, name: "LEFT-TO-RIGHT EMBEDDING", category: "directional", hex: "202A" },
  { codepoint: 0x202b, name: "RIGHT-TO-LEFT EMBEDDING", category: "directional", hex: "202B" },
  { codepoint: 0x202c, name: "POP DIRECTIONAL FORMATTING", category: "directional", hex: "202C" },
  { codepoint: 0x202d, name: "LEFT-TO-RIGHT OVERRIDE", category: "directional", hex: "202D" },
  { codepoint: 0x202e, name: "RIGHT-TO-LEFT OVERRIDE", category: "directional", hex: "202E" },
  { codepoint: 0x2066, name: "LEFT-TO-RIGHT ISOLATE", category: "directional", hex: "2066" },
  { codepoint: 0x2067, name: "RIGHT-TO-LEFT ISOLATE", category: "directional", hex: "2067" },
  { codepoint: 0x2068, name: "FIRST STRONG ISOLATE", category: "directional", hex: "2068" },
  { codepoint: 0x2069, name: "POP DIRECTIONAL ISOLATE", category: "directional", hex: "2069" },

  // Invisible math operators
  { codepoint: 0x2061, name: "FUNCTION APPLICATION", category: "math", hex: "2061" },
  { codepoint: 0x2062, name: "INVISIBLE TIMES", category: "math", hex: "2062" },
  { codepoint: 0x2063, name: "INVISIBLE SEPARATOR", category: "math", hex: "2063" },
  { codepoint: 0x2064, name: "INVISIBLE PLUS", category: "math", hex: "2064" },

  // Tag characters (U+E0001-E007F)
  { codepoint: 0xe0001, name: "LANGUAGE TAG", category: "tag", hex: "E0001" },
  { codepoint: 0xe0020, name: "TAG SPACE", category: "tag", hex: "E0020" },
  { codepoint: 0xe007f, name: "CANCEL TAG", category: "tag", hex: "E007F" },

  // Variation selectors
  { codepoint: 0xfe00, name: "VARIATION SELECTOR-1", category: "variation", hex: "FE00" },
  { codepoint: 0xfe01, name: "VARIATION SELECTOR-2", category: "variation", hex: "FE01" },
  { codepoint: 0xfe0f, name: "VARIATION SELECTOR-16", category: "variation", hex: "FE0F" },

  // Control characters that may appear in text
  { codepoint: 0x0000, name: "NULL", category: "control", hex: "0000" },
  { codepoint: 0x0008, name: "BACKSPACE", category: "control", hex: "0008" },
  { codepoint: 0x007f, name: "DELETE", category: "control", hex: "007F" },
  { codepoint: 0x0085, name: "NEXT LINE", category: "control", hex: "0085" },

  // Unusual space characters
  { codepoint: 0x00a0, name: "NO-BREAK SPACE", category: "space", hex: "00A0" },
  { codepoint: 0x1680, name: "OGHAM SPACE MARK", category: "space", hex: "1680" },
  { codepoint: 0x2000, name: "EN QUAD", category: "space", hex: "2000" },
  { codepoint: 0x2001, name: "EM QUAD", category: "space", hex: "2001" },
  { codepoint: 0x2002, name: "EN SPACE", category: "space", hex: "2002" },
  { codepoint: 0x2003, name: "EM SPACE", category: "space", hex: "2003" },
  { codepoint: 0x2004, name: "THREE-PER-EM SPACE", category: "space", hex: "2004" },
  { codepoint: 0x2005, name: "FOUR-PER-EM SPACE", category: "space", hex: "2005" },
  { codepoint: 0x2006, name: "SIX-PER-EM SPACE", category: "space", hex: "2006" },
  { codepoint: 0x2007, name: "FIGURE SPACE", category: "space", hex: "2007" },
  { codepoint: 0x2008, name: "PUNCTUATION SPACE", category: "space", hex: "2008" },
  { codepoint: 0x2009, name: "THIN SPACE", category: "space", hex: "2009" },
  { codepoint: 0x200a, name: "HAIR SPACE", category: "space", hex: "200A" },
  { codepoint: 0x2028, name: "LINE SEPARATOR", category: "space", hex: "2028" },
  { codepoint: 0x2029, name: "PARAGRAPH SEPARATOR", category: "space", hex: "2029" },
  { codepoint: 0x202f, name: "NARROW NO-BREAK SPACE", category: "space", hex: "202F" },
  { codepoint: 0x205f, name: "MEDIUM MATHEMATICAL SPACE", category: "space", hex: "205F" },
  { codepoint: 0x3000, name: "IDEOGRAPHIC SPACE", category: "space", hex: "3000" },
];

/** Build a Set of all invisible codepoints for fast lookup */
export const INVISIBLE_CODEPOINT_SET = new Set(
  INVISIBLE_CHARS.map((c) => c.codepoint)
);

/** Lookup map: codepoint → InvisibleChar */
export const INVISIBLE_LOOKUP = new Map<number, InvisibleChar>(
  INVISIBLE_CHARS.map((c) => [c.codepoint, c])
);

/** Category descriptions */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  zwc: "Zero-width characters — most commonly used for text steganography",
  format: "Format control characters — invisible in most renderers",
  directional: "Bidirectional text markers — can be used to hide text direction changes",
  math: "Invisible mathematical operators — rarely visible in normal text",
  tag: "Tag characters — Unicode tag system, often invisible",
  variation: "Variation selectors — modify preceding character appearance",
  control: "Control characters — should not appear in normal text",
  space: "Special space characters — unusual whitespace variants",
};
