import { createMemory } from "../src/index";

async function main() {
  const mem = createMemory();

  await mem.add("User prefers dark mode", { tags: ["preference"], importance: 3 });
  await mem.add("User works as a developer", { tags: ["profile"], importance: 4 });
  await mem.add("User likes coffee", { tags: ["preference"], importance: 2 });

  mem.setProfile("user-1", { name: "Jami", role: "developer" });
  mem.setPreference("theme", "dark");
  mem.setPreference("language", "fi", "user-1");

  console.log("Profile:", mem.getProfile("user-1"));
  console.log("Preferences:", mem.listPreferences());

  const recall = await mem.recall("preference", 5);
  console.log("\nRecall results:");
  for (const r of recall) {
    console.log(`  [${r.score}] ${r.entry.content}`);
  }
}

main().catch(console.error);
