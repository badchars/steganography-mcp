#!/usr/bin/env node

import type { ToolContext } from "./types/index.js";
import { startMcpStdio } from "./protocol/mcp-server.js";
import { allTools } from "./protocol/tools.js";

// ─── Build ToolContext from Environment ───

function buildToolContext(): ToolContext {
  return {
    config: {
      maxFileSize: parseInt(process.env.STEGO_MAX_FILE_SIZE ?? "52428800", 10),
      tempDir: process.env.STEGO_TEMP_DIR,
    },
  };
}

// ─── Tool Categories for --list display ───

const TOOL_CATEGORIES: { category: string; prefix: string }[] = [
  { category: "Image Steganalysis", prefix: "img_" },
  { category: "JPEG Analysis", prefix: "jpeg_" },
  { category: "Audio Steganalysis", prefix: "audio_" },
  { category: "Text & Unicode", prefix: "text_" },
  { category: "File Forensics", prefix: "file_" },
  { category: "Document Analysis", prefix: "doc_" },
  { category: "Encoding & Crypto", prefix: "crypto_" },
];

function categorize(toolName: string): string {
  for (const { category, prefix } of TOOL_CATEGORIES) {
    if (toolName.startsWith(prefix)) return category;
  }
  return "Other";
}

// ─── CLI: --help ───

function printHelp(): void {
  console.log(`steganography-mcp — Steganography Analysis MCP Server

USAGE:
  steganography-mcp                          Start MCP server on stdio
  steganography-mcp --help                   Show this help message
  steganography-mcp --list                   List all ${allTools.length} tools grouped by category
  steganography-mcp --tool <name> '<json>'   Run a single tool with JSON args

ENVIRONMENT VARIABLES:
  STEGO_MAX_FILE_SIZE    Max file size in bytes (default: 50MB)
  STEGO_TEMP_DIR         Temporary directory for processing

EXAMPLES:
  steganography-mcp --tool img_detect '{"file_path":"image.png"}'
  steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'
  steganography-mcp --tool jpeg_structure '{"file_path":"photo.jpg"}'
  steganography-mcp --tool audio_lsb_detect '{"file_path":"audio.wav"}'
  steganography-mcp --tool text_zwc_detect '{"text":"hello\\u200Bworld"}'
  steganography-mcp --tool file_identify '{"file_path":"unknown.bin"}'
  steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'
  steganography-mcp --tool file_entropy_visual '{"file_path":"suspect.dat"}'

CLAUDE DESKTOP (claude_desktop_config.json):
  {
    "mcpServers": {
      "steganography": {
        "command": "npx",
        "args": ["-y", "steganography-mcp"]
      }
    }
  }
`);
}

// ─── CLI: --list ───

function printToolList(): void {
  const grouped = new Map<string, typeof allTools>();

  for (const tool of allTools) {
    const cat = categorize(tool.name);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(tool);
  }

  console.log(`\nsteganography-mcp — ${allTools.length} tools\n`);

  grouped.forEach((tools, category) => {
    console.log(`━━━ ${category} (${tools.length}) ━━━`);
    for (const tool of tools) {
      const schemaKeys = Object.keys(tool.schema);
      const params = schemaKeys.length > 0 ? `(${schemaKeys.join(", ")})` : "()";
      console.log(`  ${tool.name}${params}`);
      console.log(`    ${tool.description.split(".")[0]}.`);
    }
    console.log();
  });
}

// ─── CLI: --tool <name> '<json>' ───

async function runSingleTool(name: string, argsJson: string): Promise<void> {
  const tool = allTools.find((t) => t.name === name);
  if (!tool) {
    console.error(`Error: Unknown tool "${name}"`);
    console.error(`Run --list to see all ${allTools.length} available tools.`);
    process.exit(1);
  }

  let args: Record<string, unknown>;
  try {
    args = JSON.parse(argsJson);
  } catch {
    console.error(`Error: Invalid JSON arguments: ${argsJson}`);
    process.exit(1);
  }

  const ctx = buildToolContext();
  const result = await tool.execute(args, ctx);

  for (const item of result.content) {
    if (item.type === "text") {
      console.log(item.text);
    }
  }
}

// ─── Main ───

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--list") || args.includes("-l")) {
    printToolList();
    return;
  }

  const toolIdx = args.indexOf("--tool");
  if (toolIdx !== -1) {
    const toolName = args[toolIdx + 1];
    const toolArgs = args[toolIdx + 2] ?? "{}";
    if (!toolName) {
      console.error("Error: --tool requires a tool name");
      process.exit(1);
    }
    await runSingleTool(toolName, toolArgs);
    return;
  }

  // Default: start MCP server on stdio
  const ctx = buildToolContext();
  await startMcpStdio(ctx);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
