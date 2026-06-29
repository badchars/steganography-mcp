// ─── Shannon Entropy ───

/** Calculate Shannon entropy for byte-level data (0-8 bits) */
export function shannonEntropy(data: Buffer | number[]): number {
  const arr = data instanceof Buffer ? Array.from(data) : data;
  if (arr.length === 0) return 0;

  const freq = new Map<number, number>();
  for (const v of arr) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / arr.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** Calculate Shannon entropy for string data */
export function shannonEntropyStr(str: string): number {
  if (str.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / str.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ─── Histogram ───

/** Generate a frequency histogram for values in a given range */
export function histogram(data: number[], bins: number = 256): number[] {
  const hist = new Array(bins).fill(0);
  for (const v of data) {
    const idx = Math.min(Math.max(Math.floor(v), 0), bins - 1);
    hist[idx]++;
  }
  return hist;
}

// ─── Chi-Square Test ───

export interface ChiSquareResult {
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
}

/** Standard normal CDF approximation (Abramowitz and Stegun) */
function normalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

/** Chi-square p-value approximation using Wilson-Hilferty transformation */
function approxChiSquarePValue(chi2: number, df: number): number {
  if (df <= 0) return 1;
  if (chi2 <= 0) return 1;
  const k = df;
  const z = Math.pow(chi2 / k, 1 / 3) - (1 - 2 / (9 * k));
  const denom = Math.sqrt(2 / (9 * k));
  if (denom === 0) return 0;
  const zScore = z / denom;
  return 1 - normalCdf(zScore);
}

/** Chi-square goodness-of-fit test */
export function chiSquareTest(
  observed: number[],
  expected: number[],
): ChiSquareResult {
  let chi2 = 0;
  const df = Math.max(observed.length - 1, 1);

  for (let i = 0; i < observed.length; i++) {
    if (expected[i] > 0) {
      chi2 += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }
  }

  const pValue = approxChiSquarePValue(chi2, df);
  return { chiSquare: chi2, pValue, degreesOfFreedom: df };
}

// ─── LSB-Specific Chi-Square (Pairs of Values Attack) ───

export interface LsbChiSquareResult extends ChiSquareResult {
  embeddingProbability: number;
  verdict: "clean" | "suspicious" | "likely_stego";
}

/**
 * Chi-square test specifically for LSB steganography detection.
 * Groups adjacent pixel value pairs (0,1), (2,3), (4,5)...
 * LSB replacement equalizes these pairs, detectable via chi-square.
 * High p-value = pairs are equalized = likely stego.
 */
export function chiSquareLsbTest(pixelValues: number[]): LsbChiSquareResult {
  const hist = histogram(pixelValues, 256);
  const observed: number[] = [];
  const expected: number[] = [];

  for (let i = 0; i < 256; i += 2) {
    const pair = hist[i] + hist[i + 1];
    if (pair > 0) {
      observed.push(hist[i]);
      expected.push(pair / 2);
      observed.push(hist[i + 1]);
      expected.push(pair / 2);
    }
  }

  const result = chiSquareTest(observed, expected);
  const embeddingProbability = result.pValue;
  const verdict: LsbChiSquareResult["verdict"] =
    embeddingProbability > 0.95
      ? "likely_stego"
      : embeddingProbability > 0.5
        ? "suspicious"
        : "clean";

  return { ...result, embeddingProbability, verdict };
}

// ─── RS Analysis (Fridrich-Goljan-Du) ───

export interface RsAnalysisResult {
  rm: number;
  sm: number;
  rNegM: number;
  sNegM: number;
  estimatedEmbeddingRate: number;
  verdict: "clean" | "suspicious" | "likely_stego";
}

/**
 * Regular-Singular steganalysis.
 * Analyzes groups of pixels using flipping functions.
 * Compares regular/singular group counts for positive and negative masks.
 * Difference indicates LSB embedding.
 */
export function rsAnalysis(
  pixels: Buffer,
  width: number,
  height: number,
  channel: number = 0,
): RsAnalysisResult {
  const values: number[] = [];
  const total = width * height;
  for (let i = 0; i < total; i++) {
    values.push(pixels[i * 4 + channel]);
  }

  const f1 = (x: number) => (x % 2 === 0 ? x + 1 : x - 1);
  const fNeg1 = (x: number) => (x % 2 === 0 ? x - 1 : x + 1);

  const discriminate = (group: number[]): number => {
    let sum = 0;
    for (let i = 1; i < group.length; i++) {
      sum += Math.abs(group[i] - group[i - 1]);
    }
    return sum;
  };

  const groupSize = 4;
  let rm = 0,
    sm = 0;
  let rNegM = 0,
    sNegM = 0;
  let totalGroups = 0;

  for (let i = 0; i + groupSize <= values.length; i += groupSize) {
    const group = values.slice(i, i + groupSize);
    const d0 = discriminate(group);

    // Mask M = [1,0,1,0] — apply F1 to even indices
    const g1 = group.map((v, idx) => (idx % 2 === 0 ? f1(v) : v));
    const d1 = discriminate(g1);
    if (d1 > d0) rm++;
    else if (d1 < d0) sm++;

    // Mask -M — apply F-1 to even indices
    const gNeg1 = group.map((v, idx) => (idx % 2 === 0 ? fNeg1(v) : v));
    const dNeg1 = discriminate(gNeg1);
    if (dNeg1 > d0) rNegM++;
    else if (dNeg1 < d0) sNegM++;

    totalGroups++;
  }

  if (totalGroups === 0) {
    return { rm: 0, sm: 0, rNegM: 0, sNegM: 0, estimatedEmbeddingRate: 0, verdict: "clean" };
  }

  const rmN = rm / totalGroups;
  const smN = sm / totalGroups;
  const rNegMN = rNegM / totalGroups;
  const sNegMN = sNegM / totalGroups;

  const d0 = rmN - smN;
  const d1 = rNegMN - sNegMN;

  let estimatedEmbeddingRate = 0;
  if (Math.abs(d0 + d1) > 0.001) {
    estimatedEmbeddingRate = (d0 - d1) / (2 * (d0 + d1));
    estimatedEmbeddingRate = Math.max(0, Math.min(1, estimatedEmbeddingRate));
  }

  const verdict: RsAnalysisResult["verdict"] =
    estimatedEmbeddingRate > 0.15
      ? "likely_stego"
      : estimatedEmbeddingRate > 0.05
        ? "suspicious"
        : "clean";

  return { rm: rmN, sm: smN, rNegM: rNegMN, sNegM: sNegMN, estimatedEmbeddingRate, verdict };
}

// ─── Sample Pair Analysis (SPA) ───

export interface SpaResult {
  estimatedEmbeddingRate: number;
  verdict: "clean" | "suspicious" | "likely_stego";
}

/**
 * Sample Pair Analysis for LSB detection.
 * Analyzes pairs of adjacent pixel values.
 * Counts trace and closure pairs to estimate embedding rate.
 */
export function samplePairAnalysis(values: number[]): SpaResult {
  if (values.length < 2) {
    return { estimatedEmbeddingRate: 0, verdict: "clean" };
  }

  let p = 0; // count of pairs where both values are even or both odd
  let n = 0; // count of pairs where one is even, one is odd
  let z = 0; // count of equal pairs

  for (let i = 0; i < values.length - 1; i += 2) {
    const a = values[i];
    const b = values[i + 1];
    if (a === b) {
      z++;
    } else if ((a % 2) === (b % 2)) {
      p++;
    } else {
      n++;
    }
  }

  const total = p + n + z;
  if (total === 0) return { estimatedEmbeddingRate: 0, verdict: "clean" };

  // SPA estimation: embedding rate related to (p - n) / total
  const diff = Math.abs(p - n) / total;
  const estimatedEmbeddingRate = Math.max(0, Math.min(1, 1 - diff * 4));

  const verdict: SpaResult["verdict"] =
    estimatedEmbeddingRate > 0.15
      ? "likely_stego"
      : estimatedEmbeddingRate > 0.05
        ? "suspicious"
        : "clean";

  return { estimatedEmbeddingRate, verdict };
}

// ─── Block Entropy Analysis ───

export interface BlockEntropyResult {
  blocks: Array<{
    offset: number;
    size: number;
    entropy: number;
    classification: "low" | "normal" | "high" | "encrypted";
  }>;
  overallEntropy: number;
  averageBlockEntropy: number;
  highEntropyBlocks: number;
}

/** Analyze entropy in blocks across a buffer */
export function blockEntropy(
  data: Buffer,
  blockSize: number = 1024,
): BlockEntropyResult {
  const blocks: BlockEntropyResult["blocks"] = [];
  let totalEntropy = 0;

  for (let offset = 0; offset < data.length; offset += blockSize) {
    const end = Math.min(offset + blockSize, data.length);
    const block = data.subarray(offset, end);
    const ent = shannonEntropy(block);
    totalEntropy += ent;

    let classification: "low" | "normal" | "high" | "encrypted";
    if (ent < 1.0) classification = "low";
    else if (ent < 6.0) classification = "normal";
    else if (ent < 7.5) classification = "high";
    else classification = "encrypted";

    blocks.push({ offset, size: end - offset, entropy: ent, classification });
  }

  const overallEntropy = shannonEntropy(data);
  const averageBlockEntropy = blocks.length > 0 ? totalEntropy / blocks.length : 0;
  const highEntropyBlocks = blocks.filter((b) => b.entropy >= 7.0).length;

  return { blocks, overallEntropy, averageBlockEntropy, highEntropyBlocks };
}

// ─── Byte Frequency Analysis ───

export interface FrequencyResult {
  frequencies: number[];
  mostCommon: Array<{ value: number; count: number; percentage: number }>;
  leastCommon: Array<{ value: number; count: number; percentage: number }>;
  uniformityScore: number;
  chiSquareUniformity: ChiSquareResult;
}

/** Analyze byte frequency distribution */
export function byteFrequency(data: Buffer): FrequencyResult {
  const freq = new Array(256).fill(0);
  for (const b of data) freq[b]++;

  const sorted = freq
    .map((count: number, value: number) => ({ value, count, percentage: (count / data.length) * 100 }))
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count);

  const expected = new Array(256).fill(data.length / 256);
  const chiResult = chiSquareTest(freq, expected);

  // Uniformity score: 1.0 = perfectly uniform, 0.0 = all same byte
  const maxEntropy = Math.log2(256);
  const currentEntropy = shannonEntropy(data);
  const uniformityScore = currentEntropy / maxEntropy;

  return {
    frequencies: freq,
    mostCommon: sorted.slice(0, 10),
    leastCommon: sorted.filter((s: { count: number }) => s.count > 0).slice(-10).reverse(),
    uniformityScore,
    chiSquareUniformity: chiResult,
  };
}
