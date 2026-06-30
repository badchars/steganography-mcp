import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { text, json } from "../types/index.js";
import { readFileInput, hexDump } from "../utils/binary.js";
import { shannonEntropy, shannonEntropyStr } from "../utils/stats.js";
import {
  parsePcap,
  parseEthernet,
  parseIp,
  parseTcp,
  parseUdp,
  parseIcmp,
  parseDns,
  parseHttp,
  type PcapPacket,
  type IpHeader,
  type TcpHeader,
  type UdpHeader,
  type IcmpHeader,
  type DnsMessage,
  type HttpMessage,
} from "../utils/pcap-parser.js";

// ─── Helpers ───

interface ParsedPacket {
  packet: PcapPacket;
  ip: IpHeader | null;
  tcp: TcpHeader | null;
  udp: UdpHeader | null;
  icmp: IcmpHeader | null;
  dns: DnsMessage | null;
  http: HttpMessage | null;
  protocol: string;
}

/** Parse all protocol layers for a PCAP packet */
function parsePacketLayers(packet: PcapPacket): ParsedPacket {
  const eth = parseEthernet(packet.data);
  if (!eth || eth.etherType !== 0x0800) {
    return { packet, ip: null, tcp: null, udp: null, icmp: null, dns: null, http: null, protocol: "non-ip" };
  }

  const ip = parseIp(eth.payload);
  if (!ip) {
    return { packet, ip: null, tcp: null, udp: null, icmp: null, dns: null, http: null, protocol: "unknown" };
  }

  let tcp: TcpHeader | null = null;
  let udp: UdpHeader | null = null;
  let icmp: IcmpHeader | null = null;
  let dns: DnsMessage | null = null;
  let http: HttpMessage | null = null;
  let protocol = "ip";

  if (ip.protocol === 6) {
    tcp = parseTcp(ip.payload);
    protocol = "tcp";
    if (tcp && tcp.payload.length > 0) {
      http = parseHttp(tcp.payload);
      if (http) protocol = "http";
    }
  } else if (ip.protocol === 17) {
    udp = parseUdp(ip.payload);
    protocol = "udp";
    if (udp && (udp.srcPort === 53 || udp.dstPort === 53)) {
      dns = parseDns(udp.payload);
      if (dns) protocol = "dns";
    }
  } else if (ip.protocol === 1) {
    icmp = parseIcmp(ip.payload);
    protocol = "icmp";
  }

  return { packet, ip, tcp, udp, icmp, dns, http, protocol };
}

/** Parse all packets from a PCAP file buffer */
function parseAllPackets(buf: Buffer): { parsed: ParsedPacket[]; duration: number; totalPackets: number } {
  const pcap = parsePcap(buf);
  const parsed: ParsedPacket[] = [];
  for (const pkt of pcap.packets) {
    parsed.push(parsePacketLayers(pkt));
  }
  return { parsed, duration: pcap.duration, totalPackets: pcap.totalPackets };
}

/** Compute standard deviation */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Compute mean */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ─── Tool Definitions ───

