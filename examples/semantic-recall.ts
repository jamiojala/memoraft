import { createMemory } from "../src/index";

async function main() {
  // Mock embedding function using a simple vocabulary
  const vocab = ["coffee", "tea", "weather", "sunny", "rain", "code", "debug", "music"];
  const embedFn = async (text: string): Promise<number[]> => {
    const embedding = new Array(vocab.length).fill(0);
    for (let i = 0; i < vocab.length; i++) {
      if (text.toLowerCase().includes(vocab[i]!)) embedding[i] = 1;
    }
    return embedding;
  };

  const mem = createMemory({ embedFn });

  await mem.add("I drink coffee every morning", { tags: ["habit"] });
  await mem.add("The weather is sunny today", { tags: ["observation"] });
  await mem.add("I need to debug this code", { tags: ["task"] });
  await mem.add("Listening to music while coding", { tags: ["habit"] });

  console.log("Recall for 'coffee':");
  for (const r of await mem.recall("coffee", 3)) {
    console.log(`  [${r.score.toFixed(2)}] ${r.entry.content}`);
  }

  console.log("\nRecall for 'code debug':");
  for (const r of await mem.recall("code debug", 3)) {
    console.log(`  [${r.score.toFixed(2)}] ${r.entry.content}`);
  }
}

main().catch(console.error);
