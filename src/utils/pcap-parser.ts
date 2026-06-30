// ─── PCAP Parser ───
// Pure TypeScript PCAP parser for network steganography detection.
// No external dependencies — Buffer-based parsing only.

// ─── Constants ───

const PCAP_MAGIC_LE = 0xa1b2c3d4;
const PCAP_MAGIC_BE = 0xd4c3b2a1;
const GLOBAL_HEADER_LEN = 24;
const PACKET_HEADER_LEN = 16;
const ETHERNET_HEADER_LEN = 14;

// ─── Interfaces ───

export interface PcapHeader {
  magicNumber: number;
  versionMajor: number;
  versionMinor: number;
  snapLen: number;
  linkType: number;
  byteOrder: "little" | "big";
}

export interface PcapPacket {
  timestamp: number;
  capturedLength: number;
  originalLength: number;
  data: Buffer;
  index: number;
}

export interface EthernetFrame {
  destMac: string;
  srcMac: string;
  etherType: number;
  payload: Buffer;
}

export interface IpHeader {
  version: number;
  headerLength: number;
  tos: number;
  totalLength: number;
  identification: number;
  flags: number;
  fragmentOffset: number;
  ttl: number;
  protocol: number;
  checksum: number;
  srcIp: string;
  dstIp: string;
  options: Buffer;
  payload: Buffer;
}

export interface TcpHeader {
  srcPort: number;
  dstPort: number;
  seqNumber: number;
  ackNumber: number;
  dataOffset: number;
  flags: { urg: boolean; ack: boolean; psh: boolean; rst: boolean; syn: boolean; fin: boolean };
  windowSize: number;
  checksum: number;
  urgentPointer: number;
  options: Buffer;
  payload: Buffer;
}

export interface UdpHeader {
  srcPort: number;
  dstPort: number;
  length: number;
  checksum: number;
  payload: Buffer;
}

export interface IcmpHeader {
  type: number;
  code: number;
  checksum: number;
  payload: Buffer;
}

export interface DnsRecord {
  name: string;
  type: number;
  data: string;
}

export interface DnsMessage {
  id: number;
  isResponse: boolean;
  questionCount: number;
  answerCount: number;
  questions: Array<{ name: string; type: number }>;
  answers: DnsRecord[];
  rawPayload: Buffer;
}

export interface HttpMessage {
  isRequest: boolean;
  method?: string;
  uri?: string;
  statusCode?: number;
  headers: Map<string, string>;
  body: Buffer;
}

export interface PcapParseResult {
  header: PcapHeader;
  packets: PcapPacket[];
  totalPackets: number;
  duration: number;
}

// ─── Helpers ───

function formatMac(buf: Buffer, offset: number): string {
  const bytes: string[] = [];
  for (let i = 0; i < 6; i++) {
    bytes.push(buf[offset + i].toString(16).padStart(2, "0"));
  }
  return bytes.join(":");
}

function formatIpv4(buf: Buffer, offset: number): string {
  return `${buf[offset]}.${buf[offset + 1]}.${buf[offset + 2]}.${buf[offset + 3]}`;
}

/** Create endian-aware read helpers from a byte order indicator. */
function readers(order: "little" | "big") {
  const le = order === "little";
  return {
    u16: (b: Buffer, o: number) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o)),
    u32: (b: Buffer, o: number) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o)),
  };
}

// ─── PCAP Global + Packet Parsing ───

export function parsePcap(buf: Buffer): PcapParseResult {
  if (buf.length < GLOBAL_HEADER_LEN) {
    throw new Error("Buffer too small for PCAP global header");
  }

  const rawMagic = buf.readUInt32LE(0);
  let byteOrder: "little" | "big";
  if (rawMagic === PCAP_MAGIC_LE) {
    byteOrder = "little";
  } else if (rawMagic === PCAP_MAGIC_BE) {
    byteOrder = "big";
  } else {
    throw new Error(`Invalid PCAP magic number: 0x${rawMagic.toString(16)}`);
  }

  const r = readers(byteOrder);

  const header: PcapHeader = {
    magicNumber: PCAP_MAGIC_LE,
    versionMajor: r.u16(buf, 4),
    versionMinor: r.u16(buf, 6),
    snapLen: r.u32(buf, 16),
    linkType: r.u32(buf, 20),
    byteOrder,
  };

  const packets: PcapPacket[] = [];
  let offset = GLOBAL_HEADER_LEN;
  let index = 0;
  let firstTs = -1;
  let lastTs = -1;

  while (offset + PACKET_HEADER_LEN <= buf.length) {
    const tsSec = r.u32(buf, offset);
    const tsUsec = r.u32(buf, offset + 4);
    const capturedLength = r.u32(buf, offset + 8);
    const originalLength = r.u32(buf, offset + 12);

    const dataStart = offset + PACKET_HEADER_LEN;
    if (dataStart + capturedLength > buf.length) break;

    const timestamp = tsSec + tsUsec / 1_000_000;
    if (firstTs < 0) firstTs = timestamp;
    lastTs = timestamp;

    packets.push({
      timestamp,
      capturedLength,
      originalLength,
      data: buf.subarray(dataStart, dataStart + capturedLength),
      index: index++,
    });

    offset = dataStart + capturedLength;
  }

  return {
    header,
    packets,
    totalPackets: packets.length,
    duration: packets.length > 1 ? lastTs - firstTs : 0,
  };
}

