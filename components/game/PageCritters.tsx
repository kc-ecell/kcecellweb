"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useFounder } from "@/lib/game/FounderContext";
import { soundEngine } from "@/lib/game/sound";

// Snap pixel grid
const U = 3;
const BODY_W = 14;
const BODY_H = 12;
const DEPTH = 4;
const LEG_H = 2;

// Realistic physics in css px and seconds
const GRAVITY = 1900;
const MAX_LAUNCH = 3200;
const BOUNCE = 0.35;
const TAP_MS = 280;

type Mood = "bars" | "dots" | "happy" | "sleepy" | "wide" | "dizzy";
type State = "walk" | "idle" | "sleep" | "held" | "air";

interface Palette {
  body: string;
  lit: string;
  outline: string;
  side: string;
}

const PALETTES: Palette[] = [
  // Cyber Emerald
  { body: "#10b981", lit: "#34d399", outline: "#065f46", side: "#047857" },
  // Founder Gold / Amber
  { body: "#f59e0b", lit: "#fbbf24", outline: "#b45309", side: "#92400e" },
  // Electric Sky
  { body: "#38bdf8", lit: "#7dd3fc", outline: "#0284c7", side: "#0369a1" },
  // Neon Lilac
  { body: "#c084fc", lit: "#d8b4fe", outline: "#9333ea", side: "#7e22ce" },
  // Terminal Alabaster
  { body: "#edece6", lit: "#ffffff", outline: "#a19e95", side: "#78766f" },
  // Sunset Coral
  { body: "#fb7185", lit: "#fda4af", outline: "#e11d48", side: "#be123c" },
];

const SAYINGS = [
  "buidl!",
  "ship it!",
  "need funding",
  "pitch ready!",
  "75% attendance!",
  "pivot!",
  "whoami",
  "founder mode",
  "coffee ++",
  "to the moon 🚀",
  "sudo win",
  "418 teapot",
  "unicorn soon",
  "boop ♥",
  "hello world",
  "hackathon time!",
];

