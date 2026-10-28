// Keeps CLAUDE.md identical to AGENTS.md without relying on symlinks
// (this Windows checkout has core.symlinks=false; `ln -s` silently copies).
//
//   node scripts/check-doc-sync.mjs         → check only, exit 1 if they differ (CI, commitlint)
//   node scripts/check-doc-sync.mjs --fix   → copy AGENTS.md → CLAUDE.md (pre-commit hook)
//
// AGENTS.md is canonical; CLAUDE.md is the generated copy that agent tooling reads.
import { readFileSync, writeFileSync } from "node:fs";

const CANONICAL = "AGENTS.md";
const COPY = "CLAUDE.md";
const fix = process.argv.includes("--fix");

const canonical = readFileSync(CANONICAL, "utf8");
let copy = "";
try {
  copy = readFileSync(COPY, "utf8");
} catch {
  // missing copy is treated as out-of-sync
}

if (canonical === copy) {
  console.log(`check:docs ✓ ${COPY} matches ${CANONICAL}`);
  process.exit(0);
}

if (fix) {
  writeFileSync(COPY, canonical);
  console.log(`check:docs — regenerated ${COPY} from ${CANONICAL}`);
  process.exit(0);
}

console.error(
  `check:docs ✗ ${COPY} is out of sync with ${CANONICAL}. Run \`npm run sync:docs\`.`,
);
process.exit(1);
