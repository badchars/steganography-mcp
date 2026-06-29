import { z } from "zod";
import { inflateSync } from "node:zlib";
import { readFileInput } from "../utils/binary.js";
import { shannonEntropy } from "../utils/stats.js";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";

// ─── Helpers ───

/** Extract a regex match group from a string with optional fallback */
function extractAll(source: string, regex: RegExp): RegExpExecArray[] {
  const results: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((match = r.exec(source)) !== null) {
    results.push(match);
    if (!regex.flags.includes("g")) break;
  }
  return results;
}

// ─── Tools ───

export const documentTools: ToolDef[] = [
  // 1. doc_pdf_hidden
  {
    name: "doc_pdf_hidden",
    description: "Hidden PDF content detection. Scans PDF files for suspicious elements including embedded JavaScript (/JS), auto-actions (/AA, /OpenAction), hidden annotations, invisible text (white-on-white), embedded files, and other potentially malicious or covert content.",
    schema: {
      file_path: z.string().describe("Path to PDF file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const pdfText = buf.toString("latin1");

        if (!pdfText.startsWith("%PDF")) {
          return text("Error: File does not appear to be a valid PDF (missing %PDF header)");
        }

        const findings: Array<{ type: string; severity: string; description: string; offsets: number[]; snippet?: string }> = [];

        // JavaScript (/JS)
        const jsMatches = extractAll(pdfText, /\/JS\s*[\(<]/g);
        if (jsMatches.length > 0) {
          const offsets = jsMatches.map((m) => m.index);
          const snippet = pdfText.substring(jsMatches[0].index, jsMatches[0].index + 120).replace(/[\r\n]+/g, " ");
          findings.push({
            type: "JavaScript",
            severity: "high",
            description: `Found ${jsMatches.length} JavaScript reference(s) (/JS). Embedded JS can execute arbitrary code on PDF open.`,
            offsets,
            snippet,
          });
        }

        // Auto-actions (/AA)
        const aaMatches = extractAll(pdfText, /\/AA\s*<</g);
        if (aaMatches.length > 0) {
          findings.push({
            type: "AdditionalActions",
            severity: "high",
            description: `Found ${aaMatches.length} additional action(s) (/AA). These trigger on specific events like page open, focus, etc.`,
            offsets: aaMatches.map((m) => m.index),
          });
        }

        // OpenAction
        const openActionMatches = extractAll(pdfText, /\/OpenAction\s/g);
        if (openActionMatches.length > 0) {
          const snippet = pdfText.substring(openActionMatches[0].index, openActionMatches[0].index + 150).replace(/[\r\n]+/g, " ");
          findings.push({
            type: "OpenAction",
            severity: "high",
            description: `Found ${openActionMatches.length} OpenAction(s). Code or navigation that runs automatically when the PDF is opened.`,
            offsets: openActionMatches.map((m) => m.index),
            snippet,
          });
        }

        // Hidden annotations (/Annot)
        const annotMatches = extractAll(pdfText, /\/Subtype\s*\/\w*Annot/g);
        if (annotMatches.length > 0) {
          findings.push({
            type: "Annotations",
            severity: "medium",
            description: `Found ${annotMatches.length} annotation(s). Annotations can contain links, scripts, or hidden content.`,
            offsets: annotMatches.map((m) => m.index),
          });
        }

        // Invisible text (white-on-white or zero-size)
        // Look for text rendering mode 3 (invisible) or very small font + white color
        const invisibleTextMatches = extractAll(pdfText, /\b3\s+Tr\b/g);
        const whiteColorMatches = extractAll(pdfText, /1\s+1\s+1\s+rg/g);
        if (invisibleTextMatches.length > 0) {
          findings.push({
            type: "InvisibleText",
            severity: "medium",
            description: `Found ${invisibleTextMatches.length} invisible text rendering mode(s) (Tr 3). Text is rendered but not displayed.`,
            offsets: invisibleTextMatches.map((m) => m.index),
          });
        }
        if (whiteColorMatches.length > 0) {
          findings.push({
            type: "WhiteText",
            severity: "low",
            description: `Found ${whiteColorMatches.length} white text color setting(s) (1 1 1 rg). May hide text on white backgrounds.`,
            offsets: whiteColorMatches.map((m) => m.index),
          });
        }

        // Embedded files
        const embeddedFileMatches = extractAll(pdfText, /\/EmbeddedFile/g);
        if (embeddedFileMatches.length > 0) {
          findings.push({
            type: "EmbeddedFile",
            severity: "medium",
            description: `Found ${embeddedFileMatches.length} embedded file reference(s). Files can be hidden inside the PDF structure.`,
            offsets: embeddedFileMatches.map((m) => m.index),
          });
        }

        // Launch actions
        const launchMatches = extractAll(pdfText, /\/Launch\s/g);
        if (launchMatches.length > 0) {
          findings.push({
            type: "LaunchAction",
            severity: "high",
            description: `Found ${launchMatches.length} Launch action(s). Can execute external programs.`,
            offsets: launchMatches.map((m) => m.index),
          });
        }

        // URI actions
        const uriMatches = extractAll(pdfText, /\/URI\s*\(/g);
        if (uriMatches.length > 0) {
          const uris: string[] = [];
          for (const m of uriMatches.slice(0, 10)) {
            const urlSnippet = pdfText.substring(m.index + 5, m.index + 200);
            const urlMatch = urlSnippet.match(/\(([^)]*)\)/);
            if (urlMatch) uris.push(urlMatch[1]);
          }
          findings.push({
            type: "URIAction",
            severity: "low",
            description: `Found ${uriMatches.length} URI reference(s).`,
            offsets: uriMatches.map((m) => m.index),
            snippet: uris.join(", "),
          });
        }

        // AcroForm (forms that can contain scripts)
        const acroFormMatches = extractAll(pdfText, /\/AcroForm\s/g);
        if (acroFormMatches.length > 0) {
          findings.push({
            type: "AcroForm",
            severity: "low",
            description: `Found ${acroFormMatches.length} AcroForm reference(s). Interactive forms can contain JavaScript.`,
            offsets: acroFormMatches.map((m) => m.index),
          });
        }

        // XFA forms
        const xfaMatches = extractAll(pdfText, /\/XFA\s/g);
        if (xfaMatches.length > 0) {
          findings.push({
            type: "XFA",
            severity: "high",
            description: `Found ${xfaMatches.length} XFA form reference(s). XFA is a known attack vector with scripting capabilities.`,
            offsets: xfaMatches.map((m) => m.index),
          });
        }

        return json({
          file: filePath,
          fileSize: buf.length,
          findingsCount: findings.length,
          riskLevel: findings.some((f) => f.severity === "high") ? "HIGH"
            : findings.some((f) => f.severity === "medium") ? "MEDIUM"
            : findings.length > 0 ? "LOW" : "CLEAN",
          findings,
          summary: findings.length === 0
            ? "No suspicious hidden content detected in this PDF."
            : `Found ${findings.length} suspicious element(s). ${findings.filter((f) => f.severity === "high").length} high severity.`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. doc_pdf_metadata
  {
    name: "doc_pdf_metadata",
    description: "PDF metadata extraction. Parses the /Info dictionary for standard fields (Title, Author, Creator, Producer, CreationDate, ModDate) and searches for XMP metadata blocks. Useful for forensic attribution and document provenance analysis.",
    schema: {
      file_path: z.string().describe("Path to PDF file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const pdfText = buf.toString("latin1");

        if (!pdfText.startsWith("%PDF")) {
          return text("Error: File does not appear to be a valid PDF (missing %PDF header)");
        }

        // Extract PDF version
        const versionMatch = pdfText.match(/%PDF-(\d+\.\d+)/);
        const version = versionMatch ? versionMatch[1] : "unknown";

        // Extract /Info dictionary fields
        const infoFields: Record<string, string> = {};
        const fieldPatterns: Array<{ key: string; regex: RegExp }> = [
          { key: "Title", regex: /\/Title\s*\(([^)]*)\)/i },
          { key: "Author", regex: /\/Author\s*\(([^)]*)\)/i },
          { key: "Subject", regex: /\/Subject\s*\(([^)]*)\)/i },
          { key: "Keywords", regex: /\/Keywords\s*\(([^)]*)\)/i },
          { key: "Creator", regex: /\/Creator\s*\(([^)]*)\)/i },
          { key: "Producer", regex: /\/Producer\s*\(([^)]*)\)/i },
          { key: "CreationDate", regex: /\/CreationDate\s*\(([^)]*)\)/i },
          { key: "ModDate", regex: /\/ModDate\s*\(([^)]*)\)/i },
          { key: "Trapped", regex: /\/Trapped\s*\/(\w+)/i },
        ];

        for (const { key, regex } of fieldPatterns) {
          const match = pdfText.match(regex);
          if (match) infoFields[key] = match[1];
        }

        // Also try hex-encoded string fields: /Title <hex>
        const hexFieldPatterns: Array<{ key: string; regex: RegExp }> = [
          { key: "Title", regex: /\/Title\s*<([0-9A-Fa-f]+)>/i },
          { key: "Author", regex: /\/Author\s*<([0-9A-Fa-f]+)>/i },
          { key: "Subject", regex: /\/Subject\s*<([0-9A-Fa-f]+)>/i },
          { key: "Creator", regex: /\/Creator\s*<([0-9A-Fa-f]+)>/i },
          { key: "Producer", regex: /\/Producer\s*<([0-9A-Fa-f]+)>/i },
        ];

        for (const { key, regex } of hexFieldPatterns) {
          if (infoFields[key]) continue; // already found via parenthetical form
          const match = pdfText.match(regex);
          if (match) {
            try {
              const hexBuf = Buffer.from(match[1], "hex");
              // Swap bytes for big-endian UTF-16 to little-endian, then decode
              const swapped = Buffer.alloc(hexBuf.length);
              for (let i = 0; i + 1 < hexBuf.length; i += 2) {
                swapped[i] = hexBuf[i + 1];
                swapped[i + 1] = hexBuf[i];
              }
              const decoded = swapped.toString("utf16le").replace(/\0/g, "");
              infoFields[key] = decoded || match[1];
            } catch {
              infoFields[key] = `(hex) ${match[1]}`;
            }
          }
        }

        // Extract XMP metadata block
        let xmpMetadata: Record<string, string> | null = null;
        const xmpStart = pdfText.indexOf("<?xpacket begin");
        const xmpEnd = pdfText.indexOf("<?xpacket end");
        if (xmpStart !== -1 && xmpEnd !== -1 && xmpEnd > xmpStart) {
          const xmpBlock = pdfText.substring(xmpStart, xmpEnd + 50);
          xmpMetadata = {};

          const xmpPatterns: Array<{ key: string; regex: RegExp }> = [
            { key: "dc:title", regex: /<dc:title[^>]*>[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/i },
            { key: "dc:creator", regex: /<dc:creator[^>]*>[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/i },
            { key: "dc:description", regex: /<dc:description[^>]*>[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/i },
            { key: "xmp:CreateDate", regex: /<xmp:CreateDate>([^<]+)<\/xmp:CreateDate>/i },
            { key: "xmp:ModifyDate", regex: /<xmp:ModifyDate>([^<]+)<\/xmp:ModifyDate>/i },
            { key: "xmp:CreatorTool", regex: /<xmp:CreatorTool>([^<]+)<\/xmp:CreatorTool>/i },
            { key: "pdf:Producer", regex: /<pdf:Producer>([^<]+)<\/pdf:Producer>/i },
            { key: "pdf:PDFVersion", regex: /<pdf:PDFVersion>([^<]+)<\/pdf:PDFVersion>/i },
            { key: "xmpMM:DocumentID", regex: /<xmpMM:DocumentID>([^<]+)<\/xmpMM:DocumentID>/i },
            { key: "xmpMM:InstanceID", regex: /<xmpMM:InstanceID>([^<]+)<\/xmpMM:InstanceID>/i },
          ];

          for (const { key, regex } of xmpPatterns) {
            const match = xmpBlock.match(regex);
            if (match) xmpMetadata[key] = match[1].trim();
          }

          if (Object.keys(xmpMetadata).length === 0) xmpMetadata = null;
        }

        // Count objects and pages
        const objectCount = (pdfText.match(/\d+\s+\d+\s+obj/g) || []).length;
        const pageCount = (pdfText.match(/\/Type\s*\/Page[^s]/g) || []).length;

        return json({
          file: filePath,
          fileSize: buf.length,
          pdfVersion: version,
          pageCount,
          objectCount,
          infoDict: Object.keys(infoFields).length > 0 ? infoFields : null,
          xmpMetadata,
          hasXmpBlock: xmpStart !== -1,
          xmpBlockOffset: xmpStart !== -1 ? xmpStart : null,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. doc_pdf_streams
  {
    name: "doc_pdf_streams",
    description: "PDF stream analysis. Locates all stream/endstream blocks in a PDF, attempts zlib decompression on each, and reports sizes and entropy. Useful for finding hidden data within compressed PDF content streams.",
    schema: {
      file_path: z.string().describe("Path to PDF file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const pdfText = buf.toString("latin1");

        if (!pdfText.startsWith("%PDF")) {
          return text("Error: File does not appear to be a valid PDF (missing %PDF header)");
        }

        const streams: Array<{
          index: number;
          offset: number;
          offsetHex: string;
          compressedSize: number;
          decompressedSize: number | null;
          entropy: number;
          decompressedEntropy: number | null;
          filter: string | null;
          decompressSuccess: boolean;
          previewHex: string;
          decompressedPreview: string | null;
        }> = [];

        // Find stream...endstream pairs
        const streamStartMarker = "stream\r\n";
        const streamStartMarkerAlt = "stream\n";
        const endMarker = "endstream";

        let searchPos = 0;
        let streamIndex = 0;

        while (searchPos < pdfText.length) {
          let streamDataStart = -1;
          let markerPos = pdfText.indexOf(streamStartMarker, searchPos);
          if (markerPos !== -1) {
            streamDataStart = markerPos + streamStartMarker.length;
          } else {
            markerPos = pdfText.indexOf(streamStartMarkerAlt, searchPos);
            if (markerPos !== -1) {
              streamDataStart = markerPos + streamStartMarkerAlt.length;
            }
          }

          if (streamDataStart === -1) break;

          const endPos = pdfText.indexOf(endMarker, streamDataStart);
          if (endPos === -1) break;

          // Extract raw stream data
          const rawData = buf.subarray(streamDataStart, endPos);

          // Try to find the filter from the preceding dictionary
          const dictStart = Math.max(0, markerPos - 500);
          const dictSnippet = pdfText.substring(dictStart, markerPos);
          const filterMatch = dictSnippet.match(/\/Filter\s*\/(\w+)/);
          const filter = filterMatch ? filterMatch[1] : null;

          const compressedEntropy = shannonEntropy(rawData);

          // Try zlib decompression
          let decompressedData: Buffer | null = null;
          let decompressSuccess = false;
          let decompressedEntropy: number | null = null;

          if (rawData.length > 0) {
            try {
              decompressedData = inflateSync(rawData);
              decompressSuccess = true;
              decompressedEntropy = shannonEntropy(decompressedData);
            } catch {
              // Try raw inflate (no zlib header)
              try {
                decompressedData = inflateSync(rawData, { finishFlush: 4 });
                decompressSuccess = true;
                decompressedEntropy = shannonEntropy(decompressedData);
              } catch {
                decompressSuccess = false;
              }
            }
          }

          streams.push({
            index: streamIndex,
            offset: streamDataStart,
            offsetHex: "0x" + streamDataStart.toString(16).padStart(8, "0"),
            compressedSize: rawData.length,
            decompressedSize: decompressedData ? decompressedData.length : null,
            entropy: Number(compressedEntropy.toFixed(4)),
            decompressedEntropy: decompressedEntropy !== null ? Number(decompressedEntropy.toFixed(4)) : null,
            filter,
            decompressSuccess,
            previewHex: rawData.subarray(0, Math.min(32, rawData.length)).toString("hex"),
            decompressedPreview: decompressedData
              ? decompressedData.subarray(0, Math.min(100, decompressedData.length)).toString("utf-8").replace(/[^\x20-\x7e]/g, ".")
              : null,
          });

          streamIndex++;
          searchPos = endPos + endMarker.length;

          if (streamIndex >= 500) break; // safety limit
        }

        // Identify suspicious streams (high entropy, unusual sizes)
        const suspicious = streams.filter((s) =>
          s.entropy > 7.5 || (s.decompressedSize !== null && s.decompressedSize > s.compressedSize * 50)
        );

        return json({
          file: filePath,
          fileSize: buf.length,
          totalStreams: streams.length,
          decompressable: streams.filter((s) => s.decompressSuccess).length,
          suspiciousStreams: suspicious.length,
          streams,
          summary: streams.length === 0
            ? "No streams found in this PDF."
            : `Found ${streams.length} stream(s). ${suspicious.length} flagged as suspicious.`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. doc_html_hidden
  {
    name: "doc_html_hidden",
    description: "Hidden HTML content detection. Scans HTML files for covert content including HTML comments, elements with display:none or visibility:hidden, data-* attributes, hidden form inputs, base64 embedded content, zero-size elements, and other techniques used to hide information.",
    schema: {
      file_path: z.string().describe("Path to HTML file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const html = buf.toString("utf-8");

        const findings: Array<{
          type: string;
          count: number;
          description: string;
          items: Array<{ offset?: number; snippet: string }>;
        }> = [];

        // HTML comments
        const comments: Array<{ offset: number; snippet: string }> = [];
        const commentRegex = /<!--([\s\S]*?)-->/g;
        let match: RegExpExecArray | null;
        while ((match = commentRegex.exec(html)) !== null) {
          const content = match[1].trim();
          if (content.length > 0) {
            comments.push({
              offset: match.index,
              snippet: content.length > 200 ? content.substring(0, 200) + "..." : content,
            });
          }
        }
        if (comments.length > 0) {
          findings.push({
            type: "HTMLComments",
            count: comments.length,
            description: "HTML comments can contain hidden messages, debugging info, or sensitive data.",
            items: comments.slice(0, 20),
          });
        }

        // display:none / visibility:hidden
        const hiddenStyleItems: Array<{ snippet: string }> = [];
        const hiddenStyleRegex = /(?:display\s*:\s*none|visibility\s*:\s*hidden)[^;}"']*/gi;
        while ((match = hiddenStyleRegex.exec(html)) !== null) {
          const start = Math.max(0, match.index - 80);
          const end = Math.min(html.length, match.index + match[0].length + 80);
          hiddenStyleItems.push({ snippet: html.substring(start, end).replace(/\s+/g, " ").trim() });
        }
        if (hiddenStyleItems.length > 0) {
          findings.push({
            type: "HiddenCSS",
            count: hiddenStyleItems.length,
            description: "Elements with display:none or visibility:hidden can contain hidden text or data.",
            items: hiddenStyleItems.slice(0, 20),
          });
        }

        // data-* attributes
        const dataAttrItems: Array<{ snippet: string }> = [];
        const dataAttrRegex = /data-[a-z0-9-]+\s*=\s*"([^"]*)"/gi;
        while ((match = dataAttrRegex.exec(html)) !== null) {
          if (match[1].length > 0) {
            dataAttrItems.push({
              snippet: match[0].length > 200 ? match[0].substring(0, 200) + "..." : match[0],
            });
          }
        }
        if (dataAttrItems.length > 0) {
          findings.push({
            type: "DataAttributes",
            count: dataAttrItems.length,
            description: "Custom data-* attributes can store arbitrary hidden data in DOM elements.",
            items: dataAttrItems.slice(0, 20),
          });
        }

        // Hidden inputs
        const hiddenInputItems: Array<{ snippet: string }> = [];
        const hiddenInputRegex = /<input[^>]*type\s*=\s*["']hidden["'][^>]*>/gi;
        while ((match = hiddenInputRegex.exec(html)) !== null) {
          hiddenInputItems.push({ snippet: match[0] });
        }
        if (hiddenInputItems.length > 0) {
          findings.push({
            type: "HiddenInputs",
            count: hiddenInputItems.length,
            description: "Hidden form inputs can contain tokens, IDs, or covert data.",
            items: hiddenInputItems.slice(0, 20),
          });
        }

        // Base64 in src/href attributes
        const base64Items: Array<{ snippet: string }> = [];
        const base64Regex = /(?:src|href)\s*=\s*["']data:([^"']{0,50})[;,][^"']*["']/gi;
        while ((match = base64Regex.exec(html)) !== null) {
          const full = match[0];
          base64Items.push({
            snippet: full.length > 200 ? full.substring(0, 200) + "..." : full,
          });
        }
        if (base64Items.length > 0) {
          findings.push({
            type: "Base64Embedded",
            count: base64Items.length,
            description: "Base64-encoded data URIs can embed hidden files, images, or scripts inline.",
            items: base64Items.slice(0, 20),
          });
        }

        // Zero-size or tiny elements
        const zeroSizeItems: Array<{ snippet: string }> = [];
        const zeroSizeRegex = /(?:width|height)\s*[:=]\s*["']?0(?:px)?["']?/gi;
        while ((match = zeroSizeRegex.exec(html)) !== null) {
          const start = Math.max(0, match.index - 60);
          const end = Math.min(html.length, match.index + match[0].length + 60);
          zeroSizeItems.push({ snippet: html.substring(start, end).replace(/\s+/g, " ").trim() });
        }
        if (zeroSizeItems.length > 0) {
          findings.push({
            type: "ZeroSizeElements",
            count: zeroSizeItems.length,
            description: "Zero-size elements can hide content that is present in DOM but invisible to users.",
            items: zeroSizeItems.slice(0, 20),
          });
        }

        // Invisible text (color matching background, font-size:0, opacity:0)
        const invisibleItems: Array<{ snippet: string }> = [];
        const invisibleRegex = /(?:font-size\s*:\s*0|opacity\s*:\s*0(?:\.0+)?|color\s*:\s*(?:white|#fff(?:fff)?|rgba?\(\s*255\s*,\s*255\s*,\s*255))[^;}"']*/gi;
        while ((match = invisibleRegex.exec(html)) !== null) {
          const start = Math.max(0, match.index - 40);
          const end = Math.min(html.length, match.index + match[0].length + 40);
          invisibleItems.push({ snippet: html.substring(start, end).replace(/\s+/g, " ").trim() });
        }
        if (invisibleItems.length > 0) {
          findings.push({
            type: "InvisibleText",
            count: invisibleItems.length,
            description: "Invisible text via font-size:0, opacity:0, or white color can hide messages.",
            items: invisibleItems.slice(0, 20),
          });
        }

        // Script tags (not hidden per se, but worth noting)
        const scriptCount = (html.match(/<script[\s>]/gi) || []).length;
        const inlineScripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [])
          .filter((s) => !s.match(/src\s*=/i));

        return json({
          file: filePath,
          fileSize: buf.length,
          findingsCount: findings.length,
          totalHiddenElements: findings.reduce((sum, f) => sum + f.count, 0),
          scriptTags: scriptCount,
          inlineScripts: inlineScripts.length,
          findings,
          summary: findings.length === 0
            ? "No hidden content patterns detected in this HTML file."
            : `Found ${findings.length} category(ies) of hidden content with ${findings.reduce((s, f) => s + f.count, 0)} total elements.`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. doc_xml_metadata
  {
    name: "doc_xml_metadata",
    description: "XML and Office document metadata extraction. Parses XML-like content for Dublin Core metadata (dc:creator, dc:title), Microsoft Office properties, processing instructions, and other metadata that may reveal authorship, editing history, or hidden information.",
    schema: {
      file_path: z.string().describe("Path to XML file"),
    },
    execute: async (args, _ctx: ToolContext) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const xmlText = buf.toString("utf-8");

        const metadata: Record<string, string> = {};

        // Dublin Core metadata
        const dcPatterns: Array<{ key: string; regex: RegExp }> = [
          { key: "dc:title", regex: /<dc:title[^>]*>([^<]+)<\/dc:title>/i },
          { key: "dc:creator", regex: /<dc:creator[^>]*>([^<]+)<\/dc:creator>/i },
          { key: "dc:subject", regex: /<dc:subject[^>]*>([^<]+)<\/dc:subject>/i },
          { key: "dc:description", regex: /<dc:description[^>]*>([^<]+)<\/dc:description>/i },
          { key: "dc:publisher", regex: /<dc:publisher[^>]*>([^<]+)<\/dc:publisher>/i },
          { key: "dc:contributor", regex: /<dc:contributor[^>]*>([^<]+)<\/dc:contributor>/i },
          { key: "dc:date", regex: /<dc:date[^>]*>([^<]+)<\/dc:date>/i },
          { key: "dc:type", regex: /<dc:type[^>]*>([^<]+)<\/dc:type>/i },
          { key: "dc:format", regex: /<dc:format[^>]*>([^<]+)<\/dc:format>/i },
          { key: "dc:identifier", regex: /<dc:identifier[^>]*>([^<]+)<\/dc:identifier>/i },
          { key: "dc:language", regex: /<dc:language[^>]*>([^<]+)<\/dc:language>/i },
          { key: "dc:rights", regex: /<dc:rights[^>]*>([^<]+)<\/dc:rights>/i },
        ];

        for (const { key, regex } of dcPatterns) {
          const match = xmlText.match(regex);
          if (match) metadata[key] = match[1].trim();
        }

        // Meta tags (HTML-style)
        const metaTagRegex = /<meta\s+(?:name|property)\s*=\s*"([^"]+)"\s+content\s*=\s*"([^"]*)"\s*\/?>/gi;
        let metaMatch: RegExpExecArray | null;
        while ((metaMatch = metaTagRegex.exec(xmlText)) !== null) {
          metadata[`meta:${metaMatch[1]}`] = metaMatch[2];
        }

        // Office document properties (cp:, extended-properties, etc.)
        const officePatterns: Array<{ key: string; regex: RegExp }> = [
          { key: "cp:lastModifiedBy", regex: /<cp:lastModifiedBy[^>]*>([^<]+)<\/cp:lastModifiedBy>/i },
          { key: "cp:revision", regex: /<cp:revision[^>]*>([^<]+)<\/cp:revision>/i },
          { key: "cp:category", regex: /<cp:category[^>]*>([^<]+)<\/cp:category>/i },
          { key: "dcterms:created", regex: /<dcterms:created[^>]*>([^<]+)<\/dcterms:created>/i },
          { key: "dcterms:modified", regex: /<dcterms:modified[^>]*>([^<]+)<\/dcterms:modified>/i },
          { key: "Application", regex: /<(?:\w+:)?Application[^>]*>([^<]+)<\/(?:\w+:)?Application>/i },
          { key: "AppVersion", regex: /<(?:\w+:)?AppVersion[^>]*>([^<]+)<\/(?:\w+:)?AppVersion>/i },
          { key: "Company", regex: /<(?:\w+:)?Company[^>]*>([^<]+)<\/(?:\w+:)?Company>/i },
          { key: "Manager", regex: /<(?:\w+:)?Manager[^>]*>([^<]+)<\/(?:\w+:)?Manager>/i },
          { key: "TotalTime", regex: /<(?:\w+:)?TotalTime[^>]*>([^<]+)<\/(?:\w+:)?TotalTime>/i },
          { key: "Pages", regex: /<(?:\w+:)?Pages[^>]*>([^<]+)<\/(?:\w+:)?Pages>/i },
          { key: "Words", regex: /<(?:\w+:)?Words[^>]*>([^<]+)<\/(?:\w+:)?Words>/i },
          { key: "Characters", regex: /<(?:\w+:)?Characters[^>]*>([^<]+)<\/(?:\w+:)?Characters>/i },
        ];

        for (const { key, regex } of officePatterns) {
          const match = xmlText.match(regex);
          if (match) metadata[key] = match[1].trim();
        }

        // Processing instructions (<?pi ... ?>)
        const processingInstructions: Array<{ target: string; data: string; offset: number }> = [];
        const piRegex = /<\?(\w+)\s+([\s\S]*?)\?>/g;
        while ((metaMatch = piRegex.exec(xmlText)) !== null) {
          const target = metaMatch[1];
          if (target.toLowerCase() === "xml") continue; // skip xml declaration
          processingInstructions.push({
            target,
            data: metaMatch[2].trim().substring(0, 200),
            offset: metaMatch.index,
          });
        }

        // Comments
        const comments: Array<{ content: string; offset: number }> = [];
        const commentRegex = /<!--([\s\S]*?)-->/g;
        while ((metaMatch = commentRegex.exec(xmlText)) !== null) {
          const content = metaMatch[1].trim();
          if (content.length > 0) {
            comments.push({
              content: content.length > 200 ? content.substring(0, 200) + "..." : content,
              offset: metaMatch.index,
            });
          }
        }

        // Namespaces
        const namespaces: Record<string, string> = {};
        const nsRegex = /xmlns(?::(\w+))?\s*=\s*"([^"]*)"/g;
        while ((metaMatch = nsRegex.exec(xmlText)) !== null) {
          const prefix = metaMatch[1] || "(default)";
          namespaces[prefix] = metaMatch[2];
        }

        // CDATA sections (can hide data)
        const cdataCount = (xmlText.match(/<!\[CDATA\[/g) || []).length;

        return json({
          file: filePath,
          fileSize: buf.length,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          processingInstructions: processingInstructions.length > 0 ? processingInstructions : null,
          comments: comments.length > 0 ? comments.slice(0, 20) : null,
          namespaces: Object.keys(namespaces).length > 0 ? namespaces : null,
          cdataSections: cdataCount,
          totalMetadataFields: Object.keys(metadata).length,
          summary: Object.keys(metadata).length === 0
            ? "No metadata fields found in this XML document."
            : `Extracted ${Object.keys(metadata).length} metadata field(s) from the document.`,
        });
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];