// ─── Ethernet ───

export function parseEthernet(data: Buffer): EthernetFrame | null {
  if (data.length < ETHERNET_HEADER_LEN) return null;

  return {
    destMac: formatMac(data, 0),
    srcMac: formatMac(data, 6),
    etherType: data.readUInt16BE(12),
    payload: data.subarray(ETHERNET_HEADER_LEN),
  };
}

// ─── IPv4 ───

export function parseIp(data: Buffer): IpHeader | null {
  if (data.length < 20) return null;

  const versionIhl = data[0];
  const version = (versionIhl >> 4) & 0x0f;
  if (version !== 4) return null;

  const ihl = versionIhl & 0x0f;
  const headerLength = ihl * 4;
  if (data.length < headerLength) return null;

  const flagsFrag = data.readUInt16BE(6);
  const flags = (flagsFrag >> 13) & 0x07;
  const fragmentOffset = flagsFrag & 0x1fff;
  const totalLength = data.readUInt16BE(2);

  return {
    version,
    headerLength,
    tos: data[1],
    totalLength,
    identification: data.readUInt16BE(4),
    flags,
    fragmentOffset,
    ttl: data[8],
    protocol: data[9],
    checksum: data.readUInt16BE(10),
    srcIp: formatIpv4(data, 12),
    dstIp: formatIpv4(data, 16),
    options: headerLength > 20 ? data.subarray(20, headerLength) : Buffer.alloc(0),
    payload: data.subarray(headerLength, Math.min(totalLength, data.length)),
  };
}

// ─── TCP ───

export function parseTcp(data: Buffer): TcpHeader | null {
  if (data.length < 20) return null;

  const dataOffset = (data[12] >> 4) & 0x0f;
  const headerLen = dataOffset * 4;
  if (data.length < headerLen) return null;

  const flagsByte = data[13];

  return {
    srcPort: data.readUInt16BE(0),
    dstPort: data.readUInt16BE(2),
    seqNumber: data.readUInt32BE(4),
    ackNumber: data.readUInt32BE(8),
    dataOffset,
    flags: {
      urg: !!(flagsByte & 0x20),
      ack: !!(flagsByte & 0x10),
      psh: !!(flagsByte & 0x08),
      rst: !!(flagsByte & 0x04),
      syn: !!(flagsByte & 0x02),
      fin: !!(flagsByte & 0x01),
    },
    windowSize: data.readUInt16BE(14),
    checksum: data.readUInt16BE(16),
    urgentPointer: data.readUInt16BE(18),
    options: headerLen > 20 ? data.subarray(20, headerLen) : Buffer.alloc(0),
    payload: data.subarray(headerLen),
  };
}

// ─── UDP ───

export function parseUdp(data: Buffer): UdpHeader | null {
  if (data.length < 8) return null;

  return {
    srcPort: data.readUInt16BE(0),
    dstPort: data.readUInt16BE(2),
    length: data.readUInt16BE(4),
    checksum: data.readUInt16BE(6),
    payload: data.subarray(8),
  };
}

// ─── ICMP ───

export function parseIcmp(data: Buffer): IcmpHeader | null {
  if (data.length < 4) return null;

  return {
    type: data[0],
    code: data[1],
    checksum: data.readUInt16BE(2),
    payload: data.subarray(4),
  };
}

// ─── DNS ───

/** Read a DNS name with label compression support. Returns [name, newOffset]. */
function readDnsName(buf: Buffer, offset: number, maxJumps = 16): [string, number] {
  const labels: string[] = [];
  let pos = offset;
  let jumped = false;
  let returnOffset = -1;
  let jumps = 0;

  while (pos < buf.length) {
    const len = buf[pos];
    if (len === 0) {
      if (!jumped) returnOffset = pos + 1;
      break;
    }

    // Pointer (compression): top 2 bits set
    if ((len & 0xc0) === 0xc0) {
      if (pos + 1 >= buf.length) break;
      if (!jumped) returnOffset = pos + 2;
      pos = ((len & 0x3f) << 8) | buf[pos + 1];
      jumped = true;
      if (++jumps > maxJumps) break;
      continue;
    }

    pos++;
    if (pos + len > buf.length) break;
    labels.push(buf.subarray(pos, pos + len).toString("ascii"));
    pos += len;
  }

  if (returnOffset < 0) returnOffset = pos + 1;
  return [labels.join("."), returnOffset];
}

