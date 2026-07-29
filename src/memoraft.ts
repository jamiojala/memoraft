import { cosineSimilarity } from "./similarity";
import { generateId, InMemoryStore } from "./stores";
import type {
  EmbedFn,
  MemoryEntry,
  MemoryStore,
  MemoraftOptions,
  Preference,
  Profile,
  RecallResult,
  SimilarityFn
} from "./types";

/**
 * Memoraft is a composable memory engine for AI applications.
 * It manages memory entries with optional embeddings, profiles,
 * preferences, and semantic recall.
 */
export class Memoraft {
  private readonly store: MemoryStore;
  private readonly embedFn: EmbedFn | undefined;
  private readonly similarityFn: SimilarityFn;
  private readonly minImportance: number;
  private readonly profiles = new Map<string, Profile>();
  private readonly preferences = new Map<string, Preference>();

  constructor(options: MemoraftOptions = {}) {
    this.store = options.store ?? new InMemoryStore(options.maxEntries ?? 10000);
    this.embedFn = options.embedFn;
    this.similarityFn = options.similarityFn ?? cosineSimilarity;
    this.minImportance = options.minImportance ?? 0;
  }

  /**
   * Adds a memory entry. If an embed function is configured, the content
   * is embedded automatically.
   */
  async add(content: string, options: {
    metadata?: Record<string, unknown>;
    tags?: string[];
    importance?: number;
    embedding?: number[];
  } = {}): Promise<MemoryEntry> {
    const now = Date.now();
    const embedding = options.embedding ?? (this.embedFn ? await this.embedFn(content) : undefined);

    const entry: MemoryEntry = {
      id: generateId(),
      content,
      metadata: options.metadata ?? {},
      embedding,
      createdAt: now,
      updatedAt: now,
      tags: options.tags ?? [],
      importance: options.importance ?? 1
    };

    await this.store.add(entry);
    return entry;
  }

  /** Gets a memory entry by ID. */
  async get(id: string): Promise<MemoryEntry | undefined> {
    return this.store.get(id);
  }

  /** Updates a memory entry. */
  async update(id: string, patch: Partial<MemoryEntry>): Promise<void> {
    await this.store.update(id, patch);
  }

  /** Deletes a memory entry. */
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  /** Lists all memory entries. */
  async list(): Promise<MemoryEntry[]> {
    return this.store.list();
  }

  /**
   * Semantic recall: finds the most relevant memories for a query.
   * If embeddings are available, uses similarity search. Otherwise,
   * falls back to keyword search.
   */
  async recall(query: string, limit = 5): Promise<RecallResult[]> {
    if (this.embedFn) {
      const queryEmbedding = await this.embedFn(query);
      const all = await this.store.list();
      const scored: RecallResult[] = [];

      for (const entry of all) {
        if (entry.importance < this.minImportance) continue;
        if (!entry.embedding) continue;
        const score = this.similarityFn(queryEmbedding, entry.embedding);
        scored.push({ entry, score });
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit);
    }

    // Fallback: keyword search
    const results = await this.store.search(query, limit);
    return results.map((entry) => ({ entry, score: 0 }));
  }

  /**
   * Creates or updates a profile.
   */
  setProfile(id: string, attributes: Record<string, unknown>): Profile {
    const existing = this.profiles.get(id);
    const now = Date.now();
    const profile: Profile = {
      id,
      attributes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    this.profiles.set(id, profile);
    return profile;
  }

  /** Gets a profile by ID. */
  getProfile(id: string): Profile | undefined {
    return this.profiles.get(id);
  }

  /** Lists all profiles. */
  listProfiles(): Profile[] {
    return [...this.profiles.values()];
  }

  /**
   * Sets a preference for a given scope.
   */
  setPreference(key: string, value: unknown, scope = "global"): Preference {
    const prefKey = `${scope}:${key}`;
    const existing = this.preferences.get(prefKey);
    const now = Date.now();
    const pref: Preference = {
      key,
      value,
      scope,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    this.preferences.set(prefKey, pref);
    return pref;
  }

  /** Gets a preference by key and scope. */
  getPreference(key: string, scope = "global"): Preference | undefined {
    return this.preferences.get(`${scope}:${key}`);
  }

  /** Lists all preferences, optionally filtered by scope. */
  listPreferences(scope?: string): Preference[] {
    const all = [...this.preferences.values()];
    if (scope) return all.filter((p) => p.scope === scope);
    return all;
  }

  /** Clears all memory entries. */
  async clear(): Promise<void> {
    await this.store.clear();
    this.profiles.clear();
    this.preferences.clear();
  }
}

/** Convenience factory. */
export function createMemory(options?: MemoraftOptions): Memoraft {
  return new Memoraft(options);
}
