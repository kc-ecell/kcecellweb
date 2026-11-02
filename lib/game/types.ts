export type StartupStage =
  "Idea" | "Validate" | "MVP" | "Launch" | "Scale" | "Unicorn";

export interface LevelInfo {
  level: number;
  name: StartupStage;
  xpNeeded: number;
  flavour: string;
}

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: "Idea",
    xpNeeded: 0,
    flavour: "Everyone starts with a napkin.",
  },
  {
    level: 2,
    name: "Validate",
    xpNeeded: 100,
    flavour: "Someone else thinks it's a good idea too.",
  },
  { level: 3, name: "MVP", xpNeeded: 250, flavour: "It's ugly. It works." },
  { level: 4, name: "Launch", xpNeeded: 500, flavour: "Shipped." },
  {
    level: 5,
    name: "Scale",
    xpNeeded: 900,
    flavour: "Now do it again, bigger.",
  },
  {
    level: 6,
    name: "Unicorn",
    xpNeeded: 1500,
    flavour: "Okay, show-off. Unlocked lime-to-holo HUD skin.",
  },
];

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string; // ASCII or SVG pixel symbol
}

export const BADGES: BadgeInfo[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Earn your first XP",
    icon: "🌱",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Visit all 8 top-level pages",
    icon: "🧭",
  },
  {
    id: "event-hunter",
    name: "Event Hunter",
    description: "Explore 5 event pages",
    icon: "🎟️",
  },
  {
    id: "committed",
    name: "Committed",
    description: "Click a registration link",
    icon: "⚡",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Read field notes and postmortems",
    icon: "📖",
  },
  {
    id: "card-collector",
    name: "Card Collector",
    description: "Inspect 10 team cards",
    icon: "🃏",
  },
  {
    id: "full-deck",
    name: "Full Deck",
    description: "Meet every member of the 2026–27 cohort",
    icon: "👑",
  },
  {
    id: "historian",
    name: "Historian",
    description: "Inspect E-Cell's 10-year timeline",
    icon: "🏛️",
  },
  {
    id: "scaled",
    name: "Scaled",
    description: "Scroll deep to reach Scale stage",
    icon: "📈",
  },
  {
    id: "root",
    name: "Root Access",
    description: "Open the ecell.sh terminal",
    icon: "💻",
  },
  {
    id: "power-user",
    name: "Power User",
    description: "Execute 8 different terminal commands",
    icon: "⌨️",
  },
  {
    id: "konami",
    name: "↑↑↓↓←→←→BA",
    description: "Unlocked the secret retro arcade mode",
    icon: "🕹️",
  },
  {
    id: "glitch",
    name: "Glitch in Matrix",
    description: "Triggered 7-click logo rocket launch",
    icon: "🚀",
  },
  {
    id: "pivot-master",
    name: "Pivot Master",
    description: "Scored 2000+ in Pivot or Perish",
    icon: "🏆",
  },
  {
    id: "say-hi",
    name: "Said Hi",
    description: "Submitted the contact form",
    icon: "✉️",
  },
  {
    id: "unicorn",
    name: "Unicorn",
    description: "Reached Level 6 founder status",
    icon: "🦄",
  },
];

export interface FounderState {
  v: 1;
  xp: number;
  awarded: string[];
  badges: string[];
  counters: Record<string, number>;
  prefs: {
    game: boolean;
    motion: "auto" | "lite" | "off";
    sound: boolean;
  };
  firstSeen: string;
}

export interface ToastMessage {
  id: string;
  xp: number;
  title: string;
  badgeName?: string;
  timestamp: number;
}
