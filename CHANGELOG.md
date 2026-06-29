# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2025-06-29

### Added

Initial release with **60 tools** across **7 categories** for comprehensive steganography analysis.

#### Image Steganalysis (14 tools)

- `img_detect` — Auto-detect steganography in an image via chi-square, RS analysis, entropy, metadata, appended data, and tool signature checks
- `img_lsb_detect` — Statistical LSB steganography detection using chi-square and sample pair analysis on each color channel
- `img_lsb_extract` — Extract hidden data from image LSBs with configurable channels, bit plane, and pixel traversal order
- `img_lsb_embed` — Embed a secret message into a PNG image using LSB steganography with length header
- `img_bitplane` — Extract and visualize a specific bit plane from an image channel with ASCII art preview
- `img_chi_square` — Chi-square steganalysis attack on each color channel to detect LSB replacement
- `img_rs_analysis` — RS (Regular-Singular) steganalysis using the Fridrich-Goljan-Du method to estimate LSB embedding rate
- `img_histogram` — Pixel value histogram with Pairs-of-Values anomaly detection for LSB steganography
- `img_entropy_map` — Per-block entropy analysis with ASCII entropy map visualization and anomaly flagging
- `img_metadata` — Deep metadata extraction for PNG (chunks, text entries, IHDR) and JPEG (EXIF, comments, quantization tables)
- `img_appended_data` — Detect and extract data appended after image EOF markers (PNG IEND, JPEG EOI, BMP boundary)
- `img_compare` — Pixel-by-pixel comparison of two images with LSB-only change detection for steganographic modifications
- `img_channel_analysis` — Per-channel statistical analysis (mean, stddev, entropy, LSB balance) for R, G, B, and A channels
- `img_known_tools` — Scan image bytes for known steganography tool signatures (OpenStego, Steghide, JSteg, F5, OutGuess, etc.)

#### JPEG Analysis (7 tools)

- `jpeg_structure` — Parse JPEG markers and segments with offsets, sizes, and appended data detection
- `jpeg_dct_histogram` — DCT coefficient distribution analysis and SOS entropy analysis for detecting JSteg, F5, and OutGuess
- `jpeg_double_compression` — Detect double JPEG compression artifacts via quantization table anomaly analysis
- `jpeg_quantization` — Quantization table analysis with precise JPEG quality estimation and standard table comparison
- `jpeg_exif_deep` — Deep EXIF analysis including GPS, timestamps, software, thumbnails, and forensic flag detection
- `jpeg_thumbnail_compare` — Compare EXIF thumbnail against main image to detect post-capture modifications
- `jpeg_comment` — Extract and analyze JPEG COM markers for hidden data patterns, high entropy, and tool signatures

#### Audio Steganalysis (7 tools)

- `audio_detect` — Auto-detect audio steganography in WAV files via LSB chi-square, entropy, metadata, and appended data checks
- `audio_lsb_detect` — PCM sample LSB statistical analysis with chi-square test and block-level analysis for partial embedding detection
- `audio_lsb_extract` — Extract LSB data from WAV audio samples with UTF-8 decode attempt and hex dump
- `audio_spectrum` — Spectral analysis for hidden signals including zero-crossing rate, RMS energy, and quiet-section anomaly detection
- `audio_metadata` — Extract WAV metadata including RIFF INFO chunks, format details, all chunks, and trailing data
- `audio_silence` — Analyze silent sections for hidden data by checking LSB activity in near-zero sample regions
- `audio_echo_detect` — Echo hiding detection via autocorrelation analysis at common echo delays with block-level bit encoding detection

#### Text & Unicode (10 tools)

