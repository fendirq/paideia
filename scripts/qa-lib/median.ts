/**
 * Compute the median of an array of numbers. For an even-length array,
 * returns the average of the two middle values. Ignores undefined/NaN entries.
 */
export function median(values: Array<number | undefined | null>): number {
  const cleaned = values
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v))
    .slice()
    .sort((a, b) => a - b);
  if (cleaned.length === 0) return NaN;
  const mid = Math.floor(cleaned.length / 2);
  return cleaned.length % 2 === 0
    ? (cleaned[mid - 1] + cleaned[mid]) / 2
    : cleaned[mid];
}

/** Returns the min of an array, ignoring non-numbers. */
export function min(values: Array<number | undefined | null>): number {
  const cleaned = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  return cleaned.length === 0 ? NaN : Math.min(...cleaned);
}

/** Returns the max of an array, ignoring non-numbers. */
export function max(values: Array<number | undefined | null>): number {
  const cleaned = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  return cleaned.length === 0 ? NaN : Math.max(...cleaned);
}

/** Returns {min, median, max} for a numeric series. */
export interface Summary {
  min: number;
  median: number;
  max: number;
  count: number;
}

export function summarize(values: Array<number | undefined | null>): Summary {
  const cleaned = values
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v))
    .slice()
    .sort((a, b) => a - b);
  if (cleaned.length === 0) return { min: NaN, median: NaN, max: NaN, count: 0 };
  const mid = Math.floor(cleaned.length / 2);
  const med = cleaned.length % 2 === 0
    ? (cleaned[mid - 1] + cleaned[mid]) / 2
    : cleaned[mid];
  return { min: cleaned[0], median: med, max: cleaned[cleaned.length - 1], count: cleaned.length };
}
