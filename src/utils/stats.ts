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

// ─── Discrete Fourier Transform (Spread Spectrum Steganalysis) ───

export interface DftResult {
  magnitudes: Float64Array;
  phases: Float64Array;
  dominantFrequencies: Array<{ index: number; magnitude: number; frequency: number }>;
  spectralFlatness: number;
}

/**
 * Compute the Discrete Fourier Transform of a real-valued signal.
 * Returns magnitudes, phases, top-10 dominant frequencies, and spectral flatness.
 * Signal is downsampled to max 8192 samples for performance.
 * Only the first N/2 frequencies (up to Nyquist) are computed.
 */
export function discreteFourierTransform(signal: number[], sampleRate: number = 1.0): DftResult {
  // Downsample if longer than 8192 by averaging consecutive pairs
  let samples = signal;
  while (samples.length > 8192) {
    const downsampled: number[] = [];
    for (let i = 0; i < samples.length - 1; i += 2) {
      downsampled.push((samples[i] + samples[i + 1]) / 2);
    }
    // If odd length, include the last sample
    if (samples.length % 2 !== 0) {
      downsampled.push(samples[samples.length - 1]);
    }
    samples = downsampled;
  }

  const N = samples.length;
  const halfN = Math.floor(N / 2);

  if (halfN === 0) {
    return {
      magnitudes: new Float64Array(0),
      phases: new Float64Array(0),
      dominantFrequencies: [],
      spectralFlatness: 0,
    };
  }

  const magnitudes = new Float64Array(halfN);
  const phases = new Float64Array(halfN);

  for (let k = 0; k < halfN; k++) {
    let re = 0;
    let im = 0;
    const freqFactor = (2 * Math.PI * k) / N;
    for (let n = 0; n < N; n++) {
      const angle = freqFactor * n;
      re += samples[n] * Math.cos(angle);
      im -= samples[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(re * re + im * im);
    phases[k] = Math.atan2(im, re);
  }

  // Find top 10 dominant frequencies by magnitude
  const indexed: Array<{ index: number; magnitude: number }> = [];
  for (let k = 0; k < halfN; k++) {
    indexed.push({ index: k, magnitude: magnitudes[k] });
  }
  indexed.sort((a, b) => b.magnitude - a.magnitude);
  const top10 = indexed.slice(0, Math.min(10, indexed.length));
  const dominantFrequencies = top10.map((entry) => ({
    index: entry.index,
    magnitude: entry.magnitude,
    frequency: (entry.index * sampleRate) / N,
  }));

  // Spectral flatness: exp(mean(log(power))) / mean(power)
  // Power spectrum = magnitude^2
  let logPowerSum = 0;
  let powerSum = 0;
  let nonZeroCount = 0;

  for (let k = 0; k < halfN; k++) {
    const power = magnitudes[k] * magnitudes[k];
    powerSum += power;
    if (power > 0) {
      logPowerSum += Math.log(power);
      nonZeroCount++;
    }
  }

  let spectralFlatness = 0;
  if (nonZeroCount > 0 && powerSum > 0) {
    const geometricMean = Math.exp(logPowerSum / halfN);
    const arithmeticMean = powerSum / halfN;
    spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
  }

  return { magnitudes, phases, dominantFrequencies, spectralFlatness };
}

// ─── Autocorrelation (Spread Spectrum Detection) ───

export interface AutocorrelationResult {
  values: Float64Array;
  peaks: Array<{ lag: number; value: number }>;
  periodicity: number | null;
  isperiodic: boolean;
}

/**
 * Compute normalized autocorrelation of a signal.
 * Finds peaks (local maxima above 0.3) and detects periodicity.
 */
export function autocorrelation(signal: number[], maxLag?: number): AutocorrelationResult {
  const N = signal.length;
  const effectiveMaxLag = maxLag ?? Math.min(Math.floor(N / 2), 512);

  if (N < 2) {
    return {
      values: new Float64Array(0),
      peaks: [],
      periodicity: null,
      isperiodic: false,
    };
  }

  // Compute mean
  let sum = 0;
  for (let i = 0; i < N; i++) {
    sum += signal[i];
  }
  const mean = sum / N;

  // Compute variance
  let variance = 0;
  for (let i = 0; i < N; i++) {
    const diff = signal[i] - mean;
    variance += diff * diff;
  }
  variance /= N;

  if (variance === 0) {
    const values = new Float64Array(effectiveMaxLag + 1);
    values.fill(1); // constant signal — perfect self-correlation
    return { values, peaks: [], periodicity: null, isperiodic: false };
  }

  // Compute normalized autocorrelation for each lag
  const values = new Float64Array(effectiveMaxLag + 1);
  for (let k = 0; k <= effectiveMaxLag; k++) {
    let autoCorr = 0;
    for (let n = 0; n < N - k; n++) {
      autoCorr += (signal[n] - mean) * (signal[n + k] - mean);
    }
    values[k] = autoCorr / (N * variance);
  }

  // Find peaks: local maxima above 0.3 (skip lag 0 which is always 1.0)
  const peaks: Array<{ lag: number; value: number }> = [];
  for (let k = 1; k < effectiveMaxLag; k++) {
    if (
      values[k] > 0.3 &&
      values[k] >= values[k - 1] &&
      values[k] >= values[k + 1]
    ) {
      peaks.push({ lag: k, value: values[k] });
    }
  }

  // Detect periodicity: check if peaks are evenly spaced
  let periodicity: number | null = null;
  let isperiodic = false;

  if (peaks.length >= 2) {
    // Compute gaps between consecutive peaks
    const gaps: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      gaps.push(peaks[i].lag - peaks[i - 1].lag);
    }

    // Check if gaps are roughly equal (within 15% tolerance)
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const tolerance = avgGap * 0.15;
    const allClose = gaps.every((g) => Math.abs(g - avgGap) <= tolerance);

    if (allClose && avgGap > 0) {
      periodicity = Math.round(avgGap);
      isperiodic = true;
    }
  } else if (peaks.length === 1) {
    // Single peak — report its lag as potential period
    periodicity = peaks[0].lag;
    isperiodic = false; // need at least 2 peaks to confirm
  }

  return { values, peaks, periodicity, isperiodic };
}

// ─── Border Complexity (BPCS Steganalysis) ───

export interface ComplexityResult {
  complexity: number;
  totalChanges: number;
  maxPossible: number;
  isComplex: boolean;
}

/**
 * Compute border complexity of a binary block for BPCS steganalysis.
 * Block values should be 0 or 1 in row-major order.
 * Complexity = ratio of color changes along pixel borders to maximum possible changes.
 */
export function borderComplexity(
  block: Uint8Array | number[],
  width: number,
  height: number,
  threshold: number = 0.3,
): ComplexityResult {
  let totalChanges = 0;

  // Horizontal changes: for each row, count adjacent pairs that differ
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width - 1; col++) {
      const idx = row * width + col;
      if (block[idx] !== block[idx + 1]) {
        totalChanges++;
      }
    }
  }

  // Vertical changes: for each column, count vertically adjacent pairs that differ
  for (let row = 0; row < height - 1; row++) {
    for (let col = 0; col < width; col++) {
      const idx = row * width + col;
      if (block[idx] !== block[idx + width]) {
        totalChanges++;
      }
    }
  }

  const maxPossible = (width - 1) * height + width * (height - 1);
  const complexity = maxPossible > 0 ? totalChanges / maxPossible : 0;
  const isComplex = complexity >= threshold;

  return { complexity, totalChanges, maxPossible, isComplex };
}

