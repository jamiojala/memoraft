# Memoraft API

## createMemory(options?)

Creates a Memoraft instance.

### Options

- store: MemoryStore - Storage backend. Default InMemoryStore.
- embedFn: (text) => Promise<number[]> - Embedding function for semantic recall.
- similarityFn: (a, b) => number - Default cosineSimilarity.
- maxEntries: number - Default 10000.
- minImportance: number - Filter entries below this importance. Default 0.

## mem.add(content, options?)

Adds a memory entry. Options: metadata, tags, importance, embedding.

## mem.get(id)

Retrieve by ID.

## mem.update(id, patch)

Update fields.

## mem.delete(id)

Remove entry. Returns true if existed.

## mem.list()

All entries.

## mem.recall(query, limit?)

Semantic recall using embeddings, or keyword fallback.

## mem.setProfile(id, attributes)

Create or update a profile.

## mem.getProfile(id)

Retrieve a profile.

## mem.setPreference(key, value, scope?)

Set a preference. Scope defaults to "global".

## mem.getPreference(key, scope?)

Retrieve a preference.

## mem.clear()

Clear all entries, profiles, and preferences.

## Stores

- InMemoryStore(maxEntries?) - In-memory with keyword search.
- FileStore(dir) - Filesystem-backed.

## Similarity Functions

- cosineSimilarity(a, b) - Default.
- euclideanSimilarity(a, b) - Distance-based.
- jaccardSimilarity(a, b) - Binary vector overlap.
