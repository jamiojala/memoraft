import { describe, it, expect } from "vitest";
import { createMemory } from "../src/memoraft";

describe("Memoraft", () => {
  it("adds and retrieves memories", async () => {
    const mem = createMemory();
    const entry = await mem.add("User likes coffee");

    expect(entry.content).toBe("User likes coffee");
    expect(entry.id).toBeDefined();

    const retrieved = await mem.get(entry.id);
    expect(retrieved?.content).toBe("User likes coffee");
  });

  it("lists memories", async () => {
    const mem = createMemory();
    await mem.add("Memory 1");
    await mem.add("Memory 2");

    const list = await mem.list();
    expect(list).toHaveLength(2);
  });

  it("deletes memories", async () => {
    const mem = createMemory();
    const entry = await mem.add("To be deleted");

    expect(await mem.delete(entry.id)).toBe(true);
    expect(await mem.get(entry.id)).toBeUndefined();
    expect(await mem.delete(entry.id)).toBe(false);
  });

  it("updates memories", async () => {
    const mem = createMemory();
    const entry = await mem.add("Original");

    await mem.update(entry.id, { content: "Updated" });
    const updated = await mem.get(entry.id);
    expect(updated?.content).toBe("Updated");
  });

  it("falls back to keyword search without embeddings", async () => {
    const mem = createMemory();
    await mem.add("The weather is sunny today");
    await mem.add("Coffee is great in the morning");
    await mem.add("Sunny days are the best");

    const results = await mem.recall("sunny", 5);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.entry.content.includes("sunny"))).toBe(true);
  });

  it("uses embeddings for semantic recall when available", async () => {
    // Simple mock embedding: maps words to fixed positions
    const vocab = ["coffee", "tea", "sunny", "rain", "like", "hate"];
    const embedFn = async (text: string): Promise<number[]> => {
      const embedding = new Array(vocab.length).fill(0);
      for (let i = 0; i < vocab.length; i++) {
        if (text.toLowerCase().includes(vocab[i]!)) {
          embedding[i] = 1;
        }
      }
      return embedding;
    };

    const mem = createMemory({ embedFn });
    await mem.add("I like coffee");
    await mem.add("I hate rain");
    await mem.add("Sunny days are nice");

    const results = await mem.recall("coffee", 3);
    expect(results[0]!.entry.content).toContain("coffee");
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it("manages profiles", () => {
    const mem = createMemory();
    mem.setProfile("user-1", { name: "Jami", role: "developer" });

    const profile = mem.getProfile("user-1");
    expect(profile?.attributes["name"]).toBe("Jami");
    expect(profile?.attributes["role"]).toBe("developer");

    const profiles = mem.listProfiles();
    expect(profiles).toHaveLength(1);
  });

  it("manages preferences", () => {
    const mem = createMemory();
    mem.setPreference("theme", "dark");
    mem.setPreference("language", "fi", "user-1");

    expect(mem.getPreference("theme")?.value).toBe("dark");
    expect(mem.getPreference("language", "user-1")?.value).toBe("fi");
    expect(mem.getPreference("language")?.value).toBeUndefined();

    const all = mem.listPreferences();
    expect(all).toHaveLength(2);

    const userPrefs = mem.listPreferences("user-1");
    expect(userPrefs).toHaveLength(1);
  });

  it("clears all data", async () => {
    const mem = createMemory();
    await mem.add("test");
    mem.setProfile("p1", {});
    mem.setPreference("k", "v");

    await mem.clear();
    expect(await mem.list()).toHaveLength(0);
    expect(mem.listProfiles()).toHaveLength(0);
    expect(mem.listPreferences()).toHaveLength(0);
  });

  it("stores metadata and tags", async () => {
    const mem = createMemory();
    const entry = await mem.add("Important note", {
      metadata: { source: "meeting" },
      tags: ["work", "important"],
      importance: 5
    });

    expect(entry.metadata["source"]).toBe("meeting");
    expect(entry.tags).toContain("work");
    expect(entry.importance).toBe(5);
  });
});
