import { z } from "zod";
import { type FounderState, type LevelInfo, LEVELS } from "./types";

const STORAGE_KEY = "ecell:founder:v1";

const FounderStateSchema = z.object({
  v: z.literal(1),
  xp: z.number().int().min(0),
  awarded: z.array(z.string()),
  badges: z.array(z.string()),
  counters: z.record(z.string(), z.number()),
  prefs: z.object({
    game: z.boolean(),
    motion: z.enum(["auto", "lite", "off"]),
    sound: z.boolean(),
  }),
  firstSeen: z.string(),
});

export function getInitialState(): FounderState {
  return {
    v: 1,
    xp: 0,
    awarded: [],
    badges: [],
    counters: {},
    prefs: {
      game: true,
      motion: "auto",
      sound: true,
    },
    firstSeen: "2026-01-01T00:00:00.000Z",
  };
}

export function loadStoredState(): FounderState {
  if (typeof window === "undefined") return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    const result = FounderStateSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    } else {
      console.warn(
        "Corrupted Founder state found, backing up and resetting:",
        result.error,
      );
      localStorage.setItem("ecell:founder:corrupt", raw);
      const fallback = getInitialState();
      saveState(fallback);
      return fallback;
    }
  } catch (err) {
    console.warn("Failed to load Founder state from localStorage:", err);
    return getInitialState();
  }
}

export function saveState(state: FounderState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save Founder state:", err);
  }
}

