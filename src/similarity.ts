import type { SimilarityFn } from "./types";

/**
 * Cosine similarity between two vectors.
 * Returns 0-1 for non-negative embeddings, -1 to 1 in general.
 */
export const cosineSimilarity: SimilarityFn = (a: number[], b: number[]): number => {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
};

/**
 * Euclidean distance-based similarity. Returns 0-1 where 1 is identical.
 */
export const euclideanSimilarity: SimilarityFn = (a: number[], b: number[]): number => {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]!;
    sum += diff * diff;
  }
  const dist = Math.sqrt(sum);
  return 1 / (1 + dist);
};

/**
 * Jaccard similarity for binary-like vectors (non-zero = present).
 */
export const jaccardSimilarity: SimilarityFn = (a: number[], b: number[]): number => {
  if (a.length === 0 || a.length !== b.length) return 0;
  let intersection = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    const aPresent = a[i]! !== 0;
    const bPresent = b[i]! !== 0;
    if (aPresent && bPresent) intersection++;
    if (aPresent || bPresent) union++;
  }
  return union === 0 ? 0 : intersection / union;
};