export const networkTools: ToolDef[] = [
  // 1. net_detect
  {
    name: "net_detect",
    description:
      "Auto-detect network steganography in a PCAP file. Checks IP covert header fields, ICMP payload anomalies, DNS tunneling indicators, and inter-packet timing patterns. Returns a combined suspicion score.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed, duration, totalPackets } = parseAllPackets(buf);
        const findings: string[] = [];
        let suspicionScore = 0;

        findings.push(`=== Network Steganography Detection ===`);
        findings.push(`File: ${filePath}`);
        findings.push(`Packets: ${totalPackets}, Duration: ${duration.toFixed(3)}s`);
        findings.push("");

        // --- IP header covert field analysis ---
        findings.push(`=== IP Header Covert Fields ===`);
        const ipPackets = parsed.filter((p) => p.ip !== null);
        if (ipPackets.length > 0) {
          const ttls = ipPackets.map((p) => p.ip!.ttl);
          const ids = ipPackets.map((p) => p.ip!.identification);
          const tosValues = ipPackets.map((p) => p.ip!.tos);

          const ttlEntropy = shannonEntropy(ttls);
          const idEntropy = shannonEntropy(ids.map((id) => id & 0xff));
          const nonZeroTos = tosValues.filter((t) => t !== 0).length;

          findings.push(`TTL entropy: ${ttlEntropy.toFixed(4)} (unique values: ${new Set(ttls).size})`);
          if (ttlEntropy > 4.0) {
            findings.push(`[!] High TTL entropy — possible covert channel in TTL field`);
            suspicionScore += 2;
          }

          findings.push(`ID field entropy (low byte): ${idEntropy.toFixed(4)}`);
          if (idEntropy > 7.5) {
            findings.push(`[!] Very high IP ID entropy — possible data encoding in identification field`);
            suspicionScore += 2;
          }

          findings.push(`Non-zero TOS packets: ${nonZeroTos}/${ipPackets.length}`);
          if (nonZeroTos > ipPackets.length * 0.3) {
            findings.push(`[!] Unusual TOS usage — possible covert channel`);
            suspicionScore += 1;
          }
        } else {
          findings.push(`No IP packets found`);
        }
        findings.push("");

        // --- ICMP payload analysis ---
        findings.push(`=== ICMP Payload Analysis ===`);
        const icmpPackets = parsed.filter((p) => p.icmp !== null);
        if (icmpPackets.length > 0) {
          findings.push(`ICMP packets: ${icmpPackets.length}`);
          const echoPackets = icmpPackets.filter(
            (p) => p.icmp!.type === 8 || p.icmp!.type === 0,
          );

          if (echoPackets.length > 0) {
            const payloadSizes = echoPackets.map((p) => p.icmp!.payload.length);
            const avgSize = mean(payloadSizes);
            const sizeStdDev = stddev(payloadSizes);

            findings.push(`Echo req/reply packets: ${echoPackets.length}`);
            findings.push(`Payload sizes: avg=${avgSize.toFixed(1)}, stddev=${sizeStdDev.toFixed(1)}`);

            // Combine all ICMP payloads and check entropy
            const combined = Buffer.concat(echoPackets.map((p) => p.icmp!.payload));
            if (combined.length > 0) {
              const payloadEntropy = shannonEntropy(combined);
              findings.push(`Combined payload entropy: ${payloadEntropy.toFixed(4)}`);
              if (payloadEntropy > 6.5) {
                findings.push(`[!] High ICMP payload entropy — possible data exfiltration`);
                suspicionScore += 2;
              }

              // Check for printable content
              let printable = 0;
              for (const b of combined) {
                if (b >= 0x20 && b <= 0x7e) printable++;
              }
              const printableRatio = printable / combined.length;
              if (printableRatio > 0.7) {
                findings.push(`[!] ICMP payloads contain ${(printableRatio * 100).toFixed(1)}% printable ASCII — possible text exfiltration`);
                suspicionScore += 2;
              }
            }
          }

          if (sizeVariance(icmpPackets.map((p) => p.icmp!.payload.length)) > 1000) {
            findings.push(`[!] Highly variable ICMP payload sizes — suspicious`);
            suspicionScore += 1;
          }
        } else {
          findings.push(`No ICMP packets found`);
        }
        findings.push("");

        // --- DNS tunneling ---
        findings.push(`=== DNS Tunneling Check ===`);
        const dnsPackets = parsed.filter((p) => p.dns !== null);
        if (dnsPackets.length > 0) {
          findings.push(`DNS packets: ${dnsPackets.length}`);
          const queries = dnsPackets.filter((p) => !p.dns!.isResponse);

          if (queries.length > 0) {
            const subdomainLengths: number[] = [];
            const subdomainEntropies: number[] = [];
            let longSubdomains = 0;

            for (const q of queries) {
              for (const question of q.dns!.questions) {
                const parts = question.name.split(".");
                if (parts.length >= 2) {
                  const subdomain = parts.slice(0, -2).join(".");
                  if (subdomain.length > 0) {
                    subdomainLengths.push(subdomain.length);
                    subdomainEntropies.push(shannonEntropyStr(subdomain));
                    if (subdomain.length > 30) longSubdomains++;
                  }
                }
              }
            }

            if (subdomainLengths.length > 0) {
              const avgLen = mean(subdomainLengths);
              const avgEnt = mean(subdomainEntropies);
              findings.push(`Avg subdomain length: ${avgLen.toFixed(1)}`);
              findings.push(`Avg subdomain entropy: ${avgEnt.toFixed(4)}`);
              findings.push(`Long subdomains (>30 chars): ${longSubdomains}`);

              if (avgLen > 20 && avgEnt > 3.5) {
                findings.push(`[!] High subdomain length + entropy — strong DNS tunneling indicator`);
                suspicionScore += 3;
              } else if (avgLen > 15) {
                findings.push(`[!] Elevated subdomain lengths — possible DNS tunneling`);
                suspicionScore += 1;
              }
            }

            // Check TXT record responses
            const txtResponses = dnsPackets.filter(
              (p) => p.dns!.isResponse && p.dns!.answers.some((a) => a.type === 16),
            );
            if (txtResponses.length > 5) {
              findings.push(`[!] ${txtResponses.length} TXT record responses — commonly used for DNS tunneling`);
              suspicionScore += 1;
            }
          }
        } else {
          findings.push(`No DNS packets found`);
        }
        findings.push("");

        // --- Timing analysis ---
        findings.push(`=== Timing Analysis ===`);
        if (parsed.length > 2) {
          const timestamps = parsed.map((p) => p.packet.timestamp);
          const intervals: number[] = [];
          for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
          }

          const avgInterval = mean(intervals);
          const intervalStdDev = stddev(intervals);

          findings.push(`Avg inter-packet interval: ${(avgInterval * 1000).toFixed(3)}ms`);
          findings.push(`Interval stddev: ${(intervalStdDev * 1000).toFixed(3)}ms`);

          // Check for binary timing patterns (long/short intervals)
          if (avgInterval > 0 && intervalStdDev > 0) {
            const median = [...intervals].sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
            let transitions = 0;
            let prevHigh = intervals[0] > median;
            for (let i = 1; i < intervals.length; i++) {
              const curHigh = intervals[i] > median;
              if (curHigh !== prevHigh) transitions++;
              prevHigh = curHigh;
            }
            const transitionRate = transitions / (intervals.length - 1);

            if (transitionRate > 0.4 && transitionRate < 0.6) {
              findings.push(`[!] Timing pattern shows ~50% high/low transitions — possible binary timing covert channel`);
              suspicionScore += 2;
            }
          }
        }
        findings.push("");

        // --- Overall verdict ---
        findings.push(`=== Overall Verdict ===`);
        findings.push(`Suspicion score: ${suspicionScore}/15+`);
        if (suspicionScore >= 6) {
          findings.push(`VERDICT: LIKELY NETWORK STEGANOGRAPHY DETECTED`);
        } else if (suspicionScore >= 3) {
          findings.push(`VERDICT: SUSPICIOUS — further analysis recommended`);
        } else {
          findings.push(`VERDICT: No obvious network steganography indicators found`);
        }

        return text(findings.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 2. net_ip_header
  {
    name: "net_ip_header",
    description:
      "IP header covert field analysis. Examines TTL patterns, IP identification field entropy, and TOS/DSCP usage across packets to detect hidden data in IP header fields.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed, totalPackets } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== IP Header Covert Field Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Total packets: ${totalPackets}`);
        results.push("");

        const ipPackets = parsed.filter((p) => p.ip !== null);
        if (ipPackets.length === 0) {
          return text(`No IP packets found in capture.`);
        }

        results.push(`IP packets analyzed: ${ipPackets.length}`);
        results.push("");

        // --- TTL Analysis ---
        results.push(`=== TTL Analysis ===`);
        const ttls = ipPackets.map((p) => p.ip!.ttl);
        const ttlCounts = new Map<number, number>();
        for (const t of ttls) ttlCounts.set(t, (ttlCounts.get(t) ?? 0) + 1);

        const ttlEntropy = shannonEntropy(ttls);
        const uniqueTtls = new Set(ttls).size;

        results.push(`Unique TTL values: ${uniqueTtls}`);
        results.push(`TTL entropy: ${ttlEntropy.toFixed(4)} bits`);
        results.push(`TTL distribution:`);

        const sortedTtls = [...ttlCounts.entries()].sort((a, b) => b[1] - a[1]);
        for (const [ttl, count] of sortedTtls.slice(0, 15)) {
          const pct = ((count / ipPackets.length) * 100).toFixed(1);
          const bar = "#".repeat(Math.min(40, Math.round((count / ipPackets.length) * 40)));
          results.push(`  TTL=${ttl}: ${count} (${pct}%) ${bar}`);
        }
        if (sortedTtls.length > 15) results.push(`  ... and ${sortedTtls.length - 15} more values`);
        results.push("");

        // Standard TTL values are 32, 64, 128, 255 and decrements thereof
        const standardBases = [32, 64, 128, 255];
        let nonStandardTtls = 0;
        for (const t of ttls) {
          const isStandard = standardBases.some((base) => t <= base && t >= base - 30);
          if (!isStandard) nonStandardTtls++;
        }
        if (nonStandardTtls > ipPackets.length * 0.1) {
          results.push(`[!] ${nonStandardTtls} packets with non-standard TTL values — possible covert channel`);
        }

        // Per-flow TTL analysis
        const flowTtls = new Map<string, number[]>();
        for (const p of ipPackets) {
          const key = `${p.ip!.srcIp}->${p.ip!.dstIp}`;
          const arr = flowTtls.get(key) ?? [];
          arr.push(p.ip!.ttl);
          flowTtls.set(key, arr);
        }

        results.push(`Per-flow TTL variation:`);
        for (const [flow, ftls] of flowTtls) {
          if (ftls.length < 3) continue;
          const sd = stddev(ftls);
          const uniqueInFlow = new Set(ftls).size;
          if (sd > 1.0 || uniqueInFlow > 3) {
            results.push(`  ${flow}: ${ftls.length} pkts, unique=${uniqueInFlow}, stddev=${sd.toFixed(2)}${sd > 5 ? " [!] HIGH VARIATION" : ""}`);
          }
        }
        results.push("");

        // --- IP Identification Field ---
        results.push(`=== IP Identification Field ===`);
        const ids = ipPackets.map((p) => p.ip!.identification);
        const idEntropy = shannonEntropy(ids.map((id) => id & 0xff));
        const idHighEntropy = shannonEntropy(ids.map((id) => (id >> 8) & 0xff));

        results.push(`ID field low byte entropy: ${idEntropy.toFixed(4)}`);
        results.push(`ID field high byte entropy: ${idHighEntropy.toFixed(4)}`);

        // Check for sequential IDs (normal) vs random (suspicious)
        let sequential = 0;
        for (let i = 1; i < ids.length; i++) {
          const diff = ids[i] - ids[i - 1];
          if (diff >= 0 && diff <= 5) sequential++;
        }
        const seqRatio = sequential / (ids.length - 1);
        results.push(`Sequential ID ratio: ${(seqRatio * 100).toFixed(1)}%`);
        if (seqRatio < 0.3 && idEntropy > 7.0) {
          results.push(`[!] Randomized IP IDs with high entropy — possible data encoding`);
        }
        results.push("");

        // --- TOS/DSCP Field ---
        results.push(`=== TOS/DSCP Field ===`);
        const tosValues = ipPackets.map((p) => p.ip!.tos);
        const tosCounts = new Map<number, number>();
        for (const t of tosValues) tosCounts.set(t, (tosCounts.get(t) ?? 0) + 1);

        const nonZeroTos = tosValues.filter((t) => t !== 0).length;
        const tosEntropy = shannonEntropy(tosValues);
        const uniqueTos = new Set(tosValues).size;

        results.push(`Unique TOS values: ${uniqueTos}`);
        results.push(`TOS entropy: ${tosEntropy.toFixed(4)} bits`);
        results.push(`Non-zero TOS: ${nonZeroTos}/${ipPackets.length} (${((nonZeroTos / ipPackets.length) * 100).toFixed(1)}%)`);

        if (uniqueTos > 4) {
          results.push(`[!] Many distinct TOS values — unusual, possible covert channel`);
        }

        results.push(`TOS distribution:`);
        const sortedTos = [...tosCounts.entries()].sort((a, b) => b[1] - a[1]);
        for (const [tos, count] of sortedTos.slice(0, 10)) {
          results.push(`  TOS=0x${tos.toString(16).padStart(2, "0")}: ${count}`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 3. net_tcp_header
  {
    name: "net_tcp_header",
    description:
      "TCP sequence/acknowledgment number analysis. Checks for patterns in ISN (Initial Sequence Numbers), unusual TCP options, and seq/ack number anomalies that could indicate covert channel usage.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== TCP Sequence/ACK Number Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push("");

        const tcpPackets = parsed.filter((p) => p.tcp !== null);
        if (tcpPackets.length === 0) {
          return text(`No TCP packets found in capture.`);
        }

        results.push(`TCP packets: ${tcpPackets.length}`);
        results.push("");

        // --- ISN Analysis (SYN packets) ---
        results.push(`=== Initial Sequence Number (ISN) Analysis ===`);
        const synPackets = tcpPackets.filter((p) => p.tcp!.flags.syn && !p.tcp!.flags.ack);
        results.push(`SYN packets found: ${synPackets.length}`);

        if (synPackets.length > 1) {
          const isns = synPackets.map((p) => p.tcp!.seqNumber);

          // ISN entropy (analyze each byte separately)
          const isnByte0 = isns.map((n) => n & 0xff);
          const isnByte1 = isns.map((n) => (n >> 8) & 0xff);
          const isnByte2 = isns.map((n) => (n >> 16) & 0xff);
          const isnByte3 = isns.map((n) => (n >> 24) & 0xff);

          results.push(`ISN byte entropy: byte0=${shannonEntropy(isnByte0).toFixed(4)}, byte1=${shannonEntropy(isnByte1).toFixed(4)}, byte2=${shannonEntropy(isnByte2).toFixed(4)}, byte3=${shannonEntropy(isnByte3).toFixed(4)}`);

          // Check for sequential ISNs (normal increments)
          const isnDiffs: number[] = [];
          for (let i = 1; i < isns.length; i++) {
            isnDiffs.push((isns[i] - isns[i - 1] + 0x100000000) % 0x100000000);
          }
          const diffEntropy = shannonEntropy(isnDiffs.map((d) => d & 0xff));
          results.push(`ISN increment low byte entropy: ${diffEntropy.toFixed(4)}`);

          // Show ISNs
          for (let i = 0; i < Math.min(synPackets.length, 20); i++) {
            const p = synPackets[i];
            results.push(`  SYN #${i}: ISN=0x${p.tcp!.seqNumber.toString(16).padStart(8, "0")} src=${p.ip?.srcIp}:${p.tcp!.srcPort} -> ${p.ip?.dstIp}:${p.tcp!.dstPort}`);
          }
          if (synPackets.length > 20) results.push(`  ... and ${synPackets.length - 20} more`);
          results.push("");

          // Check for encoding patterns in ISNs
          const allSameUpper = isns.every((n) => (n >> 16) === (isns[0] >> 16));
          if (allSameUpper && isns.length > 3) {
            results.push(`[!] All ISNs share the same upper 16 bits — data may be encoded in lower bits`);
          }
        }
        results.push("");

        // --- Seq/Ack number patterns per flow ---
        results.push(`=== Per-Flow Sequence Analysis ===`);
        const flows = new Map<string, { seqs: number[]; acks: number[]; timestamps: number[] }>();
        for (const p of tcpPackets) {
          const key = `${p.ip?.srcIp}:${p.tcp!.srcPort}->${p.ip?.dstIp}:${p.tcp!.dstPort}`;
          const flow = flows.get(key) ?? { seqs: [], acks: [], timestamps: [] };
          flow.seqs.push(p.tcp!.seqNumber);
          flow.acks.push(p.tcp!.ackNumber);
          flow.timestamps.push(p.packet.timestamp);
          flows.set(key, flow);
        }

        for (const [flow, data] of flows) {
          if (data.seqs.length < 3) continue;

          // Check seq increments
          const seqIncrements: number[] = [];
          for (let i = 1; i < data.seqs.length; i++) {
            seqIncrements.push((data.seqs[i] - data.seqs[i - 1] + 0x100000000) % 0x100000000);
          }

          // Zero-increment packets (retransmits or keep-alives or covert)
          const zeroIncrements = seqIncrements.filter((d) => d === 0).length;
          const abnormalIncrements = seqIncrements.filter((d) => d > 65535).length;

          results.push(`Flow: ${flow} (${data.seqs.length} packets)`);
          results.push(`  Zero seq increments: ${zeroIncrements}`);
          if (abnormalIncrements > 0) {
            results.push(`  [!] Large seq jumps (>64K): ${abnormalIncrements} — suspicious`);
          }
        }
        results.push("");

        // --- TCP Options Analysis ---
        results.push(`=== TCP Options Analysis ===`);
        let optionPackets = 0;
        const optionLengths: number[] = [];
        let unusualOptions = 0;

        for (const p of tcpPackets) {
          if (p.tcp!.options.length > 0) {
            optionPackets++;
            optionLengths.push(p.tcp!.options.length);

            // Parse option kinds
            let offset = 0;
            const opts = p.tcp!.options;
            while (offset < opts.length) {
              const kind = opts[offset];
              if (kind === 0) break; // EOL
              if (kind === 1) { offset++; continue; } // NOP
              if (offset + 1 >= opts.length) break;
              const optLen = opts[offset + 1];
              if (optLen < 2) break;

              // Known option kinds: 2=MSS, 3=WScale, 4=SACK_Perm, 5=SACK, 8=Timestamp
              if (![2, 3, 4, 5, 8].includes(kind)) {
                unusualOptions++;
              }
              offset += optLen;
            }
          }
        }

        results.push(`Packets with TCP options: ${optionPackets}/${tcpPackets.length}`);
        if (unusualOptions > 0) {
          results.push(`[!] ${unusualOptions} packets with unusual/experimental TCP option kinds`);
        }

        if (optionLengths.length > 0) {
          const optEntropy = shannonEntropy(optionLengths);
          results.push(`Option length entropy: ${optEntropy.toFixed(4)}`);
        }

        // --- Window size patterns ---
        results.push("");
        results.push(`=== Window Size Analysis ===`);
        const windowSizes = tcpPackets.map((p) => p.tcp!.windowSize);
        const windowEntropy = shannonEntropy(windowSizes.map((w) => w & 0xff));
        const uniqueWindows = new Set(windowSizes).size;

        results.push(`Unique window sizes: ${uniqueWindows}`);
        results.push(`Window size low byte entropy: ${windowEntropy.toFixed(4)}`);
        if (windowEntropy > 7.0 && uniqueWindows > tcpPackets.length * 0.5) {
          results.push(`[!] Highly variable window sizes — possible covert channel in window field`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 4. net_icmp_payload
  {
    name: "net_icmp_payload",
    description:
      "ICMP echo payload analysis. Examines entropy, printable content ratio, payload size anomalies, and pattern consistency of ICMP echo request/reply payloads to detect covert data exfiltration.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== ICMP Payload Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push("");

        const icmpPackets = parsed.filter((p) => p.icmp !== null);
        if (icmpPackets.length === 0) {
          return text(`No ICMP packets found in capture.`);
        }

        results.push(`ICMP packets: ${icmpPackets.length}`);

        // Categorize by type
        const typeCounts = new Map<number, number>();
        for (const p of icmpPackets) {
          const t = p.icmp!.type;
          typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
        }
        results.push(`Type distribution:`);
        const typeNames: Record<number, string> = {
          0: "Echo Reply", 3: "Dest Unreachable", 8: "Echo Request",
          11: "Time Exceeded", 5: "Redirect",
        };
        for (const [type, count] of typeCounts) {
          results.push(`  Type ${type} (${typeNames[type] ?? "Other"}): ${count}`);
        }
        results.push("");

        // Focus on echo request/reply
        const echoPackets = icmpPackets.filter(
          (p) => p.icmp!.type === 8 || p.icmp!.type === 0,
        );
        results.push(`=== Echo Request/Reply Payloads ===`);
        results.push(`Echo packets: ${echoPackets.length}`);

        if (echoPackets.length === 0) {
          results.push(`No echo packets to analyze`);
          return text(results.join("\n"));
        }

        // Payload sizes
        const payloadSizes = echoPackets.map((p) => p.icmp!.payload.length);
        const avgSize = mean(payloadSizes);
        const sizeStd = stddev(payloadSizes);
        const uniqueSizes = new Set(payloadSizes).size;

        results.push(`Payload size: min=${Math.min(...payloadSizes)}, max=${Math.max(...payloadSizes)}, avg=${avgSize.toFixed(1)}, stddev=${sizeStd.toFixed(1)}`);
        results.push(`Unique payload sizes: ${uniqueSizes}`);

        if (sizeStd > avgSize * 0.5 && uniqueSizes > 5) {
          results.push(`[!] Highly variable payload sizes — unusual for standard ping`);
        }

        // Standard ping payloads are typically 32 or 56 bytes of pattern data
        const oversized = payloadSizes.filter((s) => s > 100).length;
        if (oversized > echoPackets.length * 0.5) {
          results.push(`[!] ${oversized}/${echoPackets.length} payloads >100 bytes — possible data exfiltration`);
        }
        results.push("");

        // Per-packet analysis
        results.push(`=== Per-Packet Payload Details ===`);
        for (let i = 0; i < Math.min(echoPackets.length, 20); i++) {
          const p = echoPackets[i];
          const payload = p.icmp!.payload;
          // Skip the first 4 bytes (ICMP ID + Seq) if payload is larger
          const dataPayload = payload.length > 4 ? payload.subarray(4) : payload;

          if (dataPayload.length === 0) {
            results.push(`  Pkt ${p.packet.index}: empty payload`);
            continue;
          }

          const ent = shannonEntropy(dataPayload);

          // Printable ratio
          let printable = 0;
          for (const b of dataPayload) {
            if (b >= 0x20 && b <= 0x7e) printable++;
          }
          const printableRatio = printable / dataPayload.length;

          // Check for repeating pattern (standard ping)
          let isRepeatingPattern = false;
          if (dataPayload.length >= 8) {
            const patternLen = 1;
            let isRepeat = true;
            const firstByte = dataPayload[0];
            for (let j = 1; j < dataPayload.length; j++) {
              if (dataPayload[j] !== firstByte && Math.abs(dataPayload[j] - dataPayload[j - 1]) !== 1) {
                isRepeat = false;
                break;
              }
            }
            if (isRepeat) isRepeatingPattern = true;
          }

          const typeName = p.icmp!.type === 8 ? "req" : "reply";
          let line = `  Pkt ${p.packet.index} (${typeName}): ${dataPayload.length}B, entropy=${ent.toFixed(3)}, printable=${(printableRatio * 100).toFixed(0)}%`;
          if (isRepeatingPattern) line += " [standard pattern]";
          else if (ent > 6.0) line += " [!] HIGH ENTROPY";
          else if (printableRatio > 0.8) line += " [!] TEXT CONTENT";
          results.push(line);

          // Show hex preview for suspicious payloads
          if ((ent > 6.0 || printableRatio > 0.7) && !isRepeatingPattern) {
            results.push(hexDump(dataPayload, 0, Math.min(64, dataPayload.length)));
          }
        }
        if (echoPackets.length > 20) results.push(`  ... and ${echoPackets.length - 20} more packets`);
        results.push("");

        // Combined entropy analysis
        results.push(`=== Combined Payload Analysis ===`);
        const allPayloads = Buffer.concat(
          echoPackets.map((p) => {
            const pl = p.icmp!.payload;
            return pl.length > 4 ? pl.subarray(4) : pl;
          }),
        );
        if (allPayloads.length > 0) {
          const combinedEntropy = shannonEntropy(allPayloads);
          results.push(`Combined payload entropy: ${combinedEntropy.toFixed(4)}`);
          results.push(`Total payload bytes: ${allPayloads.length}`);

          let totalPrintable = 0;
          for (const b of allPayloads) {
            if (b >= 0x20 && b <= 0x7e) totalPrintable++;
          }
          results.push(`Overall printable ratio: ${((totalPrintable / allPayloads.length) * 100).toFixed(1)}%`);

          if (combinedEntropy > 7.0) {
            results.push(`[!] Very high combined entropy — data likely encrypted or compressed`);
          }
          if (totalPrintable / allPayloads.length > 0.7) {
            results.push(`[!] High printable content — possible text/command exfiltration`);
            results.push(`ASCII preview: ${allPayloads.subarray(0, 200).toString("ascii").replace(/[^\x20-\x7E]/g, ".")}`);
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 5. net_dns_tunnel
  {
    name: "net_dns_tunnel",
    description:
      "DNS tunneling detection. Analyzes subdomain length distribution, label entropy, TXT record usage, query frequency per domain, and unique subdomain counts to identify DNS-based covert channels.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed, duration } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== DNS Tunneling Detection ===`);
        results.push(`File: ${filePath}`);
        results.push("");

        const dnsPackets = parsed.filter((p) => p.dns !== null);
        if (dnsPackets.length === 0) {
          return text(`No DNS packets found in capture.`);
        }

        const queries = dnsPackets.filter((p) => !p.dns!.isResponse);
        const responses = dnsPackets.filter((p) => p.dns!.isResponse);

        results.push(`DNS packets: ${dnsPackets.length} (queries: ${queries.length}, responses: ${responses.length})`);
        results.push(`Capture duration: ${duration.toFixed(3)}s`);
        if (duration > 0) {
          results.push(`DNS query rate: ${(queries.length / duration).toFixed(2)} queries/sec`);
        }
        results.push("");

        // --- Subdomain analysis ---
        results.push(`=== Subdomain Analysis ===`);
        const domainStats = new Map<string, { count: number; subdomains: Set<string>; totalSubLen: number }>();
        const allSubdomainLengths: number[] = [];
        const allSubdomainEntropies: number[] = [];

        for (const q of queries) {
          for (const question of q.dns!.questions) {
            const parts = question.name.split(".");
            if (parts.length < 2) continue;
            const baseDomain = parts.slice(-2).join(".");
            const subdomain = parts.slice(0, -2).join(".");

            const stats = domainStats.get(baseDomain) ?? { count: 0, subdomains: new Set(), totalSubLen: 0 };
            stats.count++;
            if (subdomain.length > 0) {
              stats.subdomains.add(subdomain);
              stats.totalSubLen += subdomain.length;
              allSubdomainLengths.push(subdomain.length);
              allSubdomainEntropies.push(shannonEntropyStr(subdomain));
            }
            domainStats.set(baseDomain, stats);
          }
        }

        // Per-domain breakdown
        const sortedDomains = [...domainStats.entries()].sort((a, b) => b[1].count - a[1].count);
        results.push(`Queried domains: ${sortedDomains.length}`);
        results.push("");

        for (const [domain, stats] of sortedDomains.slice(0, 20)) {
          const avgSubLen = stats.subdomains.size > 0
            ? (stats.totalSubLen / stats.count).toFixed(1)
            : "0";
          let line = `  ${domain}: ${stats.count} queries, ${stats.subdomains.size} unique subdomains, avg_sub_len=${avgSubLen}`;

          // Tunneling indicators
          const indicators: string[] = [];
          if (stats.subdomains.size > 20) indicators.push("many unique subdomains");
          if (parseFloat(avgSubLen) > 20) indicators.push("long subdomains");
          if (stats.count > 50 && duration > 0 && stats.count / duration > 5) indicators.push("high frequency");

          if (indicators.length > 0) {
            line += ` [!] ${indicators.join(", ")}`;
          }
          results.push(line);

          // Show sample subdomains for suspicious domains
          if (indicators.length > 0) {
            const samples = [...stats.subdomains].slice(0, 5);
            for (const sub of samples) {
              const ent = shannonEntropyStr(sub);
              results.push(`    "${sub}" (len=${sub.length}, entropy=${ent.toFixed(3)})`);
            }
            if (stats.subdomains.size > 5) results.push(`    ... and ${stats.subdomains.size - 5} more`);
          }
        }
        results.push("");

        // Global subdomain statistics
        if (allSubdomainLengths.length > 0) {
          results.push(`=== Global Subdomain Statistics ===`);
          results.push(`Total subdomains analyzed: ${allSubdomainLengths.length}`);
          results.push(`Length: min=${Math.min(...allSubdomainLengths)}, max=${Math.max(...allSubdomainLengths)}, avg=${mean(allSubdomainLengths).toFixed(1)}, stddev=${stddev(allSubdomainLengths).toFixed(1)}`);
          results.push(`Entropy: avg=${mean(allSubdomainEntropies).toFixed(4)}, stddev=${stddev(allSubdomainEntropies).toFixed(4)}`);

          const longSubs = allSubdomainLengths.filter((l) => l > 30).length;
          const highEntSubs = allSubdomainEntropies.filter((e) => e > 3.5).length;
          results.push(`Long subdomains (>30 chars): ${longSubs} (${((longSubs / allSubdomainLengths.length) * 100).toFixed(1)}%)`);
          results.push(`High entropy subdomains (>3.5): ${highEntSubs} (${((highEntSubs / allSubdomainLengths.length) * 100).toFixed(1)}%)`);

          if (mean(allSubdomainLengths) > 20 && mean(allSubdomainEntropies) > 3.5) {
            results.push(`\n[!] STRONG DNS TUNNELING INDICATOR: High average subdomain length + entropy`);
          }
          results.push("");
        }

        // --- TXT Record Analysis ---
        results.push(`=== TXT Record Analysis ===`);
        const txtQueryCount = queries.filter(
          (q) => q.dns!.questions.some((qq) => qq.type === 16),
        ).length;
        const txtResponses = responses.filter(
          (r) => r.dns!.answers.some((a) => a.type === 16),
        );

        results.push(`TXT queries: ${txtQueryCount}`);
        results.push(`TXT responses: ${txtResponses.length}`);

        if (txtResponses.length > 0) {
          let totalTxtLen = 0;
          const txtEntropies: number[] = [];
          for (const r of txtResponses) {
            for (const a of r.dns!.answers.filter((aa) => aa.type === 16)) {
              totalTxtLen += a.data.length;
              if (a.data.length > 0) txtEntropies.push(shannonEntropyStr(a.data));
            }
          }
          results.push(`Total TXT data: ${totalTxtLen} bytes`);
          if (txtEntropies.length > 0) {
            results.push(`TXT data avg entropy: ${mean(txtEntropies).toFixed(4)}`);
          }

          if (txtResponses.length > 10) {
            results.push(`[!] Significant TXT record traffic — commonly used for DNS tunneling data retrieval`);
          }
        }

        // --- Query Type Distribution ---
        results.push("");
        results.push(`=== Query Type Distribution ===`);
        const queryTypes = new Map<number, number>();
        for (const q of queries) {
          for (const question of q.dns!.questions) {
            queryTypes.set(question.type, (queryTypes.get(question.type) ?? 0) + 1);
          }
        }
        const qTypeNames: Record<number, string> = {
          1: "A", 2: "NS", 5: "CNAME", 6: "SOA", 12: "PTR",
          15: "MX", 16: "TXT", 28: "AAAA", 33: "SRV", 255: "ANY",
        };
        for (const [type, count] of [...queryTypes.entries()].sort((a, b) => b[1] - a[1])) {
          results.push(`  ${qTypeNames[type] ?? `TYPE${type}`}: ${count}`);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 6. net_http_header
  {
    name: "net_http_header",
    description:
      "HTTP header covert channel analysis. Examines unusual/custom headers, cookie value entropy, header ordering anomalies, and hidden data in standard header fields across HTTP traffic in a PCAP.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== HTTP Header Covert Channel Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push("");

        const httpPackets = parsed.filter((p) => p.http !== null);
        if (httpPackets.length === 0) {
          return text(`No HTTP packets found in capture.`);
        }

        const requests = httpPackets.filter((p) => p.http!.isRequest);
        const responses = httpPackets.filter((p) => !p.http!.isRequest);

        results.push(`HTTP packets: ${httpPackets.length} (requests: ${requests.length}, responses: ${responses.length})`);
        results.push("");

        // --- Standard vs unusual headers ---
        results.push(`=== Header Analysis ===`);
        const standardRequestHeaders = new Set([
          "host", "user-agent", "accept", "accept-language", "accept-encoding",
          "connection", "cookie", "referer", "content-type", "content-length",
          "authorization", "cache-control", "pragma", "upgrade-insecure-requests",
          "origin", "if-modified-since", "if-none-match", "te", "transfer-encoding",
          "dnt", "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "sec-fetch-user",
          "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform",
        ]);
        const standardResponseHeaders = new Set([
          "content-type", "content-length", "content-encoding", "transfer-encoding",
          "connection", "server", "date", "cache-control", "expires", "pragma",
          "set-cookie", "location", "etag", "last-modified", "access-control-allow-origin",
          "access-control-allow-methods", "access-control-allow-headers",
          "x-content-type-options", "x-frame-options", "x-xss-protection",
          "strict-transport-security", "vary", "age", "via",
        ]);

        const unusualHeaders = new Map<string, number>();
        const allHeaders = new Map<string, string[]>();

        for (const p of httpPackets) {
          const isReq = p.http!.isRequest;
          const standard = isReq ? standardRequestHeaders : standardResponseHeaders;
          for (const [key, value] of p.http!.headers) {
            // Collect all values for each header
            const existing = allHeaders.get(key) ?? [];
            existing.push(value);
            allHeaders.set(key, existing);

            if (!standard.has(key) && !key.startsWith("x-")) {
              unusualHeaders.set(key, (unusualHeaders.get(key) ?? 0) + 1);
            }
          }
        }

        if (unusualHeaders.size > 0) {
          results.push(`Unusual headers found:`);
          for (const [header, count] of [...unusualHeaders.entries()].sort((a, b) => b[1] - a[1])) {
            results.push(`  [!] "${header}": ${count} occurrences`);
            // Show sample values
            const values = allHeaders.get(header) ?? [];
            for (const v of values.slice(0, 3)) {
              const ent = shannonEntropyStr(v);
              results.push(`    value="${v.substring(0, 100)}" (len=${v.length}, entropy=${ent.toFixed(3)})`);
            }
          }
        } else {
          results.push(`No unusual headers found`);
        }
        results.push("");

        // --- X- custom header analysis ---
        results.push(`=== Custom X- Headers ===`);
        const xHeaders = new Map<string, string[]>();
        for (const [key, values] of allHeaders) {
          if (key.startsWith("x-")) {
            xHeaders.set(key, values);
          }
        }

        if (xHeaders.size > 0) {
          for (const [header, values] of xHeaders) {
            const entropies = values.map((v) => shannonEntropyStr(v));
            const avgEnt = mean(entropies);
            const avgLen = mean(values.map((v) => v.length));
            let line = `  ${header}: ${values.length} values, avg_len=${avgLen.toFixed(1)}, avg_entropy=${avgEnt.toFixed(3)}`;
            if (avgEnt > 4.0 && avgLen > 20) {
              line += ` [!] HIGH ENTROPY — possible data channel`;
            }
            results.push(line);
          }
        } else {
          results.push(`  No X- headers found`);
        }
        results.push("");

        // --- Cookie entropy analysis ---
        results.push(`=== Cookie Analysis ===`);
        const cookieValues = allHeaders.get("cookie") ?? [];
        const setCookieValues = allHeaders.get("set-cookie") ?? [];

        results.push(`Cookie headers: ${cookieValues.length}, Set-Cookie headers: ${setCookieValues.length}`);
        if (cookieValues.length > 0) {
          for (let i = 0; i < Math.min(cookieValues.length, 10); i++) {
            const cookie = cookieValues[i];
            const ent = shannonEntropyStr(cookie);
            let line = `  Cookie #${i}: len=${cookie.length}, entropy=${ent.toFixed(3)}`;
            if (ent > 5.0 && cookie.length > 100) {
              line += ` [!] HIGH ENTROPY + LONG — possible covert data`;
            }
            results.push(line);

            // Parse individual cookie key=value pairs
            const pairs = cookie.split(";").map((s) => s.trim());
            const suspiciousPairs: string[] = [];
            for (const pair of pairs) {
              const eqIdx = pair.indexOf("=");
              if (eqIdx < 0) continue;
              const val = pair.substring(eqIdx + 1);
              if (val.length > 50 && shannonEntropyStr(val) > 4.5) {
                suspiciousPairs.push(`    "${pair.substring(0, eqIdx)}": len=${val.length}, ent=${shannonEntropyStr(val).toFixed(3)}`);
              }
            }
            if (suspiciousPairs.length > 0) {
              results.push(`  High-entropy cookie values:`);
              results.push(...suspiciousPairs);
            }
          }
        }
        results.push("");

        // --- Header ordering analysis ---
        results.push(`=== Header Ordering ===`);
        const headerOrders: string[][] = [];
        for (const p of requests) {
          const order = [...p.http!.headers.keys()];
          headerOrders.push(order);
        }

        if (headerOrders.length > 2) {
          // Check if header ordering varies (same client should have consistent order)
          let orderVaries = false;
          const firstOrder = headerOrders[0].join(",");
          for (let i = 1; i < headerOrders.length; i++) {
            if (headerOrders[i].join(",") !== firstOrder) {
              orderVaries = true;
              break;
            }
          }

          results.push(`Request header orders: ${headerOrders.length}`);
          results.push(`Consistent ordering: ${orderVaries ? "NO — varies between requests" : "YES"}`);
          if (orderVaries) {
            results.push(`[!] Varying header order could encode information bits`);
            // Show unique orderings
            const uniqueOrders = new Set(headerOrders.map((o) => o.join(",")));
            results.push(`Unique orderings: ${uniqueOrders.size}`);
          }
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 7. net_timing
  {
    name: "net_timing",
    description:
      "Inter-packet timing analysis. Computes packet arrival intervals and analyzes them for binary encoding patterns (e.g., short interval = bit 0, long interval = bit 1). Detects timing-based covert channels.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed, duration, totalPackets } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== Inter-Packet Timing Analysis ===`);
        results.push(`File: ${filePath}`);
        results.push(`Packets: ${totalPackets}, Duration: ${duration.toFixed(3)}s`);
        results.push("");

        if (parsed.length < 3) {
          return text(`Not enough packets for timing analysis (need at least 3).`);
        }

        // Compute all inter-packet intervals
        const timestamps = parsed.map((p) => p.packet.timestamp);
        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        // Global statistics
        const avgInterval = mean(intervals);
        const intervalStd = stddev(intervals);
        const minInterval = Math.min(...intervals);
        const maxInterval = Math.max(...intervals);
        const medianInterval = [...intervals].sort((a, b) => a - b)[Math.floor(intervals.length / 2)];

        results.push(`=== Interval Statistics ===`);
        results.push(`Mean: ${(avgInterval * 1000).toFixed(4)}ms`);
        results.push(`Median: ${(medianInterval * 1000).toFixed(4)}ms`);
        results.push(`StdDev: ${(intervalStd * 1000).toFixed(4)}ms`);
        results.push(`Min: ${(minInterval * 1000).toFixed(4)}ms, Max: ${(maxInterval * 1000).toFixed(4)}ms`);
        results.push(`Coefficient of variation: ${avgInterval > 0 ? (intervalStd / avgInterval).toFixed(4) : "N/A"}`);
        results.push("");

        // Interval histogram (binned)
        results.push(`=== Interval Distribution ===`);
        const numBins = 20;
        const binWidth = (maxInterval - minInterval) / numBins || 0.001;
        const bins = new Array(numBins).fill(0);
        for (const interval of intervals) {
          const bin = Math.min(Math.floor((interval - minInterval) / binWidth), numBins - 1);
          bins[bin]++;
        }

        const maxBinCount = Math.max(...bins);
        for (let i = 0; i < numBins; i++) {
          const lo = ((minInterval + i * binWidth) * 1000).toFixed(3);
          const hi = ((minInterval + (i + 1) * binWidth) * 1000).toFixed(3);
          const bar = "#".repeat(Math.round((bins[i] / maxBinCount) * 30));
          if (bins[i] > 0) {
            results.push(`  ${lo}-${hi}ms: ${bins[i]} ${bar}`);
          }
        }
        results.push("");

        // --- Binary timing pattern detection ---
        results.push(`=== Binary Timing Pattern Detection ===`);

        // Split intervals into high/low using median as threshold
        const binaryBits: number[] = [];
        for (const interval of intervals) {
          binaryBits.push(interval > medianInterval ? 1 : 0);
        }

        // Check for 50/50 distribution (ideal for binary encoding)
        const onesCount = binaryBits.reduce((a, b) => a + b, 0);
        const zerosCount = binaryBits.length - onesCount;
        const balance = Math.min(onesCount, zerosCount) / Math.max(onesCount, zerosCount);

        results.push(`Binary split (median threshold ${(medianInterval * 1000).toFixed(3)}ms):`);
        results.push(`  Short (0): ${zerosCount}, Long (1): ${onesCount}, Balance: ${balance.toFixed(4)}`);

        // Transition rate
        let transitions = 0;
        for (let i = 1; i < binaryBits.length; i++) {
          if (binaryBits[i] !== binaryBits[i - 1]) transitions++;
        }
        const transitionRate = transitions / (binaryBits.length - 1);
        results.push(`  Transition rate: ${(transitionRate * 100).toFixed(1)}% (50% = random)`);

        // LSB entropy of binary stream
        const bitEntropy = shannonEntropy(binaryBits);
        results.push(`  Bit stream entropy: ${bitEntropy.toFixed(4)} (1.0 = maximum)`);

        if (balance > 0.9 && bitEntropy > 0.95 && transitionRate > 0.35 && transitionRate < 0.65) {
          results.push(`\n  [!] STRONG TIMING COVERT CHANNEL INDICATOR:`);
          results.push(`      Balanced distribution, high entropy, reasonable transition rate`);
        } else if (balance > 0.8 && bitEntropy > 0.9) {
          results.push(`\n  [!] Possible timing covert channel — balanced binary distribution detected`);
        }
        results.push("");

        // --- Try to decode timing bits as ASCII ---
        results.push(`=== Timing Bit Decode Attempt ===`);
        const byteCount = Math.floor(binaryBits.length / 8);
        if (byteCount > 0) {
          const decodedBytes = Buffer.alloc(byteCount);
          for (let i = 0; i < byteCount; i++) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
              byte = (byte << 1) | binaryBits[i * 8 + b];
            }
            decodedBytes[i] = byte;
          }

          let printable = 0;
          for (const b of decodedBytes) {
            if (b >= 0x20 && b <= 0x7e) printable++;
          }
          const printableRatio = printable / decodedBytes.length;

          results.push(`Decoded ${byteCount} bytes, printable ratio: ${(printableRatio * 100).toFixed(1)}%`);
          if (printableRatio > 0.6) {
            results.push(`[!] High printable ratio — possible text encoded in timing:`);
            results.push(`Preview: ${decodedBytes.toString("ascii").replace(/[^\x20-\x7E]/g, ".").substring(0, 200)}`);
          }
          results.push(`Hex: ${decodedBytes.subarray(0, 32).toString("hex")}`);
        }
        results.push("");

        // --- Per-flow timing analysis ---
        results.push(`=== Per-Flow Timing ===`);
        const flowTimings = new Map<string, number[]>();
        for (const p of parsed) {
          if (!p.ip) continue;
          const key = `${p.ip.srcIp}->${p.ip.dstIp}`;
          const arr = flowTimings.get(key) ?? [];
          arr.push(p.packet.timestamp);
          flowTimings.set(key, arr);
        }

        for (const [flow, ts] of flowTimings) {
          if (ts.length < 5) continue;
          const flowIntervals: number[] = [];
          for (let i = 1; i < ts.length; i++) {
            flowIntervals.push(ts[i] - ts[i - 1]);
          }
          const flowMean = mean(flowIntervals);
          const flowStd = stddev(flowIntervals);
          const cv = flowMean > 0 ? flowStd / flowMean : 0;

          let line = `  ${flow}: ${ts.length} pkts, mean_interval=${(flowMean * 1000).toFixed(3)}ms, CV=${cv.toFixed(3)}`;
          if (cv > 0.8 && cv < 1.5 && ts.length > 10) {
            line += ` [!] timing variance suitable for covert channel`;
          }
          results.push(line);
        }

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },

  // 8. net_stats
  {
    name: "net_stats",
    description:
      "PCAP statistics summary. Reports packet count, protocol distribution, top IP pairs, port usage, capture duration, and data volume for an overview of the capture file.",
    schema: {
      file_path: z.string().describe("Path to PCAP capture file"),
    },
    execute: async (args) => {
      try {
        const filePath = args.file_path as string;
        const buf = await readFileInput(filePath);
        const { parsed, duration, totalPackets } = parseAllPackets(buf);
        const results: string[] = [];

        results.push(`=== PCAP Statistics Summary ===`);
        results.push(`File: ${filePath}`);
        results.push(`File size: ${buf.length} bytes`);
        results.push(`Total packets: ${totalPackets}`);
        results.push(`Capture duration: ${duration.toFixed(3)}s`);
        if (duration > 0) {
          results.push(`Packet rate: ${(totalPackets / duration).toFixed(2)} pkt/s`);
        }
        results.push("");

        // --- Protocol distribution ---
        results.push(`=== Protocol Distribution ===`);
        const protocolCounts = new Map<string, number>();
        for (const p of parsed) {
          protocolCounts.set(p.protocol, (protocolCounts.get(p.protocol) ?? 0) + 1);
        }
        for (const [proto, count] of [...protocolCounts.entries()].sort((a, b) => b[1] - a[1])) {
          const pct = ((count / totalPackets) * 100).toFixed(1);
          const bar = "#".repeat(Math.round((count / totalPackets) * 40));
          results.push(`  ${proto.padEnd(8)}: ${count} (${pct}%) ${bar}`);
        }
        results.push("");

        // --- IP protocol numbers ---
        results.push(`=== IP Protocol Numbers ===`);
        const ipProtos = new Map<number, number>();
        for (const p of parsed) {
          if (p.ip) {
            ipProtos.set(p.ip.protocol, (ipProtos.get(p.ip.protocol) ?? 0) + 1);
          }
        }
        const protoNames: Record<number, string> = {
          1: "ICMP", 6: "TCP", 17: "UDP", 2: "IGMP", 47: "GRE", 50: "ESP", 51: "AH",
        };
        for (const [proto, count] of [...ipProtos.entries()].sort((a, b) => b[1] - a[1])) {
          results.push(`  ${proto} (${protoNames[proto] ?? "Unknown"}): ${count}`);
        }
        results.push("");

        // --- Top IP pairs ---
        results.push(`=== Top IP Pairs ===`);
        const ipPairs = new Map<string, { count: number; bytes: number }>();
        for (const p of parsed) {
          if (p.ip) {
            const key = `${p.ip.srcIp} <-> ${p.ip.dstIp}`;
            const reverseKey = `${p.ip.dstIp} <-> ${p.ip.srcIp}`;
            const existingKey = ipPairs.has(key) ? key : ipPairs.has(reverseKey) ? reverseKey : key;
            const entry = ipPairs.get(existingKey) ?? { count: 0, bytes: 0 };
            entry.count++;
            entry.bytes += p.ip.totalLength;
            ipPairs.set(existingKey, entry);
          }
        }

        const sortedPairs = [...ipPairs.entries()].sort((a, b) => b[1].count - a[1].count);
        for (const [pair, stats] of sortedPairs.slice(0, 15)) {
          results.push(`  ${pair}: ${stats.count} pkts, ${stats.bytes} bytes`);
        }
        if (sortedPairs.length > 15) results.push(`  ... and ${sortedPairs.length - 15} more pairs`);
        results.push("");

        // --- Port usage ---
        results.push(`=== Top Ports ===`);
        const portCounts = new Map<number, { tcp: number; udp: number }>();
        for (const p of parsed) {
          if (p.tcp) {
            for (const port of [p.tcp.srcPort, p.tcp.dstPort]) {
              const entry = portCounts.get(port) ?? { tcp: 0, udp: 0 };
              entry.tcp++;
              portCounts.set(port, entry);
            }
          }
          if (p.udp) {
            for (const port of [p.udp.srcPort, p.udp.dstPort]) {
              const entry = portCounts.get(port) ?? { tcp: 0, udp: 0 };
              entry.udp++;
              portCounts.set(port, entry);
            }
          }
        }

        const sortedPorts = [...portCounts.entries()]
          .map(([port, counts]) => ({ port, total: counts.tcp + counts.udp, ...counts }))
          .sort((a, b) => b.total - a.total);

        const commonPorts: Record<number, string> = {
          20: "FTP-Data", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
          53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS",
          993: "IMAPS", 995: "POP3S", 3306: "MySQL", 5432: "PostgreSQL",
          8080: "HTTP-Alt", 8443: "HTTPS-Alt",
        };

        for (const entry of sortedPorts.slice(0, 20)) {
          const name = commonPorts[entry.port] ?? "";
          results.push(`  Port ${entry.port}${name ? ` (${name})` : ""}: ${entry.total} (TCP: ${entry.tcp}, UDP: ${entry.udp})`);
        }
        if (sortedPorts.length > 20) results.push(`  ... and ${sortedPorts.length - 20} more ports`);
        results.push("");

        // --- Data volume ---
        results.push(`=== Data Volume ===`);
        let totalBytes = 0;
        let totalPayloadBytes = 0;
        for (const p of parsed) {
          totalBytes += p.packet.capturedLength;
          if (p.tcp) totalPayloadBytes += p.tcp.payload.length;
          else if (p.udp) totalPayloadBytes += p.udp.payload.length;
          else if (p.icmp) totalPayloadBytes += p.icmp.payload.length;
        }
        results.push(`Total captured: ${totalBytes} bytes (${(totalBytes / 1024).toFixed(1)} KB)`);
        results.push(`Total payload: ${totalPayloadBytes} bytes (${(totalPayloadBytes / 1024).toFixed(1)} KB)`);
        if (duration > 0) {
          results.push(`Throughput: ${((totalBytes * 8) / duration / 1000).toFixed(2)} Kbps`);
        }

        // Packet size distribution
        const pktSizes = parsed.map((p) => p.packet.capturedLength);
        results.push(`Packet sizes: min=${Math.min(...pktSizes)}, max=${Math.max(...pktSizes)}, avg=${mean(pktSizes).toFixed(1)}`);

        return text(results.join("\n"));
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  },
];

// ─── Helper (used in net_detect) ───

function sizeVariance(sizes: number[]): number {
  if (sizes.length < 2) return 0;
  const m = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  return sizes.reduce((a, v) => a + (v - m) ** 2, 0) / sizes.length;
}