/** Decode DNS RDATA for common types into a human-readable string. */
function decodeDnsRdata(buf: Buffer, offset: number, rdLength: number, rType: number, fullBuf: Buffer): string {
  const rdata = buf.subarray(offset, offset + rdLength);
  switch (rType) {
    case 1: // A
      if (rdLength === 4) return formatIpv4(rdata, 0);
      break;
    case 28: // AAAA
      if (rdLength === 16) {
        const parts: string[] = [];
        for (let i = 0; i < 16; i += 2) parts.push(rdata.readUInt16BE(i).toString(16));
        return parts.join(":");
      }
      break;
    case 5: // CNAME
    case 2: // NS
    case 12: // PTR
      return readDnsName(fullBuf, offset)[0];
    case 15: // MX
      if (rdLength >= 4) {
        const name = readDnsName(fullBuf, offset + 2)[0];
        return `${rdata.readUInt16BE(0)} ${name}`;
      }
      break;
    case 16: // TXT
      if (rdLength > 1) {
        const txtLen = rdata[0];
        return rdata.subarray(1, 1 + Math.min(txtLen, rdLength - 1)).toString("utf-8");
      }
      break;
  }
  return rdata.toString("hex");
}

export function parseDns(data: Buffer): DnsMessage | null {
  if (data.length < 12) return null;

  const id = data.readUInt16BE(0);
  const flags = data.readUInt16BE(2);
  const isResponse = !!(flags & 0x8000);
  const questionCount = data.readUInt16BE(4);
  const answerCount = data.readUInt16BE(6);

  const questions: Array<{ name: string; type: number }> = [];
  let offset = 12;

  for (let i = 0; i < questionCount && offset < data.length; i++) {
    const [name, newOffset] = readDnsName(data, offset);
    offset = newOffset;
    if (offset + 4 > data.length) break;
    const qType = data.readUInt16BE(offset);
    offset += 4; // skip QTYPE + QCLASS
    questions.push({ name, type: qType });
  }

  const answers: DnsRecord[] = [];
  for (let i = 0; i < answerCount && offset < data.length; i++) {
    const [name, newOffset] = readDnsName(data, offset);
    offset = newOffset;
    if (offset + 10 > data.length) break;
    const rType = data.readUInt16BE(offset);
    const rdLength = data.readUInt16BE(offset + 8);
    offset += 10;
    if (offset + rdLength > data.length) break;
    const rDataStr = decodeDnsRdata(data, offset, rdLength, rType, data);
    answers.push({ name, type: rType, data: rDataStr });
    offset += rdLength;
  }

  return {
    id,
    isResponse,
    questionCount,
    answerCount,
    questions,
    answers,
    rawPayload: data,
  };
}

// ─── HTTP ───

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "CONNECT", "TRACE"];
const CRLF_CRLF = Buffer.from("\r\n\r\n");

export function parseHttp(data: Buffer): HttpMessage | null {
  if (data.length < 10) return null;

  // Fast check: first bytes must start with a known method or "HTTP/"
  const firstLine = data.subarray(0, Math.min(data.length, 128)).toString("ascii");
  const isRequest = HTTP_METHODS.some((m) => firstLine.startsWith(m + " "));
  const isResponse = firstLine.startsWith("HTTP/");
  if (!isRequest && !isResponse) return null;

  const headerEndIdx = data.indexOf(CRLF_CRLF);
  if (headerEndIdx < 0) return null;

  const headerBlock = data.subarray(0, headerEndIdx).toString("ascii");
  const lines = headerBlock.split("\r\n");
  if (lines.length === 0) return null;

  const statusLine = lines[0];
  const headers = new Map<string, string>();
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx > 0) {
      const key = lines[i].substring(0, colonIdx).trim().toLowerCase();
      const value = lines[i].substring(colonIdx + 1).trim();
      headers.set(key, value);
    }
  }

  const body = data.subarray(headerEndIdx + 4);

  if (isRequest) {
    const parts = statusLine.split(" ");
    return { isRequest: true, method: parts[0], uri: parts[1], headers, body };
  }

  // Response: "HTTP/1.1 200 OK"
  const parts = statusLine.split(" ");
  const statusCode = parts.length >= 2 ? parseInt(parts[1], 10) : 0;
  return { isRequest: false, statusCode: isNaN(statusCode) ? 0 : statusCode, headers, body };
}
