<p align="center">
  <strong>English</strong> |
  <a href="docs/readme/README.zh.md">中文</a> |
  <a href="docs/readme/README.zh-TW.md">繁體中文</a> |
  <a href="docs/readme/README.ko.md">한국어</a> |
  <a href="docs/readme/README.ja.md">日本語</a> |
  <a href="docs/readme/README.de.md">Deutsch</a> |
  <a href="docs/readme/README.es.md">Español</a> |
  <a href="docs/readme/README.fr.md">Français</a> |
  <a href="docs/readme/README.it.md">Italiano</a> |
  <a href="docs/readme/README.da.md">Dansk</a> |
  <a href="docs/readme/README.no.md">Norsk</a> |
  <a href="docs/readme/README.pl.md">Polski</a> |
  <a href="docs/readme/README.ru.md">Русский</a> |
  <a href="docs/readme/README.bs.md">Bosanski</a> |
  <a href="docs/readme/README.uk.md">Українська</a> |
  <a href="docs/readme/README.pt-BR.md">Português (BR)</a> |
  <a href="docs/readme/README.ar.md">العربية</a> |
  <a href="docs/readme/README.th.md">ไทย</a> |
  <a href="docs/readme/README.tr.md">Türkçe</a> |
  <a href="docs/readme/README.bn.md">বাংলা</a> |
  <a href="docs/readme/README.hi.md">हिन्दी</a> |
  <a href="docs/readme/README.el.md">Ελληνικά</a> |
  <a href="docs/readme/README.vi.md">Tiếng Việt</a>
</p>

<div align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/banner-light.svg">
    <img alt="steganography-mcp" src="docs/banner-dark.svg" width="830">
  </picture>
</div>

<h3 align="center">The most comprehensive steganography analysis toolkit for AI agents.</h3>

<p align="center">
  LSB detection, chi-square steganalysis, RS analysis, DCT forensics, F5/JSteg/OutGuess detection, BPCS analysis, video &amp; GIF steganography, network covert channels, MP3 stego, spread spectrum watermarks, archive stego, QR code analysis, audio steganography, zero-width text encoding, file forensics, polyglot detection, encoding identification &mdash; unified into a single MCP server.<br>
  <b>128 tools. 17 categories. 4 dependencies. 100% offline.</b> Zero API keys required. Every tool runs locally.
</p>

<br>

<p align="center">
  <a href="#the-problem">The Problem</a> &bull;
  <a href="#how-its-different">How It's Different</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#what-the-ai-can-do">What The AI Can Do</a> &bull;
  <a href="#tools-reference-128-tools">Tools (128)</a> &bull;
  <a href="#cli-usage">CLI Usage</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="MCP Compatible">
  <img src="https://img.shields.io/badge/tools-128-cyan" alt="128 Tools">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Zero API Keys">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="GitHub stars"></a>
</p>

---

## The Problem

Steganography is the art of hiding data in plain sight &mdash; inside images, audio files, documents, and even Unicode text. It is used in CTF competitions, digital forensics investigations, covert communication channels, and malware payloads. Detecting it requires a combination of statistical analysis, format-specific parsing, entropy measurement, and domain expertise.

```
Traditional steganography analysis workflow:
  detect image stego          ->  zsteg + stegsolve (2 tools, Ruby + Java)
  chi-square analysis         ->  custom Python script
  RS analysis                 ->  custom MATLAB/Python code
  JPEG DCT forensics          ->  stegdetect (abandoned C tool from 2004)
  extract LSB data            ->  zsteg + steghide + openstego (3 tools)
  audio steganography         ->  Audacity manual + custom scripts
  zero-width text detection   ->  web-based tools + manual inspection
  file forensics / binwalk    ->  binwalk + foremost + xxd (3 tools)
  EXIF metadata               ->  exiftool (Perl dependency)
  encoding detection          ->  CyberChef web UI + manual guessing
  ─────────────────────────────────
  Total: 10+ tools, 5+ languages, hours of manual correlation
```

