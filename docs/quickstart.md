# Memoraft Quick Start

## Install

```bash
pnpm add @jamiojala/memoraft
```

## Basic Usage

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

## File Store

```ts
import { createMemory, FileStore } from "@jamiojala/memoraft";

const mem = createMemory({ store: new FileStore("./.my-memory") });
```
