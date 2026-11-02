"use client";

import { useEffect, useRef } from "react";
import { soundEngine } from "@/lib/game/sound";

// One art pixel = U css pixels; everything snaps to this grid so it stays crisp.
const U = 3;
const BODY_W = 14;
const BODY_H = 12;
const DEPTH = 4;
const LEG_H = 2;

// Physics in css px and seconds.
const GRAVITY = 1900;
const MAX_LAUNCH = 3200;
const BOUNCE = 0.34;
const TAP_MS = 280;

type Mood = "bars" | "dots" | "happy" | "sleepy" | "wide" | "dizzy";
type State = "walk" | "idle" | "sleep" | "held" | "air";

interface Palette {
  body: string;
  lit: string;
  outline: string;
  side: string;
}

// E-Cell tech palettes: Cyber Emerald, Founder Gold, Electric Sky, Neon Lilac, Terminal Alabaster
const PALETTES: Palette[] = [
  { body: "#10b981", lit: "#6ee7b7", outline: "#065f46", side: "#047857" }, // Cyber Emerald
  { body: "#f59e0b", lit: "#fde68a", outline: "#b45309", side: "#d97706" }, // Founder Gold
  { body: "#38bdf8", lit: "#bae6fd", outline: "#0369a1", side: "#0284c7" }, // Electric Sky
  { body: "#c084fc", lit: "#f3e8ff", outline: "#7e22ce", side: "#9333ea" }, // Neon Lilac
  { body: "#edece6", lit: "#ffffff", outline: "#9ca3af", side: "#6b7280" }, // Terminal Alabaster
];

const SAYINGS = [
  "buidl!",
  "ship it!",
  "need funding",
  "pitch ready",
  "pivot!",
  "wheee!",
  "sudo win",
  "75%!",
  "whoami",
  "hello :)",
  "*yawn*",
  "founder mode",
  "418 teapot",
  "to the moon 🚀",
  "let him cook",
];

interface Critter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  speed: number;
  theta: number;
  thetaTarget: number;
  rot: number;
  rotV: number;
  lift: number;
  liftV: number;
  squash: number;
  step: number;
  state: State;
  timer: number;
  mood: Mood;
  moodTimer: number;
  blinkIn: number;
  blink: number;
  naps: number;
  say: string;
  sayTimer: number;
  palette: Palette;
  zTimer: number;
  entering: boolean;
}

interface Z {
  x: number;
  y: number;
  age: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]!;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const Z_SPRITE = ["zzz", "..z", ".z.", "zzz"];

