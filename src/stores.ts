import { promises as fs } from "node:fs";
import path from "node:path";
import type { MemoryEntry, MemoryStore } from "./types";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * In-memory store with keyword-based search fallback when no embeddings are available.
 */
export class InMemoryStore implements MemoryStore {
  private readonly map = new Map<string, MemoryEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
  }

  async add(entry: MemoryEntry): Promise<void> {
    if (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(entry.id, entry);
  }

  async get(id: string): Promise<MemoryEntry | undefined> {
    return this.map.get(id);
  }

  async update(id: string, patch: Partial<MemoryEntry>): Promise<void> {
    const existing = this.map.get(id);
    if (!existing) return;
    this.map.set(id, { ...existing, ...patch, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<boolean> {
    return this.map.delete(id);
  }

  async list(): Promise<MemoryEntry[]> {
    return [...this.map.values()];
  }

  async search(query: string, limit = 10): Promise<MemoryEntry[]> {
    const lower = query.toLowerCase();
    const terms = lower.split(/\s+/).filter(Boolean);
    const results = [...this.map.values()].filter((entry) => {
      const content = entry.content.toLowerCase();
      return terms.some((t) => content.includes(t));
    });
    return results.slice(0, limit);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

/**
 * Filesystem-backed store. Persists entries as JSON files.
 */
export class FileStore implements MemoryStore {
  constructor(private readonly dir: string) {}

  private filePath(id: string): string {
    const safe = id.replace(/[^a-zA-Z0-9-]/g, "_");
    return path.join(this.dir, `${safe}.json`);
  }

  async add(entry: MemoryEntry): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.filePath(entry.id), JSON.stringify(entry), "utf-8");
  }

  async get(id: string): Promise<MemoryEntry | undefined> {
    try {
      const content = await fs.readFile(this.filePath(id), "utf-8");
      return JSON.parse(content) as MemoryEntry;
    } catch {
      return undefined;
    }
  }

  async update(id: string, patch: Partial<MemoryEntry>): Promise<void> {
    const existing = await this.get(id);
    if (!existing) return;
    const updated: MemoryEntry = { ...existing, ...patch, updatedAt: Date.now() };
    await fs.writeFile(this.filePath(id), JSON.stringify(updated), "utf-8");
  }

  async delete(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(id));
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<MemoryEntry[]> {
    try {
      const files = await fs.readdir(this.dir);
      const entries: MemoryEntry[] = [];
      for (const f of files) {
        if (f.endsWith(".json")) {
          try {
            const content = await fs.readFile(path.join(this.dir, f), "utf-8");
            entries.push(JSON.parse(content) as MemoryEntry);
          } catch {
            // skip corrupt files
          }
        }
      }
      return entries;
    } catch {
      return [];
    }
  }

  async search(query: string, limit = 10): Promise<MemoryEntry[]> {
    const all = await this.list();
    const lower = query.toLowerCase();
    const terms = lower.split(/\s+/).filter(Boolean);
    return all
      .filter((entry) => {
        const content = entry.content.toLowerCase();
        return terms.some((t) => content.includes(t));
      })
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.dir);
      await Promise.all(
        files.map((f) => fs.unlink(path.join(this.dir, f)).catch(() => {}))
      );
    } catch {
      // dir may not exist
    }
  }
}

export { generateId };
