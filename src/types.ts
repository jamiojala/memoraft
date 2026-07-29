export interface MemoryEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | undefined;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  importance: number;
}

export interface Profile {
  id: string;
  attributes: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface Preference {
  key: string;
  value: unknown;
  scope: string;
  createdAt: number;
  updatedAt: number;
}

export interface RecallResult {
  entry: MemoryEntry;
  score: number;
}

export interface MemoryStore {
  add(entry: MemoryEntry): Promise<void>;
  get(id: string): Promise<MemoryEntry | undefined>;
  update(id: string, patch: Partial<MemoryEntry>): Promise<void>;
  delete(id: string): Promise<boolean>;
  list(): Promise<MemoryEntry[]>;
  search(query: string, limit?: number): Promise<MemoryEntry[]>;
  clear(): Promise<void>;
}

export interface EmbedFn {
  (text: string): Promise<number[]>;
}

export type SimilarityFn = (a: number[], b: number[]) => number;

export interface MemoraftOptions {
  store?: MemoryStore;
  embedFn?: EmbedFn;
  similarityFn?: SimilarityFn;
  maxEntries?: number;
  minImportance?: number;
}
