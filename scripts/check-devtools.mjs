// Fails the build if any dev-only tool leaked into the client bundle.
// See docs/CONTRIBUTING.md#dev-tools and AGENTS.md hard rule 13.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const BANNED = ["agentation", "agentation-mcp"];
const TARGET = ".next/static";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (p.endsWith(".js")) yield p;
  }
}

if (!existsSync(TARGET)) {
  console.log(
    `check:devtools — ${TARGET} not found (no production build yet); skipping.`,
  );
  process.exit(0);
}

const leaks = [];
for await (const file of walk(TARGET)) {
  const src = await readFile(file, "utf8");
  for (const banned of BANNED) {
    if (src.includes(banned)) leaks.push(`${banned} → ${file}`);
  }
}

if (leaks.length) {
  console.error(
    "Dev tools leaked into the production bundle:\n" + leaks.join("\n"),
  );
  process.exit(1);
}
console.log("check:devtools ✓ no dev tools in production bundle");