**steganography-mcp** gives your AI agent 128 tools across 17 categories via the [Model Context Protocol](https://modelcontextprotocol.io). The agent performs image steganalysis, advanced JPEG forensics (F5/JSteg/OutGuess/PVD detection), BPCS analysis, video &amp; GIF steganography, network covert channel detection, MP3 stego, spread spectrum watermark detection, archive stego, QR code analysis, audio analysis, text steganography detection, file forensics, document analysis, and encoding identification &mdash; all in a single conversation, all running 100% locally with zero dependencies on external services.

```
With steganography-mcp:
  You: "Analyze this CTF challenge image for hidden data"

  Agent: -> img_detect: Chi-square p=0.0001 (LSB embedding detected),
            RS analysis estimates 42% embedding rate, entropy anomaly
            in lower-right quadrant
         -> img_lsb_extract: Extracted 847 bytes from RGB LSBs
         -> crypto_detect: Extracted data is Base64-encoded
         -> crypto_decode: Decoded to "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Signature match for OpenStego

         "The image contains LSB steganography embedded with OpenStego.
          Chi-square test confirms LSB replacement in all three RGB
          channels with 42% embedding rate. The hidden payload is
          Base64-encoded and decodes to the flag:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## How It's Different

Most steganography tools are single-purpose utilities. steganography-mcp gives your AI agent the ability to **reason across all steganography techniques simultaneously**.

<table>
<thead>
<tr>
<th></th>
<th>Traditional Approach</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>10+ CLI tools, 5+ languages, web UIs</td>
<td>MCP &mdash; AI agent calls tools conversationally</td>
</tr>
<tr>
<td><b>Coverage</b></td>
<td>One technique at a time</td>
<td>17 categories, 128 tools in parallel</td>
</tr>
<tr>
<td><b>Image analysis</b></td>
<td>zsteg (Ruby), stegsolve (Java), custom scripts</td>
<td>Agent runs chi-square, RS analysis, SPA, entropy map, histogram, bit plane extraction, metadata, and tool signature detection &mdash; all at once</td>
</tr>
<tr>
<td><b>JPEG forensics</b></td>
<td>stegdetect (abandoned), manual DCT inspection</td>
<td>Agent analyzes DCT histogram, double compression, quantization tables, EXIF deep analysis, thumbnail comparison, comment fields</td>
</tr>
<tr>
<td><b>Audio stego</b></td>
<td>Audacity + manual LSB scripts</td>
<td>Agent performs LSB chi-square, spectrum analysis, silence region LSB check, echo hiding detection, metadata extraction</td>
</tr>
<tr>
<td><b>Text stego</b></td>
<td>Web-based tools, manual inspection</td>
<td>Agent detects zero-width chars, whitespace encoding, invisible Unicode, homoglyphs, acrostics &mdash; and can embed/extract ZWC messages</td>
</tr>
<tr>
<td><b>Dependencies</b></td>
<td>Ruby, Java, Perl, Python, C, web tools</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 dependencies, pure TypeScript</td>
</tr>
<tr>
<td><b>API keys</b></td>
<td>N/A (but fragmented toolchain)</td>
<td>Zero. 100% offline, no external calls</td>
</tr>
<tr>
<td><b>Output</b></td>
<td>Raw text, images, manual correlation</td>
<td>Structured JSON &mdash; AI correlates findings automatically</td>
</tr>
</tbody>
</table>

---

## Quick Start

### Option 1: npx (no install)

```bash
npx -y steganography-mcp
```

All 128 tools work immediately. No API keys. No configuration. 100% offline.

### Option 2: bunx (faster)

```bash
bunx steganography-mcp
```

### Option 3: Clone

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Connect to your AI agent

<details open>
<summary><b>Claude Code</b></summary>

```bash
# With npx
claude mcp add steganography -- npx -y steganography-mcp

# With local clone
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "steganography": {
      "command": "npx",
      "args": ["-y", "steganography-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Cursor / Windsurf / other MCP clients</b></summary>

Same JSON config format. Point the command to `npx -y steganography-mcp` or your local installation path.

</details>

### Start analyzing

```
You: "Check this image for hidden data"
```

That's it. The agent runs chi-square analysis, RS analysis, entropy mapping, metadata extraction, appended data detection, and tool signature scanning &mdash; automatically.

---

## What The AI Can Do

### CTF Challenge Solver

```
You: "Solve this CTF steganography challenge — the image is at challenge.png"

Agent: -> img_detect: Chi-square steganalysis detects LSB embedding
          (p=0.00012), RS analysis estimates 38% embedding rate,
          entropy anomaly at blocks (12,4)-(15,8)
       -> img_lsb_extract: Extracted 1,247 bytes from RGB channel LSBs
       -> crypto_detect: Data matches Base64 pattern (confidence: 0.95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: OpenStego signature detected in PNG chunks

       "Found the flag: CTF{st3g0_master}
        The image uses LSB steganography embedded by OpenStego.
        The payload was Base64-encoded in the RGB least significant
        bits with a 38% embedding rate."
```

### Digital Forensics Investigation

```
You: "Analyze suspect.png and suspect.wav for covert communication"

Agent: -> img_detect: No LSB stego detected, but appended data found
          (12,847 bytes after PNG IEND marker)
       -> file_identify: Appended data starts with ZIP signature (PK)
       -> img_metadata: PNG tEXt chunk contains unusual key "comm"
          with Base64 value
       -> audio_detect: WAV file has LSB chi-square anomaly (p=0.003)
       -> audio_silence: 3 silent sections with active LSBs detected
       -> audio_lsb_extract: Extracted 2,048 bytes of hidden data

       "Both files contain hidden data:
        1. suspect.png has a ZIP archive appended after the PNG EOF
           marker, plus a Base64-encoded message in metadata
        2. suspect.wav contains LSB steganography, specifically in
           silent sections — a strong indicator of intentional hiding.
        Recommend extracting the ZIP and analyzing WAV payload."
```

### Zero-Width Text Detection

```
You: "This email looks normal but might have hidden text"

Agent: -> text_detect: 847 zero-width characters detected between
          visible characters
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) found at 127
          positions throughout the text
       -> text_zwc_extract: Binary decoding yields "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 additional invisible Unicode chars
          (U+2060, U+FEFF) found in header section

       "The email contains a hidden message encoded with zero-width
        characters: 'EXFIL-ROUTE-7'. 847 invisible characters are
        dispersed throughout the visible text using ZWSP/ZWNJ binary
        encoding. Additionally, 3 Word Joiner and BOM characters
        were found in the header — likely metadata artifacts."
```

### JPEG Forensic Analysis

```
You: "Is this JPEG image authentic or has it been tampered with?"

Agent: -> jpeg_structure: 14 markers parsed, normal JFIF structure
       -> jpeg_double_compression: Double compression DETECTED —
          blocking artifact score 0.73, quantization anomaly ratio 0.81
       -> jpeg_quantization: Quality ~75 (luminance), but residual
          patterns suggest original was quality ~92
       -> jpeg_exif_deep: EXIF says "iPhone 14 Pro" but Software
          field says "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Thumbnail dimensions do NOT match
          main image (thumbnail: 4032x3024, main: 2048x1536)

       "This JPEG has been tampered with. Evidence:
        1. Double compression detected — the image was decoded and
           re-encoded at lower quality (original ~92, current ~75)
        2. EXIF claims iPhone 14 Pro but software field reveals
           Photoshop editing
        3. Thumbnail is from the original 4032x3024 capture but
           the main image was resized to 2048x1536
        All three findings independently confirm post-capture
        modification."
```

---

## Tools Reference (128 tools)

### Category Overview

| Category | Tools | Description |
|----------|-------|-------------|
| [Image Steganalysis](#-image-steganalysis-14) | 14 | LSB detection, chi-square, RS analysis, entropy mapping, bit planes, histogram, metadata, tool signatures |
| [JPEG Analysis](#-jpeg-analysis-7) | 7 | DCT histogram, double compression, quantization tables, deep EXIF, thumbnail forensics, comment analysis |
| [Advanced JPEG](#-advanced-jpeg-7) | 7 | F5, JSteg, OutGuess, PVD detection, sliding window chi-square, crop-recalibrate steganalysis, tool compatibility |
| [Audio Steganalysis](#-audio-steganalysis-7) | 7 | WAV LSB detection, spectrum analysis, silence region analysis, echo hiding, metadata extraction |
| [Text & Unicode](#-text--unicode-10) | 10 | Zero-width chars, whitespace encoding, invisible Unicode, homoglyphs, acrostics, Unicode analysis |
| [File Forensics](#-file-forensics-10) | 10 | Magic bytes, polyglot detection, embedded files, appended data, entropy, hex dump, strings, headers |
| [Document Analysis](#-document-analysis-5) | 5 | PDF hidden content, PDF metadata, PDF streams, HTML hidden content, XML metadata |
| [Encoding & Crypto](#-encoding--crypto-7) | 7 | Encoding detection, multi-format decoder, frequency analysis, entropy, XOR brute-force, hash ID, cipher patterns |
| [Video Steganography](#-video-steganography-8) | 8 | AVI frame LSB, inter-frame analysis, frame comparison, metadata, structure, EOF data |
| [GIF Steganography](#-gif-steganography-8) | 8 | Palette LSB, LZW sub-block entropy, comment extensions, application extensions, frame analysis |
| [Network Steganography](#-network-steganography-8) | 8 | PCAP covert channels, IP/TCP header analysis, ICMP payloads, DNS tunneling, HTTP headers, timing |
| [MP3 Steganography](#-mp3-steganography-7) | 7 | ID3 hidden data, frame analysis, padding manipulation, sample analysis, metadata, structure |
| [Spread Spectrum](#-spread-spectrum-5) | 5 | DFT magnitude spectrum, autocorrelation, watermark detection, noise floor analysis, patchwork detection |
| [BPCS Analysis](#-bpcs-analysis-5) | 5 | Bit-plane complexity segmentation, complexity mapping, threshold analysis, data extraction, capacity estimation |
| [Archive Steganography](#-archive-steganography-7) | 7 | ZIP slack spaces, extra fields, comments, polyglot detection, structure analysis, metadata |
| [Create & Embed](#-create--embed-7) | 7 | EOF injection, metadata injection, whitespace encoding, null cipher, polyglot creation, comment injection, palette embedding |
| [QR Code Steganography](#-qr-code-steganography-6) | 6 | QR stego detection, structure analysis, ECC capacity, module analysis, data extraction, comparison |

---

<details open>
<summary><h3>Image Steganalysis (14)</h3></summary>

| Tool | Description |
|------|-------------|
| `img_detect` | Auto-detect steganography in an image. Runs chi-square, RS analysis, entropy, metadata, appended data, and tool signature checks. Returns a comprehensive JSON report |
| `img_lsb_detect` | Statistical LSB steganography detection. Runs chi-square and sample pair analysis on each color channel independently |
| `img_lsb_extract` | Extract hidden data from image LSBs. Extracts bits from specified channels and bit plane, attempts UTF-8 decode, and shows hex dump |
| `img_lsb_embed` | Embed a message into an image using LSB steganography. Reads a PNG file, embeds the message into the least significant bits, and writes a new PNG file |
| `img_bitplane` | Extract and visualize a specific bit plane from an image channel. Shows dimensions, percentage of 1-bits, and an ASCII art preview |
| `img_chi_square` | Chi-square steganalysis attack on each color channel independently. Detects LSB replacement by testing whether adjacent pixel value pairs are equalized |
| `img_rs_analysis` | RS (Regular-Singular) steganalysis using the Fridrich-Goljan-Du method. Analyzes pixel groups to estimate LSB embedding rate per channel |
| `img_histogram` | Generate a pixel value histogram with anomaly detection. Detects Pairs-of-Values (PoV) anomalies that indicate LSB steganography |
| `img_entropy_map` | Per-block entropy analysis of an image. Splits the image into blocks and calculates Shannon entropy per block, flagging high-entropy regions |
| `img_metadata` | Deep metadata extraction from an image. For PNG: text chunks, chunk list, IHDR info. For JPEG: EXIF, comments, quantization tables, marker list |
| `img_appended_data` | Detect and extract data appended after the image EOF marker. Checks for hidden data past PNG IEND, JPEG EOI, or BMP file size boundary |
| `img_compare` | Pixel-by-pixel comparison of two images. Reports identical/different pixel counts, max difference, and which channels are affected |
| `img_channel_analysis` | Per-channel statistical analysis for R, G, B, and A channels. Reports mean, standard deviation, entropy, min, max, and unique value count |
| `img_known_tools` | Scan image file bytes for known steganography tool signatures. Checks against a database of patterns from OpenStego, Steghide, JSteg, F5, and others |

</details>

<details>
<summary><h3>JPEG Analysis (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `jpeg_structure` | Parse JPEG markers/segments with offsets and sizes. Shows internal structure including all markers, positions, and segment lengths |
| `jpeg_dct_histogram` | DCT coefficient distribution analysis for steganography detection. Analyzes Y-channel pixel value distribution and SOS entropy data to detect anomalies caused by JSteg, F5, and OutGuess |
| `jpeg_double_compression` | Detect double JPEG compression artifacts. Identifies characteristic blocking artifacts and quantization table anomalies &mdash; a common indicator of image tampering or stego embedding |
| `jpeg_quantization` | Quantization table analysis with quality estimation. Displays all quantization tables in 8x8 grid format and estimates the JPEG quality factor |
| `jpeg_exif_deep` | Deep EXIF analysis including GPS coordinates, timestamps, software info, thumbnails, maker notes, and all IFD entries. Flags forensically interesting fields |
| `jpeg_thumbnail_compare` | Compare EXIF thumbnail against the main JPEG image. Dimension or content mismatch indicates post-capture modification &mdash; a common forensic artifact |
| `jpeg_comment` | Extract and analyze JPEG COM (comment) markers. Checks for hidden data patterns, unusually large comments, and high-entropy content |

</details>

<details>
<summary><h3>Audio Steganalysis (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `audio_detect` | Auto-detect audio steganography in a WAV file. Runs LSB chi-square, entropy analysis, metadata inspection, and checks for appended data |
| `audio_lsb_detect` | PCM sample LSB statistical analysis. Performs chi-square test on LSBs grouped by value pairs to detect LSB replacement steganography |
| `audio_lsb_extract` | Extract LSB data from audio samples. Reads the least significant bit of each PCM sample and attempts to decode hidden data |
| `audio_spectrum` | Spectral analysis for hidden signals in WAV audio. Analyzes sample value distribution, zero-crossing rate, RMS energy per block, and detects anomalous quiet sections |
| `audio_metadata` | Extract metadata from a WAV file including RIFF INFO chunks, format details, and all chunk information |
| `audio_silence` | Analyze silent sections in WAV audio for hidden data. Finds near-zero sample regions and checks their LSBs &mdash; silent sections with active LSBs are a strong stego indicator |
| `audio_echo_detect` | Echo hiding detection via autocorrelation analysis. Computes normalized autocorrelation at common echo delays. Regular echo patterns indicate steganographic echo hiding |

</details>

<details>
<summary><h3>Text & Unicode (10)</h3></summary>

| Tool | Description |
|------|-------------|
| `text_detect` | Auto-detect text steganography. Checks for zero-width characters, whitespace encoding, invisible Unicode, homoglyphs, and unusual patterns |
| `text_zwc_detect` | Detect zero-width characters (ZWSP, ZWNJ, ZWJ, BOM) in text. Reports positions, counts, and potential encoded message length |
| `text_zwc_extract` | Decode a zero-width character encoded message. Extracts ZWC chars and decodes binary: ZWSP=0, ZWNJ=1 (attempts both polarities) |
| `text_zwc_embed` | Embed a secret message into cover text using zero-width characters. Encodes message to binary and maps bits to ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detect whitespace encoding in text. Checks each line for trailing whitespace patterns where space=0 and tab=1 might encode binary data |
| `text_whitespace_extract` | Extract a whitespace-encoded message from text. Reads trailing whitespace from each line and decodes space=0/tab=1 binary encoding |
| `text_invisible_scan` | Scan text for ALL invisible Unicode characters. Checks every character against the full invisible character database and reports positions and names |
| `text_homoglyph` | Detect Unicode homoglyph substitutions in text. Identifies non-ASCII characters that visually resemble ASCII letters (Cyrillic a vs Latin a, etc.) |
| `text_unicode_analysis` | Full Unicode character distribution analysis. Categorizes all characters by script block, performs entropy analysis, and detects suspicious script mixing |
| `text_acrostic` | Detect first-letter, first-word, last-letter, last-word, or nth-character patterns (acrostic messages) hidden across lines of text |

</details>

<details>
<summary><h3>File Forensics (10)</h3></summary>

| Tool | Description |
|------|-------------|
| `file_identify` | File type identification via magic bytes. Reads the file header and matches against a comprehensive database of known file signatures. Checks for extension mismatch |
| `file_polyglot` | Detect polyglot files valid as two or more formats simultaneously. Checks for multiple valid file signatures at different offsets (PDF+ZIP, PNG+PDF, etc.) |
| `file_embedded` | Scan for embedded files within a binary, similar to binwalk. Searches for known magic byte signatures at every offset to discover hidden or appended files |
| `file_appended` | Detect data appended after a file's format-specific EOF marker. Supports PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD), and PDF (%%EOF) |
| `file_entropy` | Section-by-section entropy analysis. Calculates Shannon entropy per block and overall, flagging anomalous high-entropy sections |
| `file_entropy_visual` | ASCII entropy visualization of a file. Renders a text-based bar chart showing entropy levels across the file for visual anomaly detection |
| `file_strings` | Extract printable and Unicode strings from binary files. Scans for runs of printable characters and reports them with file offsets. Supports ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex dump with ASCII sidebar display. Traditional hex editor format with offset addresses, hex bytes, and printable ASCII representation |
| `file_header` | Deep header and structure analysis for known formats. Parses PNG IHDR, JPEG SOF, BMP info header, ZIP local file headers, and PDF version/metadata |
| `file_compare` | Binary diff between two files. Byte-by-byte comparison reporting differences with offsets, percentage identical, and LSB-only difference detection for stego analysis |

</details>

<details>
<summary><h3>Document Analysis (5)</h3></summary>

| Tool | Description |
|------|-------------|
| `doc_pdf_hidden` | Hidden PDF content detection. Scans for JavaScript, auto-actions, OpenAction, hidden annotations, invisible text, embedded files, and other covert content |
| `doc_pdf_metadata` | PDF metadata extraction. Parses the /Info dictionary and XMP metadata blocks for forensic attribution and document provenance analysis |
| `doc_pdf_streams` | PDF stream analysis. Locates all stream/endstream blocks, attempts zlib decompression, and reports sizes and entropy for finding hidden data |
| `doc_html_hidden` | Hidden HTML content detection. Scans for comments, display:none elements, data-* attributes, hidden inputs, base64 content, zero-size elements, and invisible text |
| `doc_xml_metadata` | XML and Office document metadata extraction. Parses Dublin Core, Microsoft Office properties, processing instructions, and other metadata fields |

</details>

<details>
<summary><h3>Encoding & Crypto (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `crypto_detect` | Auto-detect encoding type of an input string. Tests against all known patterns (Base64, hex, binary, morse, URL encoding, HTML entities, etc.) and returns matches sorted by confidence |
| `crypto_decode` | Multi-format decoder supporting Base64, hex, binary, decimal, octal, URL encoding, ROT13, Base32, Morse code, and HTML entities. Auto mode detects encoding first |
| `crypto_frequency` | Character frequency analysis for cryptanalysis. Counts character occurrences, compares to standard English frequency (ETAOINSHRDLU), and calculates Index of Coincidence |
| `crypto_entropy` | Shannon entropy calculation and classification for strings. Computes character-level and byte-level entropy, classifying into categories from repeated data to encrypted/random |
| `crypto_xor` | XOR key brute-force for single-byte and multi-byte keys. Tries all 256 single-byte keys and scores by English text probability. Uses IC for multi-byte key length estimation |
| `crypto_hash_id` | Hash type identification. Matches input against known hash patterns by length and format (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, etc.) |
| `crypto_patterns` | Known cipher and encoding pattern detection. Analyzes text for Caesar cipher, substitution cipher, Vigenere, rail fence transposition, Atbash, and reversed text |

</details>

<details>
<summary><h3>Advanced JPEG (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `jpegadv_f5_detect` | F5 steganography detection. Analyzes DCT coefficient histogram for shrinkage at zero and asymmetric distribution around zero |
| `jpegadv_jsteg_detect` | JSteg detection. Chi-square test on coefficient value pairs, zero AC coefficient preservation analysis |
| `jpegadv_outguess_detect` | OutGuess detection. First-order histogram smoothness, second-order statistics, inter-block correlation analysis |
| `jpegadv_pvd_detect` | Pixel Value Differencing detection. Horizontal/vertical difference histograms, staircase artifacts at PVD range boundaries |
| `jpegadv_chi_sliding` | Sliding window chi-square analysis. Per-window p-values to detect embedding start/end points and estimate message length |
| `jpegadv_calibration` | Crop-recalibrate steganalysis. Compares original vs cropped image statistics to reveal DCT modifications |
| `jpegadv_compatibility` | JPEG stego tool compatibility check. Analyzes markers, quality, encoding type to determine which tools (JSteg, F5, OutGuess, steghide, JPHS) could have been used |

</details>

<details>
<summary><h3>Video Steganography (8)</h3></summary>

| Tool | Description |
|------|-------------|
| `video_detect` | Auto-detect steganography in AVI files. Runs LSB analysis on frames, checks for appended data, analyzes frame size variance |
| `video_frame_lsb` | LSB analysis of a specific video frame. Extracts raw pixel data, checks LSB balance/distribution and entropy |
| `video_frame_extract` | Extract LSB bits from specified frames. Assembles into byte stream with hex dump and text preview |
| `video_frame_compare` | Compare two frames byte-by-byte. Reports MSE, PSNR, max difference, and LSB-only modification detection |
| `video_inter_frame` | Analyze idx1 index entries for keyframe vs delta frame distribution, flag histogram, and size statistics |
| `video_metadata` | Extract AVI metadata: dimensions, FPS, codec, stream details, duration, audio presence |
| `video_structure` | Recursively visualize the RIFF/LIST chunk tree with fourCC codes, offsets, and sizes |
| `video_eof_data` | Detect and analyze data appended after the RIFF container boundary |

</details>

<details>
<summary><h3>GIF Steganography (8)</h3></summary>

| Tool | Description |
|------|-------------|
| `gif_detect` | Auto-detect GIF steganography. Analyzes color table LSBs, appended data, comment extensions, animation anomalies |
| `gif_palette` | Palette analysis: sort order, duplicates, unused entries, luminance distribution, LSB-differing adjacent pairs |
| `gif_palette_lsb` | Extract LSB from each R/G/B channel of the global color table. Per-channel balance and chi-square tests |
| `gif_frame_analysis` | Multi-frame animation analysis: per-frame size, delay times, disposal methods, local color tables |
| `gif_comment` | Extract all comment extensions with text content, entropy, printable ratio, and hex dump |
| `gif_appext` | Application extension analysis. Parses NETSCAPE loop counts, detects non-standard extensions |
| `gif_lzw_analysis` | LZW sub-block entropy analysis per frame. Detects anomalous sub-block sizes and cross-frame entropy outliers |
| `gif_structure` | Visualize complete GIF block structure: header, color tables, extensions, image descriptors, trailer |

</details>

<details>
<summary><h3>Network Steganography (8)</h3></summary>

| Tool | Description |
|------|-------------|
| `net_detect` | Auto-detect network steganography in PCAP files. Runs IP covert field, ICMP payload, DNS tunneling, and timing analysis |
| `net_ip_header` | IP header covert field analysis. TTL patterns, IP identification entropy, TOS/DSCP usage |
| `net_tcp_header` | TCP seq/ack number analysis. ISN analysis, per-flow sequence increments, TCP options, window size variability |
| `net_icmp_payload` | ICMP echo payload analysis. Per-packet entropy, printable content ratio, payload size anomalies |
| `net_dns_tunnel` | DNS tunneling detection. Subdomain length distribution, per-label entropy, TXT record usage, query frequency |
| `net_http_header` | HTTP header covert channel analysis. Custom headers, X-header entropy, cookie value entropy |
| `net_timing` | Inter-packet timing analysis. Interval statistics, timing covert channel detection via binary splitting |
| `net_stats` | PCAP statistics summary. Protocol distribution, top IP pairs, port usage, throughput |

</details>

<details>
<summary><h3>MP3 Steganography (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `mp3_detect` | Auto-detect MP3 steganography. Checks ID3 padding, PRIV frames, pre-audio gaps, trailing data, bitrate anomalies |
| `mp3_frame_analysis` | Frame header analysis. Bitrate distribution, padding bit entropy, frame size statistics, channel mode consistency |
| `mp3_id3_hidden` | ID3v1/v2 hidden data analysis. APIC, PRIV, GEOB frames, unknown frame IDs, padding content inspection |
| `mp3_padding` | Bit reservoir/padding manipulation detection. Pre-audio gaps, inter-frame gaps with per-gap entropy |
| `mp3_sample_analysis` | Statistical analysis of frame sizes. Distribution histogram, entropy of sizes and deltas, outlier detection |
| `mp3_metadata` | Full MP3 metadata extraction. Audio properties, ID3v2 frames with decoded text, file structure layout |
| `mp3_structure` | Frame structure visualization. Per-frame table, bitrate map, and padding bit map |

</details>

<details>
<summary><h3>Spread Spectrum (5)</h3></summary>

| Tool | Description |
|------|-------------|
| `spread_dft_analysis` | DFT magnitude spectrum analysis. Spectral flatness, frequency band energy, dominant frequencies for hidden signal detection |
| `spread_correlation` | Autocorrelation-based detection. Finds periodic embedding patterns, distinguishes natural peaks from suspicious ones |
| `spread_watermark_detect` | Statistical watermark detection. Block-based pixel variance comparison, checkerboard patterns, quadrant uniformity |
| `spread_noise_analysis` | Noise floor embedding detection. Laplacian noise estimation, smooth vs textured region noise comparison |
| `spread_patchwork` | Patchwork watermark detection. Multi-seed PRNG group splitting, statistical hypothesis testing |

</details>

<details>
<summary><h3>BPCS Analysis (5)</h3></summary>

| Tool | Description |
|------|-------------|
| `bpcs_detect` | Auto-detect BPCS embedding. Complexity analysis across all 24 bit planes (8 planes x 3 channels), MSB/LSB trend analysis |
| `bpcs_complexity_map` | Full complexity map with ASCII spatial visualization and distribution histograms for all 8 bit planes |
| `bpcs_threshold` | Threshold sweep analysis from 0.05 to 0.95. Finds optimal BPCS boundary and suspicious complexity patterns |
| `bpcs_extract` | Extract data from complex regions. Gathers bits above threshold in raster-scan order, analyzes for structure |
| `bpcs_capacity` | Estimate BPCS embedding capacity across all channels and planes, accounting for conjugation map overhead |

</details>

<details>
<summary><h3>Archive Steganography (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `archive_detect` | Auto-detect archive steganography. Checks slack spaces, prepended/appended data, unusual extra fields, comments |
| `archive_structure` | ZIP entry structure analysis. Lists all local file headers with offsets, sizes, compression methods, CRC-32 |
| `archive_extra_fields` | Parse extra fields from local and central directory entries. Flags unknown header IDs as potential hiding spots |
| `archive_comment` | Extract archive-level and per-file comments with entropy analysis and hex dumps |
| `archive_slack` | Identify gaps between ZIP entries with size, entropy, printable ratio, and hex dumps |
| `archive_polyglot` | Detect if ZIP has prepended/appended data valid as another format (PDF, PNG, ELF, PE, etc.) |
| `archive_metadata` | Summary of file count, compression ratios, timestamps, version info, encryption flags |

</details>

<details>
<summary><h3>Create & Embed (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `create_eof_inject` | Append data after a file's EOF marker. Takes file_path, data, and output_path |
| `create_metadata` | Inject data into metadata fields. PNG tEXt chunks, JPEG COM segments, generic append |
| `create_whitespace` | Encode data in trailing whitespace (space=0, tab=1) on text file lines |
| `create_null_cipher` | Generate null cipher text. First-letter mode or nth-word arrangement |
| `create_polyglot` | Concatenate two files to create a polyglot valid as both formats |
| `create_comment` | Inject into format-specific comment fields (PNG tEXt, JPEG COM, GIF Comment Extension) |
| `create_palette` | Embed data in palette LSBs for indexed PNG (PLTE) and GIF (Global Color Table) |

</details>

<details>
<summary><h3>QR Code Steganography (6)</h3></summary>

| Tool | Description |
|------|-------------|
| `qr_detect` | Detect steganography in QR code images. Pixel distribution bimodality, LSB randomization, non-pure module values |
| `qr_structure` | QR structure analysis. Finder patterns, version estimation, module size, grid dimensions |
| `qr_ecc_analysis` | Error correction capacity analysis. ECC levels L/M/Q/H, steganographic capacity from sacrificing ECC codewords |
| `qr_module_analysis` | Per-module pixel variance analysis. Clean QR codes should have zero intra-module variance |
| `qr_data_extract` | Extract data region pixels excluding function patterns. Module values, binary string, entropy statistics |
| `qr_compare` | Compare two QR code images. Data region vs function pattern differences, LSB-only modification detection |

</details>

---

## CLI Usage

```bash
# Show help
npx -y steganography-mcp --help

# List all 128 tools with descriptions
npx -y steganography-mcp --list

# Detect steganography in an image
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Extract hidden message from LSBs
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Chi-square steganalysis
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS analysis (Fridrich-Goljan-Du method)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG double compression detection
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Deep EXIF analysis
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Audio steganography detection
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detect zero-width character encoding
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# Embed a hidden message with zero-width characters
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# Identify file type and detect polyglots
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# Scan for embedded files (binwalk-style)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Entropy visualization
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Auto-detect encoding
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detect cipher patterns
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Video steganography detection
npx -y steganography-mcp --tool video_detect '{"file_path":"movie.avi"}'

# GIF palette LSB analysis
npx -y steganography-mcp --tool gif_palette_lsb '{"file_path":"animation.gif"}'

# Network covert channel detection
npx -y steganography-mcp --tool net_dns_tunnel '{"file_path":"capture.pcap"}'

# MP3 hidden data detection
npx -y steganography-mcp --tool mp3_detect '{"file_path":"song.mp3"}'

# F5 JPEG stego detection
npx -y steganography-mcp --tool jpegadv_f5_detect '{"file_path":"suspect.jpg"}'

# BPCS embedding detection
npx -y steganography-mcp --tool bpcs_detect '{"file_path":"image.png"}'

# Archive slack space analysis
npx -y steganography-mcp --tool archive_slack '{"file_path":"archive.zip"}'

# QR code stego detection
npx -y steganography-mcp --tool qr_detect '{"file_path":"qrcode.bmp"}'

# Spread spectrum watermark detection
npx -y steganography-mcp --tool spread_patchwork '{"file_path":"image.png"}'

# Create a polyglot file
npx -y steganography-mcp --tool create_polyglot '{"file1_path":"image.png","file2_path":"secret.zip","output_path":"polyglot.png"}'

# Using Bun (faster startup)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Use Cases

### CTF Challenges
Solve steganography challenges in capture-the-flag competitions. The AI agent can systematically apply all detection techniques &mdash; LSB analysis, metadata inspection, appended data, encoding detection, and cipher identification &mdash; to find hidden flags in images, audio files, documents, and text.

### Digital Forensics
Detect covert communication channels in forensic investigations. Analyze suspect files for hidden data using statistical steganalysis (chi-square, RS analysis), check for data appended after EOF markers, scan for embedded files, and identify steganography tool signatures.

### Security Research
Analyze steganography tools and techniques. Compare original and stego images pixel-by-pixel, study DCT coefficient distributions in JPEG stego, measure entropy changes from embedding, and reverse-engineer encoding schemes.

### Education
Learn how steganography techniques work. Embed and extract LSB messages, encode text with zero-width characters, visualize bit planes and entropy maps, analyze file structures with hex dumps, and study cipher patterns with frequency analysis.

### Incident Response
During incident response, check documents and images for hidden exfiltration channels. Scan PDFs for hidden JavaScript and embedded files, detect zero-width character encoding in emails, identify polyglot files, and analyze suspicious encodings.

---

## Architecture

```
src/
  index.ts                    # CLI entrypoint (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts             # MCP server setup (stdio transport)
    tools.ts                  # Tool registry — all 128 tools assembled here
  types/
    index.ts                  # Shared types (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Binary file reading, hex dump, format detection
    stats.ts                  # Shannon entropy, chi-square, DFT, autocorrelation, BPCS complexity, patchwork test
    cache.ts                  # TTL cache
    png-parser.ts             # Pure TS PNG parser (IHDR, chunks, pixel data)
    jpeg-parser.ts            # Pure TS JPEG parser (markers, EXIF, quantization, DCT coefficients)
    wav-parser.ts             # Pure TS WAV parser (RIFF chunks, PCM samples)
    bmp-parser.ts             # Pure TS BMP parser (header, pixel data)
    avi-parser.ts             # Pure TS AVI/RIFF parser (chunks, streams, idx1, frames)
    gif-parser.ts             # Pure TS GIF89a parser (color tables, extensions, LZW blocks)
    pcap-parser.ts            # Pure TS PCAP parser (IP/TCP/UDP/ICMP/DNS/HTTP)
    mp3-parser.ts             # Pure TS MP3 parser (ID3v1/v2, frame headers)
    zip-parser.ts             # Pure TS ZIP parser (local headers, central directory, extra fields)
  image/                      # Image Steganalysis tools (14)
  jpeg/                       # JPEG Analysis tools (7)
  jpegadv/                    # Advanced JPEG tools (7) — F5, JSteg, OutGuess, PVD
  audio/                      # Audio Steganalysis tools (7)
  text/                       # Text & Unicode tools (10)
  file/                       # File Forensics tools (10)
  document/                   # Document Analysis tools (5)
  crypto/                     # Encoding & Crypto tools (7)
  video/                      # Video Steganography tools (8) — AVI frame analysis
  gif/                        # GIF Steganography tools (8) — palette, LZW, animation
  network/                    # Network Steganography tools (8) — PCAP covert channels
  mp3/                        # MP3 Steganography tools (7) — ID3, padding, frames
  spread/                     # Spread Spectrum tools (5) — DFT, watermark, patchwork
  bpcs/                       # BPCS Analysis tools (5) — bit-plane complexity
  archive/                    # Archive Steganography tools (7) — ZIP slack, extra fields
  create/                     # Create & Embed tools (7) — EOF inject, polyglot, palette
  qrcode/                     # QR Code Steganography tools (6) — ECC, modules, compare
  data/
    encoding-patterns.ts      # Encoding regex patterns + decoders
    magic-bytes.ts            # File signature database (100+ formats)
    stego-signatures.ts       # Known steganography tool signatures
    unicode-invisible.ts      # Invisible Unicode character database
```

**Design decisions:**

- **4 dependencies, nothing else** &mdash; `@modelcontextprotocol/sdk` for the MCP protocol, `zod` for input validation, `pngjs` for PNG pixel access, `jpeg-js` for JPEG decoding. No bloated dependency tree. No native modules. No C bindings. No Python. No Java.
- **100% offline** &mdash; Every tool runs entirely locally. No HTTP requests. No API calls. No telemetry. No cloud dependencies. Your files never leave your machine.
- **Pure TypeScript statistical analysis** &mdash; Chi-square test, RS analysis (Fridrich-Goljan-Du), Sample Pair Analysis, Shannon entropy, DFT, autocorrelation, BPCS border complexity, patchwork test, Index of Coincidence, and frequency analysis are all implemented in pure TypeScript. No external math libraries.
- **11 custom format parsers** &mdash; PNG, JPEG, WAV, BMP, AVI/RIFF, GIF89a, PCAP, MP3/ID3, and ZIP are parsed with zero external dependencies using the `utils/` parsers. This allows deep format-specific analysis that general-purpose libraries cannot provide.
- **17 providers, 1 server** &mdash; Each analysis category is an independent module. The AI agent picks which tools to use based on the investigation context.
- **Clean ToolDef pattern** &mdash; Every tool follows the same `{ name, description, schema, execute }` pattern. Adding a new tool is a single object in the appropriate module.
- **Zod validation on every field** &mdash; Every schema field has `.describe()` for AI agent context. Invalid inputs are caught before execution with clear error messages.

---

## Part of the MCP Security Suite

| Project | Domain | Tools |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Browser-based security testing | 39 tools |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud security (AWS/Azure/GCP) | 38 tools |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub security posture | 39 tools |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Vulnerability intelligence | 23 tools |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & reconnaissance | 37 tools |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & threat intelligence | 66 tools |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS security intelligence | 103 tools |
| **steganography-mcp** | **Steganography analysis** | **128 tools** |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

<p align="center">
<b>For authorized security research and educational purposes only.</b><br>
Always ensure you have proper authorization before performing steganography analysis on files you do not own.
</p>

<p align="center">
  <a href="LICENSE">MIT License</a> &bull; Built by <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
