# steganography-mcp — Steganography Analysis MCP Server

## Overview
128-tool MCP server for steganography analysis: image steganalysis, JPEG forensics (F5/JSteg/OutGuess), BPCS analysis, video & GIF steganography, network covert channels, MP3 stego, spread spectrum watermarks, archive stego, QR code analysis, audio steganography, text/unicode steganography, file forensics, document analysis, encoding detection.

## Architecture
- **Runtime:** Bun 1.3.9+ (dev), Node.js (publish)
- **Dependencies:** @modelcontextprotocol/sdk, zod, pngjs, jpeg-js
- **Transport:** stdio only
- **Pattern:** Each category in own directory under src/, tools registered in src/protocol/tools.ts

## Key Rules
- TypeScript strict mode, English code/comments
- Every tool schema field must have `.describe()`
- File input via `file_path` parameter, text input via `text` parameter
- Pure TS for WAV/BMP parsing, statistical analysis, text analysis, file forensics
- Import paths use `.js` extension (ESM)

## Categories (17)
image (img_*), jpeg (jpeg_*), audio (audio_*), text (text_*), file (file_*), document (doc_*), crypto (crypto_*), video (video_*), gif (gif_*), network (net_*), mp3 (mp3_*), advanced-jpeg (jpegadv_*), spread-spectrum (spread_*), bpcs (bpcs_*), archive (archive_*), create (create_*), qr (qr_*)

## Commands
```bash
bun install          # Install deps
bun run dev          # Dev mode (watch)
bun run build        # Build for npm
bun run src/index.ts --help   # CLI help
bun run src/index.ts --list   # List all tools
bun run src/index.ts --tool <name> '<json>'  # Run single tool
```