interface Critter {
  id: number;
  x: number;
  y: number;
  homeY: number;
  bandTop: number;
  bandBottom: number;
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

export function PageCritters({ count = 10 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();
  const { terminalOpen, state, award } = useFounder();
  const awardRef = useRef(award);

  useEffect(() => {
    awardRef.current = award;
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
    let raf = 0;
    let clock = 0;
    let last = performance.now();
    let isTabVisible = !document.hidden;

    const critters: Critter[] = [];

    const newTarget = (c: Critter) => {
      c.tx = clamp(c.x + rand(-360, 360), 30, w - 30);
      c.ty = rand(c.bandTop, c.bandBottom);
    };

    const spawnCritters = () => {
      critters.length = 0;
      const effectiveW = w > 0 ? w : parent.clientWidth || window.innerWidth;
      const effectiveH =
        h > 0 ? h : Math.max(parent.scrollHeight, window.innerHeight, 900);

      // On mobile screens, slightly fewer to keep clarity
      const n = Math.max(
        4,
        Math.min(count, Math.floor(effectiveW / (effectiveW < 640 ? 70 : 100))),
      );

      for (let i = 0; i < n; i++) {
        // Distribute home elevation across the full page height (from 8% to 92%)
        const ratio = n === 1 ? 0.5 : 0.08 + (i / (n - 1)) * 0.84;
        const homeY = Math.round(ratio * effectiveH);
        const bandTop = Math.max(60, homeY - 45);
        const bandBottom = Math.min(effectiveH - 40, homeY + 45);

        const c: Critter = {
          id: i,
          x: ((i + 0.5) / n) * effectiveW + rand(-30, 30),
          y: rand(bandTop, bandBottom),
          homeY,
          bandTop,
          bandBottom,
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
          speed: rand(30, 50),
          theta: 0,
          thetaTarget: 0,
          rot: 0,
          rotV: 0,
          lift: rand(120, 260),
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
      // On narrow screens pages get very tall, so critters spread across the whole
      // page are almost never on screen (and a page-tall canvas can exceed mobile
      // canvas limits). There, pin the canvas to the viewport instead.
      const viewportMode = window.innerWidth < 768;
      canvas.style.position = viewportMode ? "fixed" : "";
      const newW = viewportMode
        ? window.innerWidth
        : parent.clientWidth || window.innerWidth;
      const newH = viewportMode
        ? window.innerHeight
        : Math.max(
            parent.scrollHeight,
            parent.clientHeight,
            window.innerHeight,
          );

      if (newW === 0 || newH === 0) return;

      const oldW = w;
      const oldH = h;

      w = newW;
      h = newH;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      if (critters.length === 0) {
        spawnCritters();
      } else if (oldW > 0 && oldH > 0) {
        for (let i = 0; i < critters.length; i++) {
          const c = critters[i]!;
          c.x = clamp((c.x / oldW) * w, 25, w - 25);
          c.tx = clamp((c.tx / oldW) * w, 25, w - 25);

          const ratio = (i + 0.5) / critters.length;
          c.homeY = Math.round((0.08 + ratio * 0.84) * h);
          c.bandTop = Math.max(60, c.homeY - 45);
          c.bandBottom = Math.min(h - 40, c.homeY + 45);
          c.y = clamp((c.y / oldH) * h, c.bandTop, c.bandBottom);
          c.ty = clamp(c.ty, c.bandTop, c.bandBottom);
        }
      } else {
        spawnCritters();
      }
    };

    resize();
    if (critters.length === 0) spawnCritters();

    const zs: Z[] = [];

    // Pointer state
    const pointer = {
      x: -999,
      y: -999,
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

    // Convert screen coordinates to canvas document space
    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const hit = (px: number, py: number) => {
      const sorted = [...critters].sort((a, b) => b.y - a.y);
      return (
        sorted.find((c) => {
          const top = c.y - c.lift - (BODY_H + LEG_H) * U - 14;
          const bottom = c.y - c.lift + 14;
          return (
            Math.abs(px - c.x) < (BODY_W / 2) * U + 18 &&
            py > top &&
            py < bottom
          );
        }) ?? null
      );
    };

    const say = (c: Critter, text: string, secs = 2.0) => {
      c.say = text;
      c.sayTimer = secs;
    };

    const updatePointerEvents = (isOver: boolean) => {
      if (isDragging || isOver) {
        if (canvas.style.pointerEvents !== "auto") {
          canvas.style.pointerEvents = "auto";
        }
        canvas.style.cursor = isDragging ? "grabbing" : "grab";
      } else {
        if (canvas.style.pointerEvents !== "none") {
          canvas.style.pointerEvents = "none";
        }
        canvas.style.cursor = "default";
      }
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      pointer.x = pos.x;
      pointer.y = pos.y;

      if (!isDragging) {
        hovered = hit(pos.x, pos.y);
        updatePointerEvents(!!hovered);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      pointer.x = pos.x;
      pointer.y = pos.y;

      const now = performance.now();
      if (history.length === 0 || now - history[history.length - 1]!.t >= 6) {
        history.push({ x: pos.x, y: pos.y, t: now });
        while (history.length > 1 && now - history[0]!.t > 120) {
          history.shift();
        }
      }

      if (activeCritter) {
        const dist = Math.hypot(pos.x - pointer.downX, pos.y - pointer.downY);
        if (!isDragging && dist > 5) {
          isDragging = true;
          activeCritter.state = "held";
          activeCritter.rot = 0;
          activeCritter.rotV = 0;
          activeCritter.mood = "wide";
          activeCritter.moodTimer = 0.5;
          updatePointerEvents(true);
        }

        if (isDragging) {
          activeCritter.x = clamp(pos.x + grabOffsetX, 25, w - 25);
          const rawTargetY = pos.y + grabOffsetY;
          const targetY = clamp(rawTargetY, 20, originalGroundY);
          activeCritter.lift = Math.max(0, originalGroundY - targetY);
          activeCritter.y = originalGroundY;
          activeCritter.vx = 0;
          activeCritter.vy = 0;
          activeCritter.liftV = 0;

          if (history.length >= 2) {
            const first = history[0]!;
            const lastSample = history[history.length - 1]!;
            const dtSec = (lastSample.t - first.t) / 1000;
            if (dtSec > 0.01) {
              const vx = (lastSample.x - first.x) / dtSec;
              activeCritter.thetaTarget = clamp(vx * 0.0006, -0.7, 0.7);
            }
          }
        }
      } else {
        hovered = hit(pos.x, pos.y);
        updatePointerEvents(!!hovered);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      const c = hit(pos.x, pos.y);
      if (!c) {
        updatePointerEvents(false);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      awardRef.current?.("critter:interact", { xp: 10 });
      soundEngine.playXpGain();

      wasAsleep = c.state === "sleep";
      c.entering = false;

      activeCritter = c;
      hovered = c;
      isDragging = false;
      pointer.downAt = performance.now();
      pointer.downX = pos.x;
      pointer.downY = pos.y;
      pointer.x = pos.x;
      pointer.y = pos.y;

      grabOffsetX = c.x - pos.x;
      grabOffsetY = c.y - c.lift - pos.y;
      originalGroundY = c.y;

      history.length = 0;
      history.push({ x: pos.x, y: pos.y, t: performance.now() });

      updatePointerEvents(true);

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!activeCritter) return;
      const c = activeCritter;
      activeCritter = null;

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {}

      const pos = toCanvasCoords(e.clientX, e.clientY);
      const now = performance.now();
      const dtMs = now - pointer.downAt;

      if (!isDragging && dtMs < TAP_MS) {
        // Tap interaction
        if (wasAsleep) {
          c.state = "idle";
          c.mood = "happy";
          c.moodTimer = 1.8;
          c.timer = rand(2, 4);
          say(c, pick(["*yawn*", "awake!", "good morning!"]));
        } else {
          c.state = "air";
          c.liftV = 420;
          c.mood = "happy";
          c.moodTimer = 1.8;
          say(c, pick(SAYINGS));
        }
      } else if (isDragging) {
        // Fling / launch physics across page!
        let vx = 0;
        let vy = 0;
        if (history.length >= 2) {
          const first = history[0]!;
          const lastSample = history[history.length - 1]!;
          const dtSec = Math.max(0.015, (lastSample.t - first.t) / 1000);
          vx = (lastSample.x - first.x) / dtSec;
          vy = (lastSample.y - first.y) / dtSec;
        }

        const launchVx = clamp(vx * 1.35, -MAX_LAUNCH, MAX_LAUNCH);
        const launchLiftV = clamp(-vy * 1.45, -MAX_LAUNCH, MAX_LAUNCH);

        c.vx = launchVx;
        c.liftV = launchLiftV;

        if (c.lift > 2 || Math.abs(c.liftV) > 120 || Math.abs(c.vx) > 160) {
          c.state = "air";
          c.rotV = clamp(c.vx * 0.009, -15, 15);
          c.mood =
            Math.abs(c.liftV) > 1000 || Math.abs(c.vx) > 1200
              ? "dizzy"
              : "happy";
          c.moodTimer = 2.0;
          say(c, pick(["wheee!", "launch!", "to the moon!", "buidl!"]));
        } else {
          c.state = "idle";
          c.lift = 0;
          c.liftV = 0;
          c.vx = 0;
          c.timer = rand(1.5, 3.5);
        }
      }

      isDragging = false;
      hovered = hit(pos.x, pos.y);
      updatePointerEvents(!!hovered);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // Physics update step
    const update = (c: Critter, dt: number) => {
      c.timer -= dt;
      if (c.moodTimer > 0) {
        c.moodTimer -= dt;
        if (c.moodTimer <= 0) c.mood = "bars";
      }
      if (c.sayTimer > 0) {
        c.sayTimer -= dt;
        if (c.sayTimer <= 0) c.say = "";
      }

      c.blinkIn -= dt;
      if (c.blinkIn <= 0) {
        c.blink = 0.12;
        c.blinkIn = rand(2.5, 6);
      }
      if (c.blink > 0) c.blink -= dt;

      if (c.squash > 0) c.squash = Math.max(0, c.squash - dt * 4.2);

      c.theta += (c.thetaTarget - c.theta) * Math.min(1, dt * 10);

      // AIR PHYSICS
      if (c.state === "air") {
        c.liftV -= GRAVITY * dt;
        c.lift += c.liftV * dt;
        c.x += c.vx * dt;
        c.rot += c.rotV * dt;
        c.rotV *= Math.max(0, 1 - dt * 1.5);
        c.vx *= Math.max(0, 1 - dt * 0.45);

        // Ceiling bounce
        if (c.y - c.lift < 25) {
          c.lift = c.y - 25;
          c.liftV = -Math.abs(c.liftV) * 0.65;
        }

        // Wall bounce
        if (c.x < 25) {
          c.x = 25;
          c.vx = Math.abs(c.vx) * 0.7;
          c.rotV = -c.rotV * 0.65;
        } else if (c.x > w - 25) {
          c.x = w - 25;
          c.vx = -Math.abs(c.vx) * 0.7;
          c.rotV = -c.rotV * 0.65;
        }

        // Ground landing
        if (c.lift <= 0) {
          c.lift = 0;
          if (c.liftV < -240) {
            c.liftV = -c.liftV * BOUNCE;
            c.squash = Math.min(1.2, Math.abs(c.liftV) / 750);
            c.rotV *= 0.4;
          } else {
            c.liftV = 0;
            c.rot = 0;
            c.rotV = 0;
            c.state = "idle";
            c.timer = rand(1.2, 3);
            c.entering = false;
            newTarget(c);
          }
        }
        return;
      }

      if (c.state === "held") return;

      // SLEEP
      if (c.state === "sleep") {
        c.zTimer -= dt;
        if (c.zTimer <= 0) {
          zs.push({ x: c.x + 8, y: c.y - (BODY_H + LEG_H) * U - 6, age: 0 });
          c.zTimer = 1.4;
        }
        if (c.timer <= 0) {
          c.state = "idle";
          c.timer = rand(2, 4);
          newTarget(c);
        }
        return;
      }

      // IDLE
      if (c.state === "idle") {
        if (c.timer <= 0) {
          if (c.naps >= 3 && Math.random() < 0.35) {
            c.state = "sleep";
            c.timer = rand(7, 14);
            c.naps = 0;
            c.mood = "sleepy";
          } else {
            c.state = "walk";
            c.timer = rand(2.5, 6);
            c.naps++;
            newTarget(c);
          }
        }
        return;
      }

      // WALK
      if (c.state === "walk") {
        const dx = c.tx - c.x;
        const dy = c.ty - c.y;
        const d = Math.hypot(dx, dy);

        if (d < 10 || c.timer <= 0) {
          c.state = "idle";
          c.timer = rand(1.5, 4);
          // Playful spontaneous hop
          if (Math.random() < 0.28) {
            c.state = "air";
            c.liftV = rand(240, 420);
            c.vx = rand(-80, 80);
          }
          return;
        }

        const stepSpeed = c.speed * dt;
        c.x += (dx / d) * stepSpeed;
        c.y += (dy / d) * stepSpeed;
        c.step += dt * c.speed * 0.12;
        c.thetaTarget = (dx / d) * 0.25;

        // Keep inside bounds
        c.x = clamp(c.x, 25, w - 25);
        c.y = clamp(c.y, c.bandTop, c.bandBottom);
      }
    };

    // Collision separation between critters
    const separate = () => {
      const minDist = (BODY_W * U) / 1.1;
      for (let i = 0; i < critters.length; i++) {
        for (let j = i + 1; j < critters.length; j++) {
          const a = critters[i]!;
          const b = critters[j]!;
          if (a.state === "held" || b.state === "held") continue;
          if (a.lift > 25 || b.lift > 25) continue;
          if (Math.abs(a.y - b.y) > 60) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            if (a.state !== "sleep") {
              a.x -= nx * overlap * 0.45;
              a.y -= ny * overlap * 0.45;
            }
            if (b.state !== "sleep") {
              b.x += nx * overlap * 0.45;
              b.y += ny * overlap * 0.45;
            }
          }
        }
      }
    };

    // Rendering functions
    const drawShadow = (c: Critter) => {
      const hScale = Math.max(0.2, 1 - c.lift / 400);
      const sw = BODY_W * U * 0.9 * hScale;
      const sh = 7 * hScale;
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, sw / 2, sh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const eyeMood = (c: Critter): Mood | "blink" => {
      if (c.blink > 0) return "blink";
      if (c.moodTimer > 0) return c.mood;
      if (c.state === "sleep") return "sleepy";
      return c.mood;
    };

    const draw = (c: Critter, clockSec: number) => {
      const pal = c.palette;
      const sitting = c.state === "sleep";
      const outline = pal.outline;
      const lit = c === hovered || c === activeCritter;

      const cos = Math.cos(c.theta);
      const sin = Math.sin(c.theta);
      const fw = Math.max(3, Math.round(BODY_W * Math.abs(cos)));
      const sw = Math.max(0, Math.round(DEPTH * Math.abs(sin)));
      const fx = -Math.round(fw / 2);
      const sx = sin >= 0 ? fx + fw : fx - sw;
      const x0 = Math.min(fx, sx);
      const total = fw + sw;
      const top = -BODY_H - (sitting ? 0 : LEG_H);

      ctx.save();
      ctx.translate(Math.round(c.x), Math.round(c.y - c.lift));
      if (c.rot) ctx.rotate(c.rot);
      const sq = c.squash * 0.2 + (sitting ? Math.sin(clockSec * 2) * 0.03 : 0);
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
      const cheer = c.mood === "happy" && Math.floor(clockSec * 6) % 2 === 0;
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

      // Eyes
      if (facingFront && fw >= 4) {
        ctx.fillStyle = "#090a18";
        const ey = top + 5;
        const narrow = fw < 9;
        const m = eyeMood(c);
        const near =
          pointer.x > 0 &&
          fw >= 12 &&
          Math.abs(pointer.x - c.x) > 24 &&
          Math.hypot(pointer.x - c.x, pointer.y - c.y) < 260;
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
      const bh = 22;
      const bx = Math.round(clamp(c.x - bw / 2, 10, w - bw - 10));
      const by = Math.round(c.y - c.lift - (BODY_H + LEG_H) * U - bh - 12);
      const a = Math.min(1, c.sayTimer * 3);

      ctx.globalAlpha = a;
      ctx.fillStyle = "#0c0d1e";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1;

      // Stepped pixel bubble container
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

    const drawZs = (dt: number, vTop: number, vBottom: number) => {
      for (let i = zs.length - 1; i >= 0; i--) {
        const z = zs[i]!;
        z.age += dt;
        if (z.age > 2.4) {
          zs.splice(i, 1);
          continue;
        }
        if (z.y < vTop || z.y > vBottom) continue;

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

    const frame = () => {
      if (!isTabVisible) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const now = performance.now();
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      clock += dt;

      // Update all critters
      for (const c of critters) update(c, dt);
      separate();

      // Viewport culling: only render what is in view (plus small buffer)
      const canvasRect = canvas.getBoundingClientRect();
      const scrollYOffset = -canvasRect.top;
      const vTop = Math.max(0, scrollYOffset - 250);
      const vBottom = scrollYOffset + window.innerHeight + 250;

      // Clear the visible viewport region
      ctx.clearRect(0, vTop, w, vBottom - vTop);

      const order = [...critters].sort((a, b) => a.y - b.y);
      for (const c of order) {
        const critterScreenY = c.y - c.lift;
        if (critterScreenY >= vTop - 50 && critterScreenY <= vBottom + 50) {
          drawShadow(c);
          draw(c, clock);
          drawSay(c);
        }
      }
      drawZs(dt, vTop, vBottom);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      last = performance.now();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", resize);

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [count, pathname]);

  if (!state.prefs.game) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 block h-full w-full transition-opacity duration-300 ${
        terminalOpen ? "opacity-0" : "opacity-100"
      }`}
    />
  );
}
