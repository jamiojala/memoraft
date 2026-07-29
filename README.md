# Memoraft

[![CI](https://img.shields.io/github/actions/workflow/status/jamiojala/memoraft/ci.yml?branch=main&label=CI)](https://github.com/jamiojala/memoraft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40jamiojala%2Fmemoraft)](https://www.npmjs.com/package/@jamiojala/memoraft)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](./LICENSE)

`@jamiojala/memoraft` provides composable memory primitives for profiles, preferences, semantic recall, and longitudinal AI context.

It stores memory entries with optional embeddings, manages user profiles and scoped preferences, and recalls relevant memories via similarity search or keyword fallback. Pluggable stores, embedding functions, and similarity metrics.

## Why Memoraft

AI apps need persistent context that goes beyond the context window. Memoraft gives you memory entries with semantic recall, structured profiles, and scoped preferences without a hosted vector database.

- Memory entries with metadata, tags, and importance scoring
- Semantic recall with pluggable embedding functions
- Keyword search fallback when no embeddings are configured
- User profiles with arbitrary attributes
- Scoped preferences (global, per-user, per-session)
- Cosine, Euclidean, and Jaccard similarity functions
- In-memory and filesystem stores
- Zero runtime dependencies

## Install

```bash
pnpm add @jamiojala/memoraft
```

## Quick Start

```ts
import { createMemory } from "@jamiojala/memoraft";

const mem = createMemory();

await mem.add("User prefers dark mode", { tags: ["preference"] });
await mem.add("User works as a developer", { tags: ["profile"] });

const results = await mem.recall("preference", 5);
```

## Semantic Recall with Embeddings

```ts
const mem = createMemory({
  embedFn: async (text) => generateEmbedding(text)
});

await mem.add("I like coffee");
const results = await mem.recall("coffee");
// Results ranked by cosine similarity
```

## Profiles

```ts
mem.setProfile("user-1", { name: "Jami", role: "developer" });
const profile = mem.getProfile("user-1");
```

## Preferences

```ts
mem.setPreference("theme", "dark");
mem.setPreference("language", "fi", "user-1");

mem.getPreference("theme"); // { value: "dark", ... }
mem.listPreferences("user-1"); // scoped preferences
```

## Custom Similarity

```ts
import { createMemory, euclideanSimilarity } from "@jamiojala/memoraft";

const mem = createMemory({
  embedFn: myEmbedFn,
  similarityFn: euclideanSimilarity
});
```

## File Store

```ts
import { createMemory, FileStore } from "@jamiojala/memoraft";

const mem = createMemory({ store: new FileStore("./.my-memory") });
```

## API

See [docs/api.md](./docs/api.md) for the full reference.

## Documentation

- [Quick Start](./docs/quickstart.md)
- [API Reference](./docs/api.md)

## Development

```bash
pnpm install
pnpm check
```

## Examples

- [Basic usage](./examples/basic.ts)
- [Semantic recall](./examples/semantic-recall.ts)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
