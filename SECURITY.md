# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in **steganography-mcp**, please report it responsibly.

### Contact

**Email:** [contact@orhanyildirim.us](mailto:contact@orhanyildirim.us)

**Subject line:** `[SECURITY] steganography-mcp — <brief description>`

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected tool(s) or component(s)
- Potential impact assessment
- Suggested fix (if any)

### Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Acknowledgement | 48 hours |
| Initial assessment | 5 business days |
| Fix development | 14 business days |
| Security advisory | Published with fix release |

### Process

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the details to the address above
3. You will receive an acknowledgement within 48 hours
4. We will work with you to understand and validate the issue
5. A fix will be developed and tested privately
6. A new version will be released with the fix
7. A security advisory will be published after the fix is available

## Scope

The following are **in scope** for security reports:

- Path traversal or arbitrary file read/write via tool inputs
- Buffer overflow or out-of-bounds read in binary parsers (PNG, JPEG, BMP, WAV)
- Information disclosure through error messages or logs
- Denial of service via crafted input files (e.g., zip bombs, decompression bombs)
- Dependency vulnerabilities in `@modelcontextprotocol/sdk`, `zod`, `pngjs`, `jpeg-js`
- Unsafe handling of binary data in image/audio parsers
- MCP protocol-level vulnerabilities
- Unsafe use of `node:fs`, `node:zlib`, `node:crypto` built-ins
- LSB embedding tools writing to unintended paths

The following are **out of scope**:

- Vulnerabilities in external files being analyzed (steganography-mcp is an analysis tool)
- Issues in upstream MCP clients (Claude Desktop, etc.)
- Social engineering attacks
- Findings from tools that are expected to surface security issues (e.g., `img_detect` flagging a stego image is working as intended)

## Security Design Principles

steganography-mcp follows these security principles:

- **Local-only** — all analysis runs locally, no external API calls, no network access required
- **No credentials stored** — no API keys needed or persisted
- **Read-only by default** — analysis tools never modify input files; embedding tools require explicit output paths
- **Input validation** — all inputs validated via Zod schemas before processing
- **Structured errors** — errors return structured messages, never raw stack traces
- **No arbitrary execution** — tools cannot execute system commands or arbitrary code
- **Bounded processing** — file size limits and processing caps prevent resource exhaustion

## Acknowledgements

We appreciate security researchers who report vulnerabilities responsibly. Contributors will be credited in the security advisory (unless they prefer anonymity).