- `text_detect` — Auto-detect text steganography including zero-width characters, whitespace encoding, invisible Unicode, and homoglyphs
- `text_zwc_detect` — Detect zero-width characters (ZWSP, ZWNJ, ZWJ, BOM) with positions, clusters, and message size estimates
- `text_zwc_extract` — Decode zero-width character encoded messages using binary (ZWSP/ZWNJ) and base-4 encoding schemes
- `text_zwc_embed` — Embed a secret message into cover text using zero-width character binary encoding
- `text_whitespace_detect` — Detect whitespace encoding patterns in trailing whitespace (space=0, tab=1 binary encoding)
- `text_whitespace_extract` — Extract and decode whitespace-encoded messages from trailing space/tab patterns
- `text_invisible_scan` — Scan text for all invisible Unicode characters with category classification and distribution analysis
- `text_homoglyph` — Detect Unicode homoglyph substitutions (Cyrillic/Greek/Fullwidth characters mimicking ASCII)
- `text_unicode_analysis` — Full Unicode character distribution analysis with entropy, script mixing detection, and anomaly flagging
- `text_acrostic` — Detect acrostic patterns (first-letter, first-word, last-letter, last-word, nth-character) across lines of text

#### File Forensics (10 tools)

- `file_identify` — File type identification via magic bytes with extension mismatch detection
- `file_polyglot` — Detect polyglot files valid as multiple formats simultaneously (e.g., PDF+ZIP, PNG+PDF)
- `file_embedded` — Scan for embedded files within binaries via magic byte search at every offset (binwalk-like)
- `file_appended` — Detect data appended after format-specific EOF markers (PNG IEND, JPEG FFD9, BMP, ZIP EOCD, PDF %%EOF)
- `file_entropy` — Section-by-section Shannon entropy analysis with block classification and anomaly detection
- `file_entropy_visual` — ASCII entropy visualization with text-based bar chart for spotting high-entropy regions
- `file_strings` — Extract printable strings from binary files with offset tracking (ASCII, UTF-8, UTF-16 support)
- `file_hex` — Hex dump with ASCII sidebar display for manual binary inspection
- `file_header` — Deep header and structure analysis for PNG, JPEG, BMP, ZIP, and PDF formats
- `file_compare` — Binary diff between two files with LSB-only difference detection for steganographic modifications

#### Document Analysis (5 tools)

- `doc_pdf_hidden` — Hidden PDF content detection including JavaScript, auto-actions, invisible text, embedded files, and XFA forms
- `doc_pdf_metadata` — PDF metadata extraction from /Info dictionary and XMP blocks with forensic attribution analysis
- `doc_pdf_streams` — PDF stream analysis with zlib decompression and entropy measurement for hidden data detection
- `doc_html_hidden` — Hidden HTML content detection including comments, display:none, data-* attributes, base64 embeds, and zero-size elements
- `doc_xml_metadata` — XML and Office document metadata extraction including Dublin Core, Office properties, and processing instructions

#### Encoding & Crypto (7 tools)

- `crypto_detect` — Auto-detect encoding type (Base64, hex, binary, Morse, URL encoding, etc.) with confidence scoring and decoding
- `crypto_decode` — Multi-format decoder supporting Base64, hex, binary, decimal, octal, URL, ROT13, Base32, Morse, and HTML entities
- `crypto_frequency` — Character frequency analysis with English letter frequency comparison and Index of Coincidence calculation
- `crypto_entropy` — Shannon entropy calculation and classification for strings (character-level and byte-level)
- `crypto_xor` — XOR key brute-force for single-byte and multi-byte keys with English text scoring
- `crypto_hash_id` — Hash type identification matching input against known patterns (MD5, SHA-1, SHA-256, bcrypt, etc.)
- `crypto_patterns` — Known cipher pattern detection (Caesar, substitution, Vigenere, rail fence, Atbash, reversed text)

### Infrastructure

- MCP server with stdio transport via `@modelcontextprotocol/sdk`
- TypeScript strict mode with ESM modules
- Zod-based input validation with descriptive schemas
- PNG pixel access via `pngjs`, JPEG decoding via `jpeg-js`
- Custom binary parsers for PNG chunks, JPEG markers, BMP headers, WAV/RIFF audio
- 100% local analysis — zero API keys required
- CLI mode with `--list`, `--tool`, and `--help` flags
- Configurable max file size and temp directory via environment variables

[0.1.0]: https://github.com/badchars/steganography-mcp/releases/tag/v0.1.0
