import { describe, it, expect } from "vitest";
import { cosineSimilarity, euclideanSimilarity, jaccardSimilarity } from "../src/similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it("returns 0 for empty vectors", () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it("returns 0 for different length vectors", () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });
});

describe("euclideanSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(euclideanSimilarity([1, 2], [1, 2])).toBeCloseTo(1, 5);
  });

  it("returns less than 1 for different vectors", () => {
    expect(euclideanSimilarity([1, 2], [3, 4])).toBeLessThan(1);
  });
});

describe("jaccardSimilarity", () => {
  it("returns 1 for identical binary vectors", () => {
    expect(jaccardSimilarity([1, 0, 1], [1, 0, 1])).toBe(1);
  });

  it("returns 0 for disjoint vectors", () => {
    expect(jaccardSimilarity([1, 0, 0], [0, 0, 1])).toBe(0);
  });
});
