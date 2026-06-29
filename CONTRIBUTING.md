# Contributing to steganography-mcp

Thank you for your interest in contributing to **steganography-mcp** — a 60-tool MCP server for steganography analysis.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding a New Tool](#adding-a-new-tool)
- [Adding a New Category](#adding-a-new-category)
- [Code Guidelines](#code-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Bun](https://bun.sh) | 1.3.9+ | Runtime & package manager |
| [Node.js](https://nodejs.org) | 18+ | Publish target |
| Git | any | Version control |

### Quick Start

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
bun run dev          # Watch mode
bun run build        # Build for npm
```

### Useful Commands

```bash
bun run src/index.ts --help              # CLI help
bun run src/index.ts --list              # List all 60 tools
bun run src/index.ts --tool <name> '<json>'  # Run a single tool
```

---

## Project Structure

```
src/
├── index.ts                  # Entry point & CLI
├── protocol/
│   ├── mcp-server.ts         # MCP server setup (stdio transport)
│   └── tools.ts              # Tool registry (imports all 7 categories)
├── types/
│   └── index.ts              # Shared types (ToolDef, ToolContext, etc.)
├── utils/
│   ├── binary.ts             # Binary/pixel helpers, hex dump, LSB ops
│   ├── stats.ts              # Shannon entropy, chi-square, RS analysis
│   ├── png-parser.ts         # PNG chunk parser
│   ├── jpeg-parser.ts        # JPEG marker/EXIF parser
│   ├── bmp-parser.ts         # BMP format parser
│   └── wav-parser.ts         # WAV/RIFF audio parser
├── data/
│   ├── stego-signatures.ts   # Known stego tool signatures
│   ├── magic-bytes.ts        # File format magic bytes
│   ├── unicode-invisible.ts  # Invisible Unicode character database
│   └── encoding-patterns.ts  # Encoding/hash detection patterns
│
│  ── Categories (7 directories, 60 tools) ──
│
├── image/         # 14 tools — Image steganalysis
├── jpeg/          #  7 tools — JPEG-specific analysis
├── audio/         #  7 tools — Audio steganalysis
├── text/          # 10 tools — Text & Unicode steganography
├── file/          # 10 tools — File forensics
├── document/      #  5 tools — Document analysis
└── crypto/        #  7 tools — Encoding & crypto detection
```

Each category directory contains a single `index.ts` that exports a `ToolDef[]` array.

---

## Adding a New Tool

### 1. Choose the Right Category

Pick the category that best fits your tool. If none fits, see [Adding a New Category](#adding-a-new-category).

### 2. Define the Tool

Open `src/<category>/index.ts` and add a new entry to the exported array:

```typescript
{
  name: "category_tool_name",
  description: "One-line description of what the tool does",
  schema: {
    file_path: z.string().describe("Path to file to analyze"),
    // ... more parameters
  },
  async execute(args, ctx) {
    const filePath = args.file_path as string;

    // Implementation here
    // Use node:fs, node:zlib, node:crypto, pngjs, jpeg-js, etc.

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
}
```

### 3. Naming Convention

- Tool names: `category_action_noun` (e.g. `img_lsb_extract`, `audio_lsb_detect`)
- Use the category prefix consistently:
  - `img_` for image tools
  - `jpeg_` for JPEG tools
  - `audio_` for audio tools
  - `text_` for text/Unicode tools
  - `file_` for file forensics tools
  - `doc_` for document tools
  - `crypto_` for encoding/crypto tools
- Keep names descriptive but concise

### 4. Schema Rules

- Every property must have `.describe()` with a clear description
- Use Zod-compatible types
- Mark truly optional parameters as such; keep `required` fields accurate
- Use sensible defaults for optional parameters

### 5. Implementation Guidelines

- Use **Node.js built-ins** where possible: `node:fs/promises`, `node:zlib`, `node:crypto`, `node:buffer`
- Use **`pngjs`** for PNG pixel access and **`jpeg-js`** for JPEG decoding
- Use shared utilities in `src/utils/` for common operations (entropy, chi-square, hex dump, etc.)
- Wrap all external calls in try/catch; return structured error messages
- **No API keys required** — all tools work 100% locally
- Tools should be read-only by default; embedding tools must require explicit output paths

### 6. Register (if adding a new category)

The tool is auto-registered if you add it to an existing category's array. For new categories, see below.

---

## Adding a New Category

1. Create `src/<category>/index.ts` exporting a `ToolDef[]`
2. Import and spread it in `src/protocol/tools.ts`:

```typescript
import { newTools } from "../newcategory/index.js";

export const allTools = [
  // ... existing spreads
  ...newTools,
];
```

3. Add the category prefix to `TOOL_CATEGORIES` in `src/index.ts`
4. Update this document's project structure table

---

## Code Guidelines

| Rule | Detail |
|------|--------|
| **Language** | TypeScript strict mode |
| **Imports** | ESM with `.js` extension (`"../utils/binary.js"`) |
| **Formatting** | 2-space indent, match existing style |
| **Error handling** | Always try/catch; return structured errors via `text()` or `json()` helpers |
| **API keys** | Not used — all tools are 100% local |
| **Side effects** | Tools are read-only by default; embedding tools write to explicit output paths only |
| **Dependencies** | Minimize — prefer Node.js built-ins over npm packages |
| **File I/O** | Use `readFileInput()` from `src/utils/binary.ts` for consistent file reading |
| **Statistics** | Use shared functions from `src/utils/stats.ts` (entropy, chi-square, RS analysis, etc.) |

---

## Pull Request Process

1. **Fork & branch** — create a feature branch from `main`
2. **Implement** — follow the guidelines above
3. **Test locally** — run your tool via CLI:
   ```bash
   bun run src/index.ts --tool your_tool_name '{"file_path":"test.png"}'
   ```
4. **Verify build** — `bun run build` must succeed without errors
5. **Verify listing** — `bun run src/index.ts --list` must show your tool
6. **Commit** — use [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(image): add img_new_tool for X analysis
   fix(audio): handle mono WAV files gracefully
   docs: update CHANGELOG for v0.2.0
   ```
7. **Open PR** — target `main`, describe what the tool does and why

### PR Checklist

- [ ] Tool name follows `category_action` convention
- [ ] All schema fields have `.describe()` descriptions
- [ ] Error cases return structured messages (not thrown exceptions)
- [ ] `bun run build` passes
- [ ] `bun run src/index.ts --list` shows the new tool
- [ ] Tool tested with real files via CLI

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/badchars/steganography-mcp/issues) with:

- **Tool name** (e.g. `img_lsb_extract`)
- **Input** — the JSON arguments you passed
- **Expected behavior**
- **Actual behavior** — error message or incorrect output
- **Environment** — OS, Bun/Node version, MCP client

---

Thank you for helping make steganography analysis more accessible!
