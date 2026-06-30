# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2025-06-29

### Added

Expanded from **60 tools** across **7 categories** to **128 tools** across **17 categories**.

#### Video Steganography (8 tools)

- `video_detect` — Auto-detect steganography in AVI video files
- `video_frame_lsb` — LSB analysis of a specific video frame
- `video_frame_extract` — Extract LSB data from video frames
- `video_frame_compare` — Compare adjacent video frames for pixel-level anomalies
- `video_inter_frame` — Analyze frame types from the AVI idx1 index
- `video_metadata` — Extract metadata from AVI video files
- `video_structure` — Visualize AVI/RIFF chunk structure as a tree
- `video_eof_data` — Detect data appended after AVI RIFF container EOF

#### GIF Steganography (8 tools)

- `gif_detect` — Auto-detect steganography in GIF files
- `gif_palette` — Analyze GIF global color table for steganographic indicators
- `gif_palette_lsb` — Extract and analyze LSB patterns from GIF color table entries
- `gif_frame_analysis` — Analyze multi-frame GIF animation properties
- `gif_comment` — Extract and analyze GIF comment extensions
- `gif_appext` — Analyze GIF application extensions
- `gif_lzw_analysis` — Analyze LZW compressed sub-block sizes and entropy
- `gif_structure` — Visualize GIF block structure

#### Network Steganography (8 tools)

- `net_detect` — Auto-detect network steganography in PCAP files
- `net_ip_header` — IP header covert field analysis
- `net_tcp_header` — TCP sequence/acknowledgment number analysis
- `net_icmp_payload` — ICMP echo payload analysis
- `net_dns_tunnel` — DNS tunneling detection
- `net_http_header` — HTTP header covert channel analysis
- `net_timing` — Inter-packet timing analysis
- `net_stats` — PCAP statistics summary

#### MP3 Steganography (7 tools)

- `mp3_detect` — Auto-detect MP3 steganography
- `mp3_frame_analysis` — MP3 frame header analysis
- `mp3_id3_hidden` — ID3v1/v2 hidden data analysis
- `mp3_padding` — Bit reservoir and padding manipulation detection
- `mp3_sample_analysis` — Statistical analysis of decoded MP3 frame sizes
- `mp3_metadata` — Full MP3 metadata extraction
- `mp3_structure` — MP3 frame structure visualization

#### Advanced JPEG (7 tools)

- `jpegadv_f5_detect` — F5 steganography detection
- `jpegadv_jsteg_detect` — JSteg steganography detection
- `jpegadv_outguess_detect` — OutGuess steganography detection
- `jpegadv_pvd_detect` — Pixel Value Differencing (PVD) steganography detection
- `jpegadv_chi_sliding` — Sliding window chi-square analysis over DCT coefficients
- `jpegadv_calibration` — Crop-recalibrate steganalysis
- `jpegadv_compatibility` — JPEG stego tool compatibility check

#### Spread Spectrum (5 tools)

- `spread_dft_analysis` — DFT magnitude spectrum analysis for spread spectrum detection
- `spread_correlation` — Autocorrelation-based steganography detection
- `spread_watermark_detect` — Statistical watermark detection via variance comparison
- `spread_noise_analysis` — Noise floor embedding detection
- `spread_patchwork` — Patchwork watermark detection using statistical test

#### BPCS Analysis (5 tools)

- `bpcs_detect` — Auto-detect BPCS (Bit-Plane Complexity Segmentation) embedding
- `bpcs_complexity_map` — Generate detailed complexity map of all bit planes
- `bpcs_threshold` — Complexity threshold analysis for BPCS steganalysis
- `bpcs_extract` — Extract data from BPCS complex regions
- `bpcs_capacity` — Estimate BPCS embedding capacity

#### Archive Steganography (7 tools)

- `archive_detect` — Auto-detect steganography in ZIP archives
- `archive_structure` — ZIP entry structure analysis
- `archive_extra_fields` — ZIP extra field analysis
- `archive_comment` — Extract archive-level and per-file comments
- `archive_slack` — Slack space analysis for ZIP archives
- `archive_polyglot` — Archive polyglot detection
- `archive_metadata` — Archive metadata summary

#### Create & Embed (7 tools)

- `create_eof_inject` — Append data after a file's end-of-file marker
- `create_metadata` — Inject data into file metadata fields
- `create_whitespace` — Embed data in file whitespace using trailing spaces and tabs
- `create_null_cipher` — Create null cipher text hiding a secret message
- `create_polyglot` — Create polyglot files by prepending one format before another
- `create_comment` — Inject data into format-specific comment fields
- `create_palette` — Embed data in palette color entry LSBs

#### QR Code Steganography (6 tools)

- `qr_detect` — Detect steganography in QR code images
- `qr_structure` — QR code structure analysis
- `qr_ecc_analysis` — Error correction capacity analysis
- `qr_module_analysis` — Module-level pixel analysis
- `qr_data_extract` — Extract QR data region pixels
- `qr_compare` — Compare two QR code images for differences

### Changed

- Updated all 22 README translations to reflect 128 tools / 17 categories
- Updated package.json keywords with new category terms

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

[0.2.0]: https://github.com/badchars/steganography-mcp/releases/tag/v0.2.0
[0.1.0]: https://github.com/badchars/steganography-mcp/releases/tag/v0.1.0
