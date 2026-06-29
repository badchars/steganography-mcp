export interface StegoSignature {
  tool: string;
  description: string;
  fileTypes: string[];
  technique: string;
  headerPatterns: Array<{
    offset: number | "any" | "end";
    bytes?: number[];
    text?: string;
    description: string;
  }>;
  statisticalIndicators: string[];
}

export const STEGO_SIGNATURES: StegoSignature[] = [
  {
    tool: "OpenStego",
    description: "Open-source steganography tool with LSB embedding",
    fileTypes: ["png", "bmp"],
    technique: "LSB replacement with signature header",
    headerPatterns: [
      { offset: "any", text: "OpenStego", description: "OpenStego header string in pixel data" },
    ],
    statisticalIndicators: ["Chi-square p-value > 0.95 in LSB channel", "Regular bit pattern in first 64 pixels"],
  },
  {
    tool: "Steghide",
    description: "Steganography tool with passphrase-based encryption",
    fileTypes: ["jpg", "bmp", "wav", "au"],
    technique: "Graph-theoretic approach, DCT domain for JPEG",
    headerPatterns: [],
    statisticalIndicators: [
      "Modified DCT coefficient distribution",
      "Unusual histogram pairs in spatial domain",
      "No simple byte signature — detection requires statistical analysis",
    ],
  },
  {
    tool: "JSteg",
    description: "Classic JPEG steganography tool",
    fileTypes: ["jpg"],
    technique: "LSB of non-zero DCT coefficients",
    headerPatterns: [],
    statisticalIndicators: [
      "DCT coefficient histogram shows absence of -1 and +1 values",
      "Pairs of adjacent DCT values show equal frequency",
      "Chi-square test on DCT coefficient LSBs",
    ],
  },
  {
    tool: "F5",
    description: "Advanced JPEG steganography using matrix encoding",
    fileTypes: ["jpg"],
    technique: "Matrix encoding with shrinkage, DCT coefficient decrement",
    headerPatterns: [
      { offset: "any", bytes: [0x00, 0x00, 0x01], description: "F5 embedded data prefix (rare)" },
    ],
    statisticalIndicators: [
      "Increased number of zero DCT coefficients (shrinkage effect)",
      "Histogram of DCT coefficients shows reduced non-zero count",
      "Blockiness artifacts in spatial domain",
    ],
  },
  {
    tool: "OutGuess",
    description: "Steganography tool with statistical correction",
    fileTypes: ["jpg", "pnm"],
    technique: "Redundant DCT coefficient embedding with correction",
    headerPatterns: [],
    statisticalIndicators: [
      "First-order statistics preserved (correction applied)",
      "Second-order statistics may reveal embedding",
      "Blockiness metric comparison with reference image",
    ],
  },
  {
    tool: "LSB-Steg (generic)",
    description: "Generic sequential LSB replacement",
    fileTypes: ["png", "bmp", "wav"],
    technique: "Sequential LSB replacement in pixel/sample values",
    headerPatterns: [],
    statisticalIndicators: [
      "Chi-square pairs test: p-value > 0.95 for affected region",
      "RS analysis: estimated embedding rate > 0.05",
      "Sample pair analysis positive",
      "Entropy anomaly in LSB channel",
    ],
  },
  {
    tool: "SilentEye",
    description: "Cross-platform steganography tool",
    fileTypes: ["jpg", "bmp", "wav"],
    technique: "LSB with optional AES encryption",
    headerPatterns: [
      { offset: "any", text: "SilentEye", description: "SilentEye signature in embedded data" },
    ],
    statisticalIndicators: ["Similar to generic LSB detection"],
  },
  {
    tool: "Snow",
    description: "Whitespace steganography tool for text files",
    fileTypes: ["txt"],
    technique: "Trailing whitespace encoding (tabs and spaces)",
    headerPatterns: [],
    statisticalIndicators: [
      "Trailing whitespace (tabs/spaces) after visible line content",
      "Mix of spaces and tabs in trailing whitespace",
      "Non-printable whitespace at end of lines",
    ],
  },
  {
    tool: "Invisible Secrets",
    description: "Commercial steganography software",
    fileTypes: ["jpg", "png", "bmp", "wav"],
    technique: "Various embedding methods with encryption",
    headerPatterns: [
      { offset: "any", bytes: [0x49, 0x53], description: "IS marker in some versions" },
    ],
    statisticalIndicators: ["Tool-specific coefficient patterns"],
  },
  {
    tool: "Camouflage",
    description: "File-appending steganography tool",
    fileTypes: ["jpg", "bmp", "gif"],
    technique: "Appends encrypted data after EOF marker",
    headerPatterns: [
      { offset: "end", bytes: [0x20, 0x00], description: "Camouflage footer marker" },
    ],
    statisticalIndicators: ["Data present after format-specific EOF marker"],
  },
  {
    tool: "Zero-Width Characters",
    description: "Unicode zero-width character steganography",
    fileTypes: ["txt", "html", "md"],
    technique: "Binary encoding using ZWSP, ZWNJ, ZWJ characters",
    headerPatterns: [],
    statisticalIndicators: [
      "Presence of U+200B (ZWSP) characters",
      "Presence of U+200C (ZWNJ) characters",
      "Presence of U+200D (ZWJ) characters",
      "Presence of U+FEFF (BOM/ZWNBSP) characters",
      "Clusters of zero-width characters between visible text",
    ],
  },
  {
    tool: "StegFS",
    description: "Steganographic filesystem",
    fileTypes: ["img", "raw"],
    technique: "Data hidden in filesystem blocks",
    headerPatterns: [],
    statisticalIndicators: ["Entropy analysis of disk image blocks"],
  },
  {
    tool: "coagula",
    description: "Sound-to-image steganography",
    fileTypes: ["wav", "bmp"],
    technique: "Embeds image as spectrogram in audio file",
    headerPatterns: [],
    statisticalIndicators: [
      "Visible patterns in audio spectrogram",
      "Frequency content above normal speech/music range",
    ],
  },
  {
    tool: "DeepSound",
    description: "Audio steganography tool",
    fileTypes: ["wav", "flac", "mp3"],
    technique: "LSB encoding in audio samples with optional AES encryption",
    headerPatterns: [
      { offset: "any", bytes: [0x44, 0x53], description: "DS marker (DeepSound)" },
    ],
    statisticalIndicators: ["LSB anomaly in PCM samples", "Modified sample distribution"],
  },
  {
    tool: "mp3stego",
    description: "MP3 steganography tool",
    fileTypes: ["mp3"],
    technique: "Embeds data during MP3 compression (parity of quantized values)",
    headerPatterns: [],
    statisticalIndicators: ["Unusual quantization patterns in MP3 frames"],
  },
  {
    tool: "OpenPuff",
    description: "Professional steganography tool with multi-carrier support",
    fileTypes: ["png", "jpg", "bmp", "mp3", "wav", "mp4", "flv", "pdf"],
    technique: "Multi-layer encoding with CSPRNG carrier bit selection",
    headerPatterns: [],
    statisticalIndicators: [
      "No detectable header — uses cryptographic carrier selection",
      "Spread spectrum embedding across multiple carriers",
      "Requires knowledge of carrier chain for detection",
    ],
  },
  {
    tool: "wbStego",
    description: "Whitespace/bit steganography tool",
    fileTypes: ["bmp", "txt", "html", "pdf"],
    technique: "Bit manipulation in various file formats",
    headerPatterns: [
      { offset: "any", text: "wbStego", description: "wbStego signature string" },
    ],
    statisticalIndicators: [
      "Incremented space counts in text files",
      "Modified low-order bits in BMP pixel data",
    ],
  },
  {
    tool: "Stegano (Python)",
    description: "Python steganography library",
    fileTypes: ["png"],
    technique: "LSB embedding in PNG red channel",
    headerPatterns: [],
    statisticalIndicators: [
      "LSB modifications concentrated in red channel",
      "Sequential pixel modification pattern",
      "Entropy change in red channel LSB plane",
    ],
  },
  {
    tool: "StegSolve",
    description: "Image analysis and steganography solver",
    fileTypes: ["png", "bmp", "gif", "jpg"],
    technique: "Bit plane analysis and extraction",
    headerPatterns: [],
    statisticalIndicators: [
      "Visual artifacts in individual bit planes",
      "Data patterns in specific color channel bit planes",
    ],
  },
  {
    tool: "zsteg",
    description: "PNG/BMP steganography detection tool",
    fileTypes: ["png", "bmp"],
    technique: "Multi-method LSB detection and extraction",
    headerPatterns: [],
    statisticalIndicators: [
      "Detects data in LSB of various channel combinations",
      "Identifies text/binary patterns in bit planes",
      "Checks for OpenStego, LSB, and other methods",
    ],
  },
  {
    tool: "Stegdetect",
    description: "Automated JPEG steganography detection",
    fileTypes: ["jpg"],
    technique: "Statistical detection of JSteg, F5, OutGuess, and others",
    headerPatterns: [],
    statisticalIndicators: [
      "DCT coefficient pair analysis (JSteg detection)",
      "Coefficient count analysis (F5 detection)",
      "Statistical correction detection (OutGuess detection)",
    ],
  },
  {
    tool: "JPHS (JPEG Hide & Seek)",
    description: "JPEG steganography tool",
    fileTypes: ["jpg"],
    technique: "Modified Huffman coding with Blowfish encryption",
    headerPatterns: [],
    statisticalIndicators: [
      "Modified Huffman table structure",
      "Anomalous DCT coefficient distribution after Huffman decode",
    ],
  },
  {
    tool: "Hide4PGP",
    description: "Steganography tool with PGP integration",
    fileTypes: ["bmp", "wav", "voc"],
    technique: "LSB embedding with optional PGP encryption",
    headerPatterns: [],
    statisticalIndicators: [
      "Standard LSB indicators in pixel/audio data",
      "PGP-encrypted payload in LSB stream",
    ],
  },
  {
    tool: "Steganographia",
    description: "Text-based steganography using linguistic methods",
    fileTypes: ["txt"],
    technique: "Linguistic steganography — synonym substitution, text generation",
    headerPatterns: [],
    statisticalIndicators: [
      "Unusual synonym choices in natural text",
      "Statistical deviation from normal text patterns",
      "N-gram frequency anomalies",
    ],
  },
  {
    tool: "SpamMimic",
    description: "Encodes messages as spam-like text",
    fileTypes: ["txt"],
    technique: "Huffman coding into spam template sentences",
    headerPatterns: [
      { offset: 0, text: "Dear ", description: "SpamMimic often starts with 'Dear' salutation" },
    ],
    statisticalIndicators: [
      "Text follows known SpamMimic template patterns",
      "Repeated phrase structures matching SpamMimic grammar",
    ],
  },
  {
    tool: "Hydan",
    description: "Executable steganography in x86 binaries",
    fileTypes: ["exe", "elf"],
    technique: "Instruction substitution with functionally equivalent opcodes",
    headerPatterns: [],
    statisticalIndicators: [
      "Unusual ratio of equivalent instruction substitutions",
      "Statistical anomaly in opcode distribution",
    ],
  },
  {
    tool: "StegParty",
    description: "Network protocol steganography",
    fileTypes: ["pcap"],
    technique: "Data hidden in TCP/IP header fields (TTL, ID, etc.)",
    headerPatterns: [],
    statisticalIndicators: [
      "Non-standard TTL value patterns",
      "IP ID field shows encoded data patterns",
      "Unusual TCP sequence number patterns",
    ],
  },
  {
    tool: "Covert_TCP",
    description: "TCP/IP covert channel tool",
    fileTypes: ["pcap"],
    technique: "Encodes data in TCP sequence number and IP ID fields",
    headerPatterns: [],
    statisticalIndicators: [
      "TCP sequence numbers encode ASCII values",
      "IP identification field carries payload bits",
    ],
  },
  {
    tool: "image-stego-lsb (npm)",
    description: "Node.js LSB steganography package",
    fileTypes: ["png"],
    technique: "Sequential LSB replacement in RGBA channels",
    headerPatterns: [],
    statisticalIndicators: [
      "Sequential LSB modification across all RGBA channels",
      "Length header in first pixels",
    ],
  },
  {
    tool: "Stegosaurus",
    description: "Python bytecode steganography",
    fileTypes: ["pyc"],
    technique: "Embeds payload in Python bytecode dead zones",
    headerPatterns: [],
    statisticalIndicators: [
      "Unreachable bytecode instructions contain non-NOP data",
      "Payload between code objects",
    ],
  },
  {
    tool: "PDF Stego",
    description: "Generic PDF steganography techniques",
    fileTypes: ["pdf"],
    technique: "Data in unused PDF object fields, whitespace, or font metrics",
    headerPatterns: [],
    statisticalIndicators: [
      "Unused PDF objects with encoded content",
      "Abnormal whitespace patterns in PDF stream",
      "Hidden text layers with zero font size",
    ],
  },
  {
    tool: "EzStego",
    description: "GIF palette-based steganography",
    fileTypes: ["gif"],
    technique: "Palette index LSB modification with sorting",
    headerPatterns: [],
    statisticalIndicators: [
      "Color palette shows luminance-sorted order",
      "LSB of palette indices deviate from expected distribution",
    ],
  },
  {
    tool: "GIFShuffle",
    description: "GIF steganography via palette reordering",
    fileTypes: ["gif"],
    technique: "Encodes data by permuting the GIF color palette",
    headerPatterns: [],
    statisticalIndicators: [
      "Color palette order encodes information",
      "Permutation-based capacity analysis",
    ],
  },
  {
    tool: "Stegpy",
    description: "Python steganography in images and audio",
    fileTypes: ["png", "bmp", "gif", "wav"],
    technique: "LSB encoding with optional encryption",
    headerPatterns: [],
    statisticalIndicators: [
      "Standard LSB indicators",
      "Payload length encoded in first bytes",
    ],
  },
  {
    tool: "BMPSecrets",
    description: "BMP file steganography tool",
    fileTypes: ["bmp"],
    technique: "Data hidden in BMP padding bytes and row alignment",
    headerPatterns: [],
    statisticalIndicators: [
      "Non-zero padding bytes in BMP row alignment",
      "Data in gap between BMP header and pixel data",
    ],
  },
  {
    tool: "StegCracker",
    description: "Steghide passphrase brute-force tool",
    fileTypes: ["jpg", "bmp", "wav", "au"],
    technique: "Dictionary/brute-force attack against Steghide passphrases",
    headerPatterns: [],
    statisticalIndicators: [
      "Used for cracking — same indicators as Steghide",
    ],
  },
  {
    tool: "SSuite Piscel",
    description: "Text-in-image steganography using pixel encoding",
    fileTypes: ["png", "bmp"],
    technique: "Character-to-pixel color mapping",
    headerPatterns: [],
    statisticalIndicators: [
      "Pixel colors correspond to character encodings",
      "Image dimensions correlate with message length",
      "Very low color variety compared to natural images",
    ],
  },
  {
    tool: "BPCS-Steganography",
    description: "Bit-Plane Complexity Segmentation steganography",
    fileTypes: ["png", "bmp"],
    technique: "Replaces complex regions of bit planes with payload",
    headerPatterns: [],
    statisticalIndicators: [
      "Bit plane complexity threshold at exactly 0.3",
      "Anomalous complexity distribution in higher bit planes",
      "Conjugation map artifacts",
    ],
  },
  {
    tool: "SteganPEG",
    description: "JPEG steganography tool for Windows",
    fileTypes: ["jpg"],
    technique: "DCT coefficient modification with password protection",
    headerPatterns: [
      { offset: "any", bytes: [0x53, 0x50], description: "SP marker (SteganPEG)" },
    ],
    statisticalIndicators: [
      "DCT histogram anomalies similar to JSteg",
      "SP marker bytes in JPEG comment or APP segments",
    ],
  },
  {
    tool: "Steg (Android)",
    description: "Android steganography application",
    fileTypes: ["png", "jpg"],
    technique: "LSB embedding with AES-256 encryption",
    headerPatterns: [],
    statisticalIndicators: [
      "AES-encrypted payload in LSB stream",
      "Encrypted data length header in first pixels",
    ],
  },
  {
    tool: "PixelKnot",
    description: "Guardian Project's Android steganography app",
    fileTypes: ["jpg"],
    technique: "F5 algorithm with passphrase-based encryption",
    headerPatterns: [],
    statisticalIndicators: [
      "F5 shrinkage indicators",
      "Same statistical profile as F5 tool",
    ],
  },
  {
    tool: "Matroschka",
    description: "Multi-layer steganography tool",
    fileTypes: ["png"],
    technique: "Recursive LSB embedding with AES encryption layers",
    headerPatterns: [],
    statisticalIndicators: [
      "Multiple layers of LSB encoding",
      "Nested encrypted payloads",
    ],
  },
  {
    tool: "Whitespace Language",
    description: "Programs written in Whitespace programming language",
    fileTypes: ["ws", "txt"],
    technique: "Executable code using only space, tab, and newline characters",
    headerPatterns: [],
    statisticalIndicators: [
      "File contains only space (0x20), tab (0x09), and newline (0x0A) characters",
      "Structured patterns of whitespace forming valid Whitespace programs",
    ],
  },
  {
    tool: "AudioStego",
    description: "Audio steganography using phase coding",
    fileTypes: ["wav"],
    technique: "Phase coding in frequency domain",
    headerPatterns: [],
    statisticalIndicators: [
      "Phase discontinuities in audio segments",
      "Modified phase spectrum compared to original",
    ],
  },
  {
    tool: "Echo Hiding",
    description: "Audio steganography using echo signals",
    fileTypes: ["wav", "mp3"],
    technique: "Encodes bits by introducing echo with specific delay",
    headerPatterns: [],
    statisticalIndicators: [
      "Periodic echo patterns in audio cepstrum",
      "Two distinct echo delay values encoding 0 and 1",
    ],
  },
  {
    tool: "Spread Spectrum Stego",
    description: "Spread spectrum audio/image steganography",
    fileTypes: ["wav", "png", "bmp"],
    technique: "Spread spectrum modulation of cover signal",
    headerPatterns: [],
    statisticalIndicators: [
      "Slight increase in noise floor",
      "Correlation with known spreading sequences",
    ],
  },
  {
    tool: "Invoke-PSImage",
    description: "PowerShell script hidden in PNG images",
    fileTypes: ["png"],
    technique: "PowerShell payload encoded in PNG pixel LSBs",
    headerPatterns: [],
    statisticalIndicators: [
      "LSB extraction yields valid PowerShell script",
      "Payload starts with PowerShell IEX patterns",
      "Image size correlates with typical PS payload sizes",
    ],
  },
  {
    tool: "steganography.js",
    description: "JavaScript canvas-based steganography",
    fileTypes: ["png"],
    technique: "LSB encoding via HTML5 Canvas API",
    headerPatterns: [],
    statisticalIndicators: [
      "LSB modifications in RGB channels (alpha preserved)",
      "Sequential pixel modification pattern",
    ],
  },
];
