"use client";

import { requestOtp, verifyOtp } from "@/lib/actions/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useFounder } from "@/lib/game/FounderContext";
import { soundEngine } from "@/lib/game/sound";
import { MatrixRain } from "./MatrixRain";
import { TerminalCritters } from "./TerminalCritters";
import { useTerminalDrawer } from "./useTerminalDrawer";

interface LogEntry {
  id: string;
  type: "input" | "output" | "error" | "system" | "accent";
  text: string;
}

const PUBLIC_COMMANDS = [
  "help",
  "whoami",
  "about",
  "ls",
  "cd",
  "events",
  "team",
  "stats",
  "fame",
  "socials",
  "contact",
  "critters",
  "pet",
  "feed",
  "xp",
  "game",
  "sound",
  "clear",
  "exit",
];

const RANDOM_PITCHES = [
  "Uber for university canteen deliveries using student autonomous rovers.",
  "Decentralized cloud compute powered by idle dorm lab GPUs.",
  "AI copilot that converts handwritten whiteboard schematics into validated PCB Gerber files.",
  "Notion for hardware hackers with integrated SPICE simulation and component sourcing.",
  "Tinder for hackathon co-founders matching by tech stack and sleeplessness tolerance.",
];

export function Terminal() {
  const router = useRouter();
  const {
    terminalOpen,
    setTerminalOpen,
    state,
    level,
    award,
    setPref,
    setDrawerOpen,
  } = useFounder();
  const {
    tier,
    panelRef,
    backdropRef,
    pulling,
    rendered,
    leaving,
    tabProps,
    closeDragProps,
  } = useTerminalDrawer(terminalOpen, setTerminalOpen);

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-1",
      type: "system",
      text: "ecell.sh (x86_64-pc-thanelinux) · build mode active",
    },
    {
      id: "init-2",
      type: "system",
      text: "Type 'help' to see all available commands and what they do, or 'exit' to close.",
    },
  ]);

  // Special animation states
  const [matrixActive, setMatrixActive] = useState(false);
  const [panicActive, setPanicActive] = useState(false);

  // Secret admin login state machine: 'idle' | 'awaiting_email' | 'awaiting_code' | 'granted'
  const [loginStep, setLoginStep] = useState<
    "idle" | "awaiting_email" | "sending" | "awaiting_code" | "granted"
  >("idle");
  const loginEmailRef = useRef("");
  const loginTriesRef = useRef(0);

  // Closing the terminal always abandons a login in progress
  if (!terminalOpen && loginStep !== "idle" && loginStep !== "granted") {
    setLoginStep("idle");
  }

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  // The log ignores the mouse so critters underneath stay draggable, so wheel
  // scrolling is forwarded here, and the scrollbar edge is handed back to it.
  useEffect(() => {
    const box = consoleRef.current;
    if (!terminalOpen || !box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollRef.current) scrollRef.current.scrollTop += e.deltaY;
    };
    const onMove = (e: PointerEvent) => {
      const log = scrollRef.current;
      if (!log || e.pointerType !== "mouse" || e.buttons) return;
      const nearBar = log.getBoundingClientRect().right - e.clientX < 20;
      log.style.pointerEvents = nearBar ? "auto" : "";
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("pointermove", onMove);
    return () => {
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("pointermove", onMove);
    };
  }, [terminalOpen]);

  // Auto focus input and award XP when terminal opens
  useEffect(() => {
    if (terminalOpen) {
      award("terminal:open", { xp: 25 });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [terminalOpen, award]);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Global keyboard shortcuts to toggle terminal (Ctrl+K, Cmd+K, ` or ~)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user pressed Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setTerminalOpen(!terminalOpen);
        return;
      }

      // Check if backtick or tilde pressed outside input elements
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.key === "`" || e.key === "~") && !isInput) {
        e.preventDefault();
        setTerminalOpen(!terminalOpen);
        return;
      }

      // Escape key closes terminal
      if (e.key === "Escape" && terminalOpen) {
        setMatrixActive(false);
        setPanicActive(false);
        setTerminalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [terminalOpen, setTerminalOpen]);

  const addLog = (text: string, type: LogEntry["type"] = "output") => {
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, type },
    ]);
  };

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    // Leaving the login must always work, whatever step it is on
    if (loginStep !== "idle" && /^(exit|quit|cancel|clear|q)$/i.test(raw)) {
      setLoginStep("idle");
      addLog("login cancelled.", "system");
      return;
    }

    // Login input never goes to history, and the code is never echoed
    if (loginStep === "awaiting_email") {
      addLog(`email: ${raw}`, "input");
      loginEmailRef.current = raw;
      setLoginStep("sending");
      void requestOtp(raw)
        .catch(() => null)
        .then(() => {
          addLog(
            "> if this address has clearance, a code is on its way.",
            "accent",
          );
          addLog("type 'cancel' to leave.", "system");
          loginTriesRef.current = 0;
          setLoginStep((step) => (step === "sending" ? "awaiting_code" : step));
        });
      return;
    }

    if (loginStep === "awaiting_code") {
      addLog("code: ● ● ● ● ● ●", "input");
      setLoginStep("sending");
      void verifyOtp(loginEmailRef.current, raw)
        .catch(() => ({ ok: false }))
        .then(({ ok }) => {
          if (ok) {
            setLoginStep("granted");
            addLog("ACCESS GRANTED", "accent");
            addLog("Routing to admin partition...", "system");
            if (state.prefs.sound) soundEngine.playLevelUp();
            setTimeout(() => {
              // Full load so the new session cookie reaches the server
              window.location.assign("/admin");
            }, 1200);
            return;
          }
          loginTriesRef.current += 1;
          const left = 5 - loginTriesRef.current;
          addLog(`ACCESS DENIED · attempts remaining: ${left}`, "error");
          if (state.prefs.sound) soundEngine.playTerminalError();
          setLoginStep((step) =>
            step !== "sending" ? step : left > 0 ? "awaiting_code" : "idle",
          );
        });
      return;
    }

    if (loginStep !== "idle") return;

    // Add user input to logs
    addLog(`guest@ecell:~$ ${raw}`, "input");

    // Add to history
    setHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    // Track command count for Founder badges
    const parts = raw.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() ?? "";
    const arg = parts.slice(1).join(" ").trim().toLowerCase();

    // Award public command usage
    if (PUBLIC_COMMANDS.includes(cmd)) {
      award(`terminal:cmd:${cmd}`, { xp: 10 });
    }

    switch (cmd) {
      case "help":
        addLog("=== ECELL.SH COMMAND REFERENCE ===", "accent");
        addLog("NAVIGATION & DISCOVERY:", "system");
        addLog("  ls                  List accessible pages and directories");
        addLog(
          "  cd <page>           Jump directly to a page (e.g. 'cd events', 'cd team', 'cd fame')",
        );
        addLog(
          "  about               Overview of E-Cell KCCEMSR vision & incubator",
        );
        addLog(
          "  events [--past]     Upcoming flagships (Singularity 2027, Detroits) or archive",
        );
        addLog(
          "  team [tech|events]  Display cohort leadership and department heads",
        );
        addLog(
          "  stats               Key metrics and verified club impact figures",
        );
        addLog(
          "  fame                Highlights from our Wall of Fame (SIH, NEC)",
        );
        addLog(
          "  socials             Official Instagram, LinkedIn, and GitHub links",
        );
        addLog(
          "  contact             Get official contact info or partner with us",
        );
        addLog("");
        addLog("CAMPUS CRITTERS:", "system");
        addLog(
          "  critters            List terminal critters, launch synchronized jump & cheer",
        );
        addLog(
          "  pet                 Pet a random critter (+15 Founder XP, purrs & hearts)",
        );
        addLog(
          "  feed                Drop virtual cookies & snacks to the critters",
        );
        addLog(
          "  Tip: Click & fling critters with your mouse/touch to test physics!",
        );
        addLog("");
        addLog("FOUNDER GAME & PREFERENCES:", "system");
        addLog(
          "  whoami              Display current Founder XP level, status & unlocked badges",
        );
        addLog(
          "  xp                  Open the Founder XP dossier & achievements drawer",
        );
        addLog(
          "  game on|off         Toggle gamification layer and notifications",
        );
        addLog(
          "  sound on|off        Toggle retro Web Audio synthesizer sounds",
        );
        addLog("");
        addLog("SYSTEM & UTILITIES:", "system");
        addLog(
          "  matrix              Launch full-screen Falling Green Matrix code rain",
        );
        addLog(
          "  pitch               Generate a random wild startup venture concept",
        );
        addLog(
          "  hire                View engineering & designer recruitment info",
        );
        addLog("  clear               Clear all terminal console logs");
        addLog("  exit                Close the console (or press Esc / `)");
        break;

      case "whoami":
        addLog(
          `guest · Level ${level.level} (${level.name.toLowerCase()}) · ${state.xp} XP · ${state.badges.length} badges unlocked`,
          "accent",
        );
        break;

      case "about":
        addLog(
          "E-Cell KCCEMSR is the entrepreneurship and startup incubator of K.C. College of Engineering & Management Studies, Thane.",
          "output",
        );
        addLog(
          "We take students from intent to execution through hackathons, incubation, and founder mentorship.",
          "output",
        );
        addLog("Learn more at: /about", "system");
        break;

      case "ls":
        addLog(
          "events/   team/   about/   gallery/   blog/   wall-of-fame/   contact/",
          "accent",
        );
        break;

      case "cd": {
        const rawArg = arg.replace(/^['"]/, "").replace(/['"]$/, "").trim();
        if (
          !rawArg ||
          rawArg === "/" ||
          rawArg === "~" ||
          rawArg === ".." ||
          rawArg === "home"
        ) {
          addLog("Navigating to /...", "system");
          router.push("/");
          setTerminalOpen(false);
          break;
        }

        // Normalize spaces, hyphens, and common aliases
        const normalized = rawArg
          .replace(/[_\s]+/g, "-")
          .replace(/^\//, "")
          .replace(/\/$/, "");

        const ROUTE_MAP: Record<string, string> = {
          "wall-of-fame": "wall-of-fame",
          fame: "wall-of-fame",
          walloffame: "wall-of-fame",
          "wall-fame": "wall-of-fame",
          events: "events",
          event: "events",
          hackathons: "events",
          team: "team",
          members: "team",
          cohort: "team",
          about: "about",
          timeline: "about",
          history: "about",
          gallery: "gallery",
          photos: "gallery",
          blog: "blog",
          posts: "blog",
          dispatches: "blog",
          contact: "contact",
          reach: "contact",
        };

        const targetRoute = ROUTE_MAP[normalized] ?? ROUTE_MAP[rawArg];

        if (targetRoute) {
          addLog(`Navigating to /${targetRoute}...`, "system");
          router.push(`/${targetRoute}`);
          setTerminalOpen(false);
        } else {
          addLog(`cd: no such file or directory: ${arg}`, "error");
          addLog(
            "Valid directories: events, team, about, gallery, blog, wall-of-fame, contact",
            "system",
          );
          if (state.prefs.sound) soundEngine.playTerminalError();
        }
        break;
      }

      case "events":
        if (arg === "--past") {
          addLog("Past Flagship Events:", "system");
          addLog(
            "· Singularity 2026 (Jan 2026) · 10-year anniversary hackathon (50+ prototypes)",
          );
          addLog(
            "· Smart India Hackathon 2025 · Hack4Hygiene national winners",
          );
          addLog("· RESPAWN · Collegiate gaming and developer tournament");
        } else {
          addLog(
            "Upcoming Flagship Events (use 'events --past' for archive):",
            "accent",
          );
          addLog("· Singularity 2027 · Flagship 24-hr inter-college hackathon");
          addLog("· Detroits · Marquee engineering & robotics battleground");
        }
        break;

      case "team":
        if (arg === "tech" || arg === "technical") {
          addLog("Technical Cohort (2026–27):", "system");
          addLog("· Rushabh · Web Dev Head");
          addLog("· Daivik Pawar · Web Dev Co-Head");
          addLog("· Sachman Chadha · AI/ML Head");
          addLog("· Siddhi Pandey · AI/ML Co-Head");
          addLog("· Devansh Shukla · Cyber Security Head");
          addLog("· Aditi Panchal · IoT Co-Head");
        } else {
          addLog("Core Leadership (2026–27):", "accent");
          addLog("· Raaj Patkar · President");
          addLog("· Subhra Parija · Secretary");
          addLog("· Dr. Arundhati · Faculty Coordinator");
          addLog("View full trading cards at /team", "system");
        }
        break;

      case "stats":
        addLog("Verified E-Cell Statistics (2016–2026):", "system");
        addLog("· 10+ Years of student builders");
        addLog("· 50+ Prototype submissions at Singularity 2026");
        addLog("· 1st Prize Nationally at SIH 2025 (Hack4Hygiene)");
        addLog("· National Finalists at IIT Bombay NEC Grand Finale");
        break;

      case "fame":
        addLog("Wall of Fame Highlights:", "accent");
        addLog("· SIH 2025 Grand Finale Winners: Team Hack4Hygiene");
        addLog(
          "· NEC Finalists: IIT Bombay National Entrepreneurship Challenge",
        );
        addLog("· Innovation Mela 1st Prize Winners");
        break;

      case "socials":
        addLog("Official Connect Channels:", "system");
        addLog("· Instagram: https://instagram.com/kcecell_");
        addLog("· LinkedIn:  https://linkedin.com/company/kcecell");
        addLog("· GitHub:    https://github.com/kc-ecell");
        break;

      case "contact":
        addLog("Official Inquiries: kcecell@kccemsr.edu.in", "accent");
        addLog("Opening contact channel...", "system");
        router.push("/contact");
        setTerminalOpen(false);
        break;

      case "critters":
        addLog(
          "Terminal Daemons (5 critters active in memory heap):",
          "accent",
        );
        addLog(
          "· Drag & throw them across the console to test ballistic physics.",
        );
        addLog("· Click or tap any critter to make it hop and speak.");
        addLog("· Commands: 'pet' to pat one or 'feed' to toss snacks.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ecell:critter-action", {
              detail: { action: "critters" },
            }),
          );
        }
        break;

      case "pet":
        addLog(
          "You patted a campus critter. It happily purred and hopped! +15 XP",
          "accent",
        );
        award("critter:pet", { xp: 15 });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ecell:critter-action", {
              detail: { action: "pet" },
            }),
          );
        }
        break;

      case "feed":
        addLog(
          "You tossed byte-sized snacks into the heap. The critters are feasting! 🍪",
          "accent",
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ecell:critter-action", {
              detail: { action: "feed" },
            }),
          );
        }
        break;

      case "xp":
        addLog("Opening Founder XP Dossier...", "system");
        setDrawerOpen(true);
        break;

      case "game":
        if (arg === "on") {
          setPref("game", true);
          addLog("Founder gamification enabled.", "accent");
        } else if (arg === "off") {
          setPref("game", false);
          addLog("Founder gamification disabled.", "system");
        } else {
          addLog(
            `Current status: game mode is ${state.prefs.game ? "ON" : "OFF"}. Use 'game on' or 'game off'.`,
            "output",
          );
        }
        break;

      case "sound":
        if (arg === "on") {
          setPref("sound", true);
          soundEngine.playXpGain();
          addLog("Retro sound enabled.", "accent");
        } else if (arg === "off") {
          setPref("sound", false);
          addLog("Retro sound disabled.", "system");
        } else {
          addLog(
            `Current status: sound is ${state.prefs.sound ? "ON" : "OFF"}. Use 'sound on' or 'sound off'.`,
            "output",
          );
        }
        break;

      case "clear":
        setLogs([]);
        break;

      case "exit":
        setTerminalOpen(false);
        break;

      // Hidden & Easter Egg Commands
      case "sudo":
        if (arg === "login") {
          setLoginStep("awaiting_email");
          addLog("[sudo] authentication required", "accent");
        } else {
          award("egg:sudo", { xp: 100 });
          addLog(
            "guest is not in the sudoers file. This incident will be reported.",
            "error",
          );
          if (state.prefs.sound) soundEngine.playTerminalError();
        }
        break;

      case "matrix":
        addLog("Waking up into the matrix...", "accent");
        setMatrixActive(true);
        break;

      case "hire":
      case "hire me":
        addLog(
          "Looking to build with us? We recruit contrarian engineers and designers each semester. Reach us via /contact or email kcecell@kccemsr.edu.in with what you've built.",
          "accent",
        );
        break;

      case "pitch": {
        const randomPitch =
          RANDOM_PITCHES[Math.floor(Math.random() * RANDOM_PITCHES.length)] ??
          "AI for startups.";
        addLog(`💡 Generated Pitch: "${randomPitch}"`, "accent");
        break;
      }

      case "coffee":
        addLog("418 I'm a teapot ☕", "accent");
        break;

      case "rm":
        if (arg.includes("-rf") || arg.includes("/")) {
          setPanicActive(true);
          setTimeout(() => {
            setPanicActive(false);
            addLog("just kidding. nice try.", "system");
          }, 2400);
        } else {
          addLog("Permission denied.", "error");
        }
        break;

      case "singularity":
        addLog(
          "Initiating gravitational warp to Singularity 2027...",
          "accent",
        );
        setTimeout(() => {
          router.push("/events#singularity-2027");
          setTerminalOpen(false);
        }, 600);
        break;

      case "credits":
        addLog("E-Cell KCCEMSR Web & Systems Team:", "system");
        addLog("· Rushabh (Web Dev Head)");
        addLog("· Daivik Pawar (Web Dev Co-Head)");
        addLog(
          "· Designed and built with Next.js 16, Supabase, Tailwind, and GSAP.",
          "output",
        );
        break;

      default:
        addLog(
          `command not found: ${cmd}. Type 'help' for available commands.`,
          "error",
        );
        if (state.prefs.sound) soundEngine.playTerminalError();
        break;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Sound on keystroke
    if (state.prefs.sound && e.key.length === 1) {
      soundEngine.playTerminalKey();
    }

    // Up arrow history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < history.length) {
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] ?? "");
      }
    }

    // Down arrow history
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] ?? "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }

    // Tab autocomplete
    if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      if (!trimmed) return;

      if (trimmed.startsWith("cd ")) {
        const dirPart = trimmed.slice(3).trim();
        const dirs = [
          "events",
          "team",
          "about",
          "gallery",
          "blog",
          "wall-of-fame",
          "contact",
        ];
        const matchedDir = dirs.find((d) => d.startsWith(dirPart));
        if (matchedDir) {
          setInput(`cd ${matchedDir}`);
          return;
        }
      }

      const match = PUBLIC_COMMANDS.find((c) => c.startsWith(trimmed));
      if (match) {
        setInput(match);
      }
    }
  };

  // Pull tab on the left edge: drag it out, or tap / press Enter to open.
  const tab = !terminalOpen && (
    <button
      type="button"
      {...tabProps}
      aria-label="Open terminal"
      className={`game-chrome bg-bg fixed top-1/2 left-0 z-[55] flex h-20 w-4 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-r-md border border-l-0 border-emerald-500/50 font-mono text-xs font-bold text-emerald-400 shadow-xl select-none before:absolute before:inset-y-0 before:left-0 before:w-7 active:cursor-grabbing md:w-7 ${
        pulling ? "opacity-0" : ""
      }`}
    >
      <span className="md:hidden">&gt;</span>
      <span className="hidden md:inline">&gt;_</span>
    </button>
  );

  if (!rendered) return tab;

  return (
    <>
      {tab}
      {matrixActive && <MatrixRain onComplete={() => setMatrixActive(false)} />}

      {/* Fake panic glitch modal for rm -rf / */}
      {panicActive && (
        <div className="fixed inset-0 z-[110] flex animate-pulse flex-col items-center justify-center bg-blue-900 p-10 text-center font-mono text-white">
          <div className="mb-6 text-6xl">:(</div>
          <h2 className="mb-4 text-2xl font-bold tracking-wider uppercase">
            SYSTEM KERNEL PANIC: ROOT PARTITION EXPUNGED
          </h2>
          <p className="max-w-md text-sm text-blue-200">
            Stop code: ECELL_FOUNDER_SYS_PANIC_0x0000002A. Recovering memory
            registers...
          </p>
        </div>
      )}

      {/* Dimmed backdrop */}
      <div
        ref={backdropRef}
        data-tier={tier}
        data-leaving={leaving || undefined}
        className="terminal-backdrop fixed inset-0 z-[64] bg-black/60 backdrop-blur-sm"
        onClick={() => setTerminalOpen(false)}
        aria-hidden="true"
      />

      {/* Left Drawer Console */}
      <section
        ref={panelRef}
        data-tier={tier}
        data-leaving={leaving || undefined}
        data-lenis-prevent
        role="dialog"
        aria-label="Interactive Terminal Console"
        aria-modal="true"
        className="terminal-drawer bg-bg/95 fixed inset-y-0 left-0 z-[65] flex h-dvh w-[min(92vw,30rem)] flex-col overflow-hidden border-r border-emerald-500/40 pr-3 font-mono text-xs text-neutral-200 shadow-2xl backdrop-blur-xl select-text sm:text-sm"
      >
        {/* Drag this edge, or the header, left to shut the drawer */}
        <div
          {...closeDragProps}
          aria-hidden="true"
          className="absolute inset-y-0 right-0 z-40 flex w-3 cursor-ew-resize touch-none items-center justify-center"
        >
          <span className="h-12 w-1 rounded-full bg-emerald-500/50" />
        </div>

        {/* Terminal Header Bar */}
        <div
          {...closeDragProps}
          className="bg-bg relative z-30 flex cursor-grab touch-none items-center justify-between border-b border-white/10 px-4 py-2 select-none active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              guest@ecell:~$ (ecell.sh v1.0.4)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <kbd className="hidden rounded bg-white/10 px-1 text-[11px] text-white sm:inline">
              Esc
            </kbd>
            <button
              type="button"
              onClick={() => setTerminalOpen(false)}
              className="cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:text-white"
              aria-label="Close terminal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Console Body: Log Output + Interactive Critters Layer */}
        <div
          ref={consoleRef}
          data-lenis-prevent
          className="relative flex min-h-[220px] flex-1 overflow-hidden"
        >
          {/* Critters Canvas */}
          <TerminalCritters
            onInteract={() => award("critter:interact", { xp: 10 })}
            onClickBlank={() => inputRef.current?.focus()}
          />

          {/* Scrollable Log Output */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="pointer-events-none relative z-20 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 leading-relaxed select-text sm:p-5 [@media(pointer:coarse)]:pointer-events-auto"
          >
            {logs.map((log) => (
              <div
                key={log.id}
                className={`pointer-events-auto select-text ${
                  log.type === "input"
                    ? "font-semibold text-emerald-400"
                    : log.type === "error"
                      ? "font-medium text-red-400"
                      : log.type === "accent"
                        ? "font-medium text-amber-300"
                        : log.type === "system"
                          ? "text-xs text-neutral-400 italic"
                          : "text-neutral-200"
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>

        {/* Command Input Row */}
        <form
          onSubmit={handleSubmit}
          className="terminal-input-bar bg-bg relative z-30 flex items-center gap-2 border-t border-white/10 px-4 py-3"
        >
          <span className="shrink-0 font-bold text-emerald-400 select-none">
            {loginStep === "awaiting_email"
              ? "email: "
              : loginStep === "awaiting_code"
                ? "code: "
                : "guest@ecell:~$ "}
          </span>
          <input
            ref={inputRef}
            type={loginStep === "awaiting_code" ? "password" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              loginStep === "awaiting_email"
                ? "staff@kccemsr.edu.in"
                : loginStep === "awaiting_code"
                  ? "code from your email"
                  : "type 'help' or any command..."
            }
            className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-neutral-600 sm:text-sm"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="go"
            inputMode={loginStep === "awaiting_email" ? "email" : "text"}
            spellCheck={false}
            aria-label="Terminal input"
          />
        </form>
      </section>
    </>
  );
}