export function TerminalCritters({
  count = 5,
  onInteract,
  onClickBlank,
}: {
  count?: number;
  onInteract?: () => void;
  onClickBlank?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onInteractRef = useRef(onInteract);
  const onClickBlankRef = useRef(onClickBlank);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onClickBlankRef.current = onClickBlank;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let w = 0;
    let h = 0;

    // The walkable band is the bottom zone of the terminal console floor
    const band = () => {
      const top = Math.max(30, h - 85);
      const bottom = Math.max(top + 15, h - 20);
      return { top, bottom };
    };

    const critters: Critter[] = [];

    const newTarget = (c: Critter) => {
      const b = band();
      c.tx = clamp(c.x + rand(-180, 180), 30, w - 30);
      c.ty = rand(b.top, b.bottom);
    };

    const spawnCritters = () => {
      critters.length = 0;
      const effectiveW = w > 0 ? w : parent.clientWidth || 600;
      const effectiveH = h > 0 ? h : parent.clientHeight || 260;
      const n = Math.max(2, Math.min(count, Math.floor(effectiveW / 120)));
      const b = band();

      for (let i = 0; i < n; i++) {
        const c: Critter = {
          x: ((i + 0.5) / n) * effectiveW + rand(-20, 20),
          y: rand(b.top, b.bottom),
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
          speed: rand(30, 48),
          theta: 0,
          thetaTarget: 0,
          rot: 0,
          rotV: 0,
          lift: Math.min(effectiveH * 0.45, 160) + i * 35 + rand(0, 25),
          liftV: 0,
          squash: 0,
          step: 0,
          state: "air",
          timer: rand(1, 2.5),
          mood: pick<Mood>(["bars", "bars", "dots"]),
          moodTimer: 0,
          blinkIn: rand(1, 4),
          blink: 0,
          naps: 0,
          say: "",
          sayTimer: 0,
          palette: PALETTES[i % PALETTES.length]!,
          zTimer: 0,
          entering: true,
        };
        newTarget(c);
        critters.push(c);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const newW = parent.clientWidth;
      const newH = parent.clientHeight;
      if (newW === 0 || newH === 0) return;

      const oldW = w;
      const oldB = band();

      w = newW;
      h = newH;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const newB = band();
      if (critters.length === 0) {
        spawnCritters();
      } else if (oldW > 0) {
        const spanOld = Math.max(1, oldB.bottom - oldB.top);
        const spanNew = Math.max(1, newB.bottom - newB.top);
        for (const c of critters) {
          c.x = clamp((c.x / oldW) * w, 25, w - 25);
          c.tx = clamp((c.tx / oldW) * w, 25, w - 25);
          const relY = clamp((c.y - oldB.top) / spanOld, 0, 1);
          c.y = newB.top + relY * spanNew;
          c.ty = clamp(newB.top + relY * spanNew, newB.top, newB.bottom);
        }
      } else {
        for (let i = 0; i < critters.length; i++) {
          const c = critters[i]!;
          c.x = ((i + 0.5) / critters.length) * w + rand(-20, 20);
          c.y = rand(newB.top, newB.bottom);
          newTarget(c);
        }
      }
    };

    resize();
    if (critters.length === 0) spawnCritters();
    const zs: Z[] = [];

    // Pointer state
    const pointer = {
      x: -999,
      y: -999,
      inside: false,
      downAt: 0,
      downX: 0,
      downY: 0,
    };
    const history: { x: number; y: number; t: number }[] = [];
    let hovered: Critter | null = null;
    let activeCritter: Critter | null = null;
    let isDragging = false;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    let originalGroundY = 0;
    let wasAsleep = false;

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const hit = (px: number, py: number) => {
      const sorted = [...critters].sort((a, b) => b.y - a.y);
      return (
        sorted.find((c) => {
          const top = c.y - c.lift - (BODY_H + LEG_H) * U - 12;
          const bottom = c.y - c.lift + 12;
          return (
            Math.abs(px - c.x) < (BODY_W / 2) * U + 16 &&
            py > top &&
            py < bottom
          );
        }) ?? null
      );
    };

    const say = (c: Critter, text: string, secs = 1.8) => {
      c.say = text;
      c.sayTimer = secs;
    };

    // Public event listener for terminal commands like 'critters', 'pet', 'feed'
    const handleTerminalAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      const action = customEvent.detail?.action;

      if (action === "cheer" || action === "critters") {
        critters.forEach((c) => {
          c.state = "air";
          c.liftV = rand(450, 700);
          c.mood = "happy";
          c.moodTimer = 2.0;
          say(c, pick(SAYINGS), 1.8);
        });
      } else if (action === "pet") {
        const c = pick(critters);
        c.state = "air";
        c.liftV = 550;
        c.mood = "happy";
        c.moodTimer = 2.5;
        say(c, "♥ purr!", 2.0);
      } else if (action === "feed") {
        critters.forEach((c) => {
          c.mood = "happy";
          c.moodTimer = 2.2;
          say(c, pick(["nom!", "yum!", "thanks!", "cookies!"]), 1.8);
        });
      }
    };

    window.addEventListener("ecell:critter-action", handleTerminalAction);

    const onMove = (e: PointerEvent) => {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.inside = true;

      const now = performance.now();
      if (history.length === 0 || now - history[history.length - 1]!.t >= 6) {
        history.push({ x: p.x, y: p.y, t: now });
        while (history.length > 1 && now - history[0]!.t > 120) {
          history.shift();
        }
      }

      if (activeCritter) {
        const dist = Math.hypot(p.x - pointer.downX, p.y - pointer.downY);
        if (!isDragging && dist > 5) {
          isDragging = true;
          activeCritter.state = "held";
          activeCritter.rot = 0;
          activeCritter.rotV = 0;
          activeCritter.mood = "wide";
          activeCritter.moodTimer = 0.5;
        }

        if (isDragging) {
          canvas.style.cursor = "grabbing";
          const b = band();
          activeCritter.x = clamp(p.x + grabOffsetX, 25, w - 25);

          const groundY = clamp(originalGroundY, b.top, b.bottom);
          const visualY = p.y + grabOffsetY;

          if (visualY <= groundY) {
            activeCritter.y = groundY;
            activeCritter.lift = groundY - visualY;
          } else {
            activeCritter.y = clamp(visualY, b.top, b.bottom);
            activeCritter.lift = 0;
          }
        }
      } else {
        hovered = hit(p.x, p.y);
        canvas.style.cursor = hovered ? "grab" : "default";
      }
    };

    const onDown = (e: PointerEvent) => {
      const p = local(e);
      const c = hit(p.x, p.y);
      if (!c) {
        onClickBlankRef.current?.();
        return;
      }

      onInteractRef.current?.();
      wasAsleep = c.state === "sleep";
      c.entering = false;

      activeCritter = c;
      hovered = c;
      isDragging = false;
      pointer.downAt = performance.now();
      pointer.downX = p.x;
      pointer.downY = p.y;
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.inside = true;

      grabOffsetX = c.x - p.x;
      grabOffsetY = c.y - c.lift - p.y;
      originalGroundY = c.y;

      history.length = 0;
      history.push({ x: p.x, y: p.y, t: performance.now() });

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onUp = (e: PointerEvent) => {
      if (!activeCritter) return;
      const c = activeCritter;
      activeCritter = null;

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {}

      const p = local(e);
      const now = performance.now();
      const pressDuration = now - pointer.downAt;
      const moveDistance = Math.hypot(p.x - pointer.downX, p.y - pointer.downY);
      const isTap = !isDragging && (pressDuration < TAP_MS || moveDistance < 6);

      if (isTap) {
        c.state = "air";
        c.liftV = 580;
        c.vx = rand(-15, 15);
        c.vy = 0;
        c.rot = 0;
        c.rotV = 0;
        c.mood = "happy";
        c.moodTimer = 1.6;
        say(c, wasAsleep ? "!" : pick(SAYINGS));
        soundEngine.playXpGain();
      } else if (isDragging) {
        history.push({ x: p.x, y: p.y, t: now });

        const recent = history.filter((pt) => now - pt.t <= 120);
        const pFirst = recent[0] ?? { x: p.x, y: p.y, t: now - 16 };
        const pLast = recent[recent.length - 1] ?? pFirst;
        const dt = Math.max(0.016, (pLast.t - pFirst.t) / 1000);

        let vx = clamp((pLast.x - pFirst.x) / dt, -MAX_LAUNCH, MAX_LAUNCH);
        const vy = clamp((pLast.y - pFirst.y) / dt, -MAX_LAUNCH, MAX_LAUNCH);

        let liftV = -vy;
        const timeSinceLastMove = now - pLast.t;
        if (timeSinceLastMove > 70) {
          vx = 0;
          liftV = 0;
        } else if (liftV > 100) {
          liftV = Math.max(liftV * 1.15, 650);
        }

        c.state = "air";
        c.vx = vx * 0.92;
        c.vy = 0;
        c.liftV = liftV;
        c.rotV = clamp(vx / 220, -12, 12);

        if (Math.hypot(vx, liftV) > 700) {
          c.mood = "wide";
          c.moodTimer = 1.5;
          say(c, pick(["wheee!", "whoa!", "aaah!", "rocket mode!"]), 1.4);
        }
      }

      isDragging = false;
      canvas.style.cursor = hovered ? "grab" : "default";
    };

    const onLeave = () => {
      pointer.inside = false;
      if (!activeCritter) hovered = null;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    // ---------------------------------------------------------------- simulation
    const update = (c: Critter, dt: number) => {
      const b = band();
      c.squash = Math.max(0, c.squash - dt * 4);
      if (c.sayTimer > 0) c.sayTimer -= dt;
      if (c.moodTimer > 0) {
        c.moodTimer -= dt;
        if (c.moodTimer <= 0) c.mood = pick<Mood>(["bars", "bars", "dots"]);
      }
      c.blinkIn -= dt;
      if (c.blinkIn <= 0) {
        c.blink = 0.12;
        c.blinkIn = rand(2, 5);
      }
      if (c.blink > 0) c.blink -= dt;

      if (c.state === "held") {
        c.thetaTarget = 0;
      } else if (c.state === "air") {
        c.liftV -= GRAVITY * dt;
        c.lift += c.liftV * dt;
        c.x += c.vx * dt;
        c.rot += c.rotV * dt;

        // Bounce off left/right terminal walls
        if (c.x < 25 || c.x > w - 25) {
          c.x = clamp(c.x, 25, w - 25);
          c.vx *= -0.55;
          c.rotV *= -0.6;
        }

        // Ceiling bounce
        const maxLift = Math.max(0, c.y - 14);
        if (c.lift > maxLift) {
          c.lift = maxLift;
          c.liftV = -Math.abs(c.liftV) * 0.4;
          c.rotV *= -0.5;
        }

        // Ground landing
        if (c.lift <= 0) {
          const impact = -c.liftV;
          c.lift = 0;
          c.squash = clamp(impact / 1200, 0.3, 1);
          if (impact > 220) {
            c.liftV = impact * BOUNCE;
            c.vx *= 0.6;
            c.rotV *= 0.5;
          } else {
            c.state = "idle";
            c.timer = rand(0.8, 2);
            c.liftV = 0;
            c.vx = 0;
            c.rot = 0;
            c.rotV = 0;
          }
          if (c.entering) {
            c.entering = false;
          } else if (impact > 1400) {
            c.mood = "dizzy";
            c.moodTimer = 1.8;
            say(c, pick(["ow", "@_@", "again!"]), 1.4);
          }
        }
      } else if (c.state === "walk") {
        const dx = c.tx - c.x;
        const dy = c.ty - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 4) {
          c.state = "idle";
          c.vx = c.vy = 0;
          c.timer = rand(1.2, 4);
        } else {
          c.vx = (dx / d) * c.speed;
          c.vy = (dy / d) * c.speed * 0.6;
          c.x += c.vx * dt;
          c.y = clamp(c.y + c.vy * dt, b.top, b.bottom);
          c.step += dt * 7;
          c.thetaTarget = (c.vx >= 0 ? 1 : -1) * Math.PI * 0.36;
        }
      } else if (c.state === "idle") {
        c.thetaTarget = 0;
        c.timer -= dt;
        if (c.timer <= 0) {
          if (Math.random() < 0.2) {
            c.state = "sleep";
            c.timer = rand(6, 11);
            c.naps++;
          } else {
            c.state = "walk";
            newTarget(c);
          }
        }
      } else if (c.state === "sleep") {
        c.thetaTarget = 0;
        c.timer -= dt;
        c.zTimer -= dt;
        if (c.zTimer <= 0) {
          zs.push({ x: c.x + 14, y: c.y - BODY_H * U - 8, age: 0 });
          c.zTimer = 1.1;
        }
        if (c.timer <= 0) {
          c.state = "idle";
          c.timer = rand(0.5, 1.5);
        }
      }

      c.theta += (c.thetaTarget - c.theta) * Math.min(1, dt * 8);
    };

    const separate = () => {
      for (let i = 0; i < critters.length; i++) {
        for (let j = i + 1; j < critters.length; j++) {
          const a = critters[i]!;
          const b = critters[j]!;
          if (
            a.lift > 0 ||
            b.lift > 0 ||
            a.state === "held" ||
            b.state === "held"
          )
            continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (Math.abs(dx) < BODY_W * U + 6 && Math.abs(dy) < 14) {
            const push = (BODY_W * U + 6 - Math.abs(dx)) / 2;
            const s = dx >= 0 ? 1 : -1;
            a.x -= push * s * 0.2;
            b.x += push * s * 0.2;
          }
        }
      }
    };

    // ---------------------------------------------------------------- drawing
    const eyeMood = (c: Critter): Mood | "blink" => {
      if (c.state === "sleep") return "sleepy";
      if (c.blink > 0 && c.mood !== "dizzy") return "blink";
      return c.mood;
    };

    const drawShadow = (c: Critter) => {
      const s = clamp(1 - c.lift / 800, 0.25, 1);
      const half = Math.max(1, Math.round((BODY_W / 2 + 1) * s));
      ctx.fillStyle = `rgba(0,0,0,${0.35 + 0.25 * s})`;
      const x = Math.round(c.x / U) * U;
      const y = Math.round(c.y / U) * U;
      ctx.fillRect(x - half * U, y - U, half * 2 * U, U);
      ctx.fillRect(x - (half - 1) * U, y, (half - 1) * 2 * U, U);
    };

    const draw = (c: Critter, clock: number) => {
      const lit = c === hovered || c === activeCritter;
      const pal = c.palette;
      const outline = pal.outline;
      const sitting = c.state === "sleep";
      const cos = Math.cos(c.theta);
      const sin = Math.sin(c.theta);
      const fw = Math.max(1, Math.round(BODY_W * Math.abs(cos)));
      const sw = Math.round(DEPTH * Math.abs(sin));
      const total = fw + sw;
      const x0 = -Math.floor(total / 2);
      const sideOnRight = sin < 0;
      const fx = sideOnRight ? x0 : x0 + sw;
      const sx = sideOnRight ? x0 + fw : x0;
      const top = -BODY_H - (sitting ? 0 : LEG_H);

      ctx.save();
      ctx.translate(Math.round(c.x), Math.round(c.y - c.lift));
      if (c.rot) ctx.rotate(c.rot);
      const sq = c.squash * 0.2 + (sitting ? Math.sin(clock * 2) * 0.03 : 0);
      const st =
        c.state === "air" ? Math.min(0.28, Math.abs(c.liftV) / 7000) : 0;
      ctx.scale(U * (1 + sq - st * 0.6), U * (1 - sq + st));
      const px = (x: number, y: number, ww = 1, hh = 1) =>
        ctx.fillRect(x, y, ww, hh);

      const moving = c.state === "walk";
      const phase = Math.floor(c.step) % 2;
      const dangling = c.state === "held" || c.state === "air";

      // Legs
      ctx.fillStyle = outline;
      if (!sitting) {
        const legL = Math.round(-total / 2 + total * 0.3);
        const legR = Math.round(-total / 2 + total * 0.7) - 1;
        if (dangling) {
          px(legL, -LEG_H, 1, 2);
          px(legR, -LEG_H, 1, 2);
          px(legL - 1, -1);
          px(legR + 1, -1);
        } else {
          px(legL, -LEG_H, 1, moving && phase ? 1 : 2);
          px(legR, -LEG_H, 1, moving && !phase ? 1 : 2);
          px(legL - 1, -1 - (moving && phase ? 1 : 0));
          px(legR + 1, -1 - (moving && !phase ? 1 : 0));
        }
      }

      // Arms
      const left = x0 - 1;
      const right = x0 + total;
      const cheer = c.mood === "happy" && Math.floor(clock * 6) % 2 === 0;
      if (dangling || cheer) {
        px(left, top + 2, 1, 2);
        px(left - 1, top + 1);
        px(right, top + 2, 1, 2);
        px(right + 1, top + 1);
      } else if (!sitting) {
        const ly = top + 5 + (moving ? phase : 0);
        px(left, ly);
        px(left - 1, ly + 1, 1, 2);
        px(left, ly + 3);
        const ry = top + 5 + (moving ? 1 - phase : 0);
        px(right, ry);
        px(right + 1, ry + 1, 1, 2);
        px(right, ry + 3);
      } else {
        px(left, top + 7, 1, 3);
        px(right, top + 7, 1, 3);
      }

      // Body
      if (sw > 0) {
        ctx.fillStyle = pal.side;
        px(sx, top + (sw > 1 ? 1 : 0), sw, BODY_H - (sw > 1 ? 1 : 0));
      }
      ctx.fillStyle = lit ? pal.lit : pal.body;
      px(fx, top, fw, BODY_H);
      ctx.fillStyle = outline;
      px(fx, top, fw, 3);
      px(fx, top, 1, BODY_H);
      px(fx + fw - 1, top, 1, BODY_H);
      px(fx, top + BODY_H - 1, fw, 1);

      const facingFront = cos > 0.2;
      if (fw >= 5) {
        ctx.fillStyle = "#090a18";
        for (const d of [2, 4, 6])
          px(fx + Math.round((d / BODY_W) * fw), top + 1);
      }

      // Eyes (track pointer)
      if (facingFront && fw >= 4) {
        ctx.fillStyle = "#090a18";
        const ey = top + 5;
        const narrow = fw < 9;
        const m = eyeMood(c);
        const near =
          pointer.inside &&
          fw >= 12 &&
          Math.abs(pointer.x - c.x) > 24 &&
          Math.hypot(pointer.x - c.x, pointer.y - c.y) < 240;
        const look = near ? Math.sign(pointer.x - c.x) : 0;
        const e1 = fx + Math.round(fw * 0.36) - 1 + look;
        const e2 = fx + Math.round(fw * 0.64) + look;
        for (const ex of [e1, e2]) {
          switch (m) {
            case "blink":
            case "sleepy":
              px(ex, ey + 2, narrow ? 1 : 2, 1);
              break;
            case "dots":
              px(ex, ey + 1, narrow ? 1 : 2, 2);
              break;
            case "happy":
              px(ex, ey + 1);
              if (!narrow) {
                px(ex + 1, ey);
                px(ex + 2, ey + 1);
              }
              break;
            case "wide":
              px(ex, ey, narrow ? 1 : 2, 4);
              break;
            case "dizzy":
              px(ex - 1, ey);
              px(ex + 1, ey);
              px(ex, ey + 1);
              px(ex - 1, ey + 2);
              px(ex + 1, ey + 2);
              break;
            default:
              px(ex, ey, 1, 4);
          }
        }
      }
      ctx.restore();
    };

    const drawSay = (c: Critter) => {
      if (c.sayTimer <= 0 || !c.say) return;
      ctx.font = `600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      const tw = Math.ceil(ctx.measureText(c.say).width);
      const bw = tw + 14;
      const bh = 20;
      const bx = Math.round(clamp(c.x - bw / 2, 6, w - bw - 6));
      const by = Math.round(c.y - c.lift - (BODY_H + LEG_H) * U - bh - 10);
      const a = Math.min(1, c.sayTimer * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#0c0d1e";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1;

      // Stepped pixel bubble
      ctx.fillRect(bx + 2, by, bw - 4, bh);
      ctx.fillRect(bx, by + 2, bw, bh - 4);
      ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);

      const tx = Math.round(c.x / U) * U;
      ctx.fillRect(tx - 3, by + bh, 6, 3);
      ctx.fillRect(tx - 1, by + bh + 3, 3, 3);

      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(c.say, bx + 7, by + bh / 2 + 1);
      ctx.globalAlpha = 1;
    };

    const drawZs = (dt: number) => {
      for (let i = zs.length - 1; i >= 0; i--) {
        const z = zs[i]!;
        z.age += dt;
        if (z.age > 2.4) {
          zs.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, 1 - z.age / 2.4);
        ctx.fillStyle = "#10b981";
        const s = 2;
        const ox = Math.round(z.x + Math.sin(z.age * 3) * 4);
        const oy = Math.round(z.y - z.age * 20);
        Z_SPRITE.forEach((row, r) =>
          [...row].forEach(
            (ch, col) =>
              ch === "z" && ctx.fillRect(ox + col * s, oy + r * s, s, s),
          ),
        );
        ctx.globalAlpha = 1;
      }
    };

    // ---------------------------------------------------------------- loop
    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      clock += dt;

      for (const c of critters) update(c, dt);
      separate();

      ctx.clearRect(0, 0, w, h);
      const order = [...critters].sort((a, b) => a.y - b.y);
      for (const c of order) drawShadow(c);
      for (const c of order) draw(c, clock);
      drawZs(dt);
      for (const c of order) drawSay(c);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("ecell:critter-action", handleTerminalAction);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 z-10 block h-full w-full"
    />
  );
}