export function getLevelForXP(xp: number): LevelInfo {
  let currentLevel = LEVELS[0]!;
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpNeeded) {
      currentLevel = lvl;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextLevel(level: number): LevelInfo | null {
  const next = LEVELS.find((l) => l.level === level + 1);
  return next ?? null;
}

/** Check if any badges have been newly unlocked */
export function evaluateBadges(state: FounderState): string[] {
  const newBadges: string[] = [];
  const currentBadges = new Set(state.badges);

  const checkBadge = (id: string, condition: boolean) => {
    if (!currentBadges.has(id) && condition) {
      newBadges.push(id);
    }
  };

  // 1. first-steps: Earn any XP
  checkBadge("first-steps", state.xp > 0);

  // 2. explorer: Visit all 8 top-level pages
  const visitedRoutes = state.awarded.filter((k) => k.startsWith("visit:"));
  checkBadge("explorer", visitedRoutes.length >= 8);

  // 3. event-hunter: Open 5 event pages / details
  const eventOpens = state.awarded.filter((k) => k.startsWith("event:open:"));
  checkBadge("event-hunter", eventOpens.length >= 5);

  // 4. committed: Click a registration link
  checkBadge(
    "committed",
    state.awarded.some((k) => k.startsWith("event:register:")),
  );

  // 5. bookworm: Read 3 posts
  const postReads = state.awarded.filter((k) => k.startsWith("post:read:"));
  checkBadge("bookworm", postReads.length >= 3);

  // 6. card-collector: Flip 10 team cards
  const cardsFlipped = state.counters["card:flip"] ?? 0;
  checkBadge("card-collector", cardsFlipped >= 10);

  // 7. full-deck: Flip 19 team cards (full cohort)
  checkBadge("full-deck", cardsFlipped >= 19);

  // 8. historian: Complete timeline
  checkBadge("historian", state.awarded.includes("timeline:complete"));

  // 9. scaled: Reach SCALE stage
  checkBadge("scaled", state.awarded.includes("stage:scale"));

  // 10. root: Open terminal
  checkBadge("root", state.awarded.includes("terminal:open"));

  // 11. power-user: 8 different commands
  const cmdsUsed = state.awarded.filter((k) => k.startsWith("terminal:cmd:"));
  checkBadge("power-user", cmdsUsed.length >= 8);

  // 12. konami: Konami code egg
  checkBadge("konami", state.awarded.includes("egg:konami"));

  // 13. glitch: 7-click logo egg
  checkBadge("glitch", state.awarded.includes("egg:glitch"));

  // 14. pivot-master: Score 2000+ in 404 game
  checkBadge("pivot-master", (state.counters["game:404:score"] ?? 0) >= 2000);

  // 15. say-hi: Submitted contact form
  checkBadge("say-hi", state.awarded.includes("contact:sent"));

  // 16. unicorn: Reach level 6
  checkBadge("unicorn", state.xp >= 1500);

  return newBadges;
}

export interface AwardResult {
  state: FounderState;
  xpAwarded: number;
  newBadges: string[];
  leveledUp: boolean;
  oldLevel: LevelInfo;
  newLevel: LevelInfo;
}

export function processAward(
  currentState: FounderState,
  key: string,
  options?: { xp?: number; counter?: string; counterInc?: number },
): AwardResult | null {
  // If game mode is turned off, skip awarding
  if (!currentState.prefs.game) return null;

  // Deduplication check: if key already awarded, skip unless it's a repeatable counter
  if (currentState.awarded.includes(key)) {
    // If only counter is incremented
    if (options?.counter) {
      const inc = options.counterInc ?? 1;
      const updatedCounters = {
        ...currentState.counters,
        [options.counter]: (currentState.counters[options.counter] ?? 0) + inc,
      };
      const intermediateState: FounderState = {
        ...currentState,
        counters: updatedCounters,
      };
      const unlockedBadges = evaluateBadges(intermediateState);
      if (unlockedBadges.length > 0) {
        const nextState: FounderState = {
          ...intermediateState,
          badges: [...intermediateState.badges, ...unlockedBadges],
        };
        saveState(nextState);
        const lvl = getLevelForXP(nextState.xp);
        return {
          state: nextState,
          xpAwarded: 0,
          newBadges: unlockedBadges,
          leveledUp: false,
          oldLevel: lvl,
          newLevel: lvl,
        };
      }
    }
    return null;
  }

  const defaultXpMap: Record<string, number> = {
    "timeline:complete": 60,
    "stage:scale": 30,
    "terminal:open": 25,
    "egg:konami": 150,
    "egg:glitch": 100,
    "egg:sudo": 100,
    "egg:console": 100,
    "egg:night-owl": 50,
    "egg:speedrun": 50,
    "contact:sent": 50,
    "email:copy": 5,
  };

  let xpToAdd = options?.xp;
  if (xpToAdd === undefined) {
    if (key.startsWith("visit:")) xpToAdd = 20;
    else if (key.startsWith("event:open:")) xpToAdd = 15;
    else if (key.startsWith("event:register:")) xpToAdd = 40;
    else if (key.startsWith("post:read:")) xpToAdd = 40;
    else if (key.startsWith("gallery:album:")) xpToAdd = 15;
    else if (key.startsWith("terminal:cmd:")) xpToAdd = 10;
    else xpToAdd = defaultXpMap[key] ?? 10;
  }

  const oldLvl = getLevelForXP(currentState.xp);
  const newXP = currentState.xp + xpToAdd;
  const newLvl = getLevelForXP(newXP);
  const leveledUp = newLvl.level > oldLvl.level;

  const updatedCounters = { ...currentState.counters };
  if (options?.counter) {
    const inc = options.counterInc ?? 1;
    updatedCounters[options.counter] =
      (updatedCounters[options.counter] ?? 0) + inc;
  }

  const intermediateState: FounderState = {
    ...currentState,
    xp: newXP,
    awarded: [...currentState.awarded, key],
    counters: updatedCounters,
  };

  const newBadges = evaluateBadges(intermediateState);
  const finalState: FounderState = {
    ...intermediateState,
    badges: [...intermediateState.badges, ...newBadges],
  };

  saveState(finalState);

  return {
    state: finalState,
    xpAwarded: xpToAdd,
    newBadges,
    leveledUp,
    oldLevel: oldLvl,
    newLevel: newLvl,
  };
}