// ─── Normal CDF Approximation (exported) ───

/**
 * Standard normal CDF approximation (Abramowitz and Stegun).
 * Exported version for use by downstream analysis functions.
 */
export function normalCdfApprox(x: number): number {
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

// ─── Patchwork Test (Patchwork Watermark Detection) ───

export interface PatchworkResult {
  statistic: number;
  normalizedStatistic: number;
  pValue: number;
  detected: boolean;
}

/**
 * Patchwork watermark detection test.
 * Splits values into two pseudo-random groups using an LCG, then tests
 * whether the mean difference between groups is statistically significant.
 * A significant difference suggests a patchwork watermark is present.
 */
export function patchworkTest(values: number[], seed: number = 42): PatchworkResult {
  const N = values.length;

  if (N < 4) {
    return { statistic: 0, normalizedStatistic: 0, pValue: 1, detected: false };
  }

  // LCG pseudo-random number generator
  const LCG_A = 1103515245;
  const LCG_C = 12345;
  const LCG_M = 2147483648; // 2^31

  let lcgState = ((seed % LCG_M) + LCG_M) % LCG_M; // ensure non-negative

  // Split values into two groups based on pseudo-random bit
  let sumA = 0;
  let countA = 0;
  let sumB = 0;
  let countB = 0;

  for (let i = 0; i < N; i++) {
    lcgState = (Math.imul(LCG_A, lcgState) + LCG_C) >>> 0;
    const normalized = (lcgState & 0x7FFFFFFF) % LCG_M; // ensure within [0, 2^31)
    const bit = (normalized >> 16) & 1; // use a mid-range bit for better distribution

    if (bit === 1) {
      sumA += values[i];
      countA++;
    } else {
      sumB += values[i];
      countB++;
    }
  }

  if (countA === 0 || countB === 0) {
    return { statistic: 0, normalizedStatistic: 0, pValue: 1, detected: false };
  }

  const meanA = sumA / countA;
  const meanB = sumB / countB;
  const statistic = meanA - meanB;

  // Compute overall variance
  let overallMean = 0;
  for (let i = 0; i < N; i++) {
    overallMean += values[i];
  }
  overallMean /= N;

  let variance = 0;
  for (let i = 0; i < N; i++) {
    const diff = values[i] - overallMean;
    variance += diff * diff;
  }
  variance /= N;

  // Under null hypothesis: S ~ N(0, sigma^2 * (1/countA + 1/countB))
  const stdErr = variance > 0
    ? Math.sqrt(variance * (1 / countA + 1 / countB))
    : 0;

  const normalizedStatistic = stdErr > 0 ? statistic / stdErr : 0;

  // Two-tailed p-value
  const pValue = stdErr > 0
    ? 2 * (1 - normalCdfApprox(Math.abs(normalizedStatistic)))
    : 1;

  // Detected if p < 0.01 (99% confidence)
  const detected = pValue < 0.01;

  return { statistic, normalizedStatistic, pValue, detected };
}