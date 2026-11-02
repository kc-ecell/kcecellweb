"use client";

import { useEffect, useRef } from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";

const CREAM_BG = "#edece6";
const DARK_BG = "#090a1a";

// Text sequences for the concentric celestial dome arcs
const ARC_TEXTS = [
  "THE ENTREPRENEURSHIP CELL · KCCEMSR · THANE · IDEAS IN · STARTUPS OUT · VENTURE FORTH · INNOVATE · BUILD · ",
  "VENTURE FORTH · INNOVATE · BUILD · SCALE · DISRUPT · KCCEMSR · THE ENTREPRENEURSHIP CELL · 2026 · ",
  "THE ENTREPRENEURSHIP CELL · KCCEMSR · THANE · BUIDL · SHIP · SCALE · FOUNDER XP · VENTURES · ",
  "IDEAS IN · STARTUPS OUT · HACKATHONS · INCUBATION · SEED GRANTS · KCCEMSR THANE · BUILDERS · ",
  "THE ENTREPRENEURSHIP CELL · INNOVATE · EXECUTE · DISRUPT · LAUNCH · KCCEMSR · 2026–2027 · ",
  "VENTURE CAPITAL · HARDWARE LABS · AI AGENTS · CYBERSECURITY · WEB3 · FOUNDERS · THANE · ",
  "THE ENTREPRENEURSHIP CELL · KCCEMSR · THANE · ARCHITECTURE · RUNTIME · KERNEL · ",
];

// ASCII matrix tokens & inverted badges matching reference layout
interface MatrixToken {
  col: number;
  row: number;
  text: string;
  inverted?: boolean;
  highlight?: boolean;
}

const STATIC_TOKENS: MatrixToken[] = [
  // Upper rows (dark zone)
  { col: 14, row: 0, text: "AT" },
  { col: 17, row: 0, text: "·" },
  { col: 19, row: 0, text: "D" },
  { col: 22, row: 0, text: "E" },
  { col: 25, row: 0, text: "ID" },
  { col: 30, row: 0, text: "HROA" },

  { col: 12, row: 1, text: "S" },
  { col: 15, row: 1, text: "D" },
  { col: 18, row: 1, text: "E" },
  { col: 21, row: 1, text: "0" },
  { col: 24, row: 1, text: "NTHNTE" },
  { col: 29, row: 1, text: "T" },
  { col: 31, row: 1, text: "EXT" },
  { col: 35, row: 1, text: "E" },
  { col: 37, row: 1, text: "H" },

  { col: 13, row: 2, text: "IS" },
  { col: 16, row: 2, text: "D" },
  { col: 20, row: 2, text: "KC" },
  { col: 27, row: 2, text: "·" },
  { col: 32, row: 2, text: "AI" },

  { col: 11, row: 3, text: "I" },
  { col: 13, row: 3, text: "SA" },
  { col: 16, row: 3, text: "·" },
  { col: 18, row: 3, text: "6" },
  { col: 20, row: 3, text: "T" },
  { col: 22, row: 3, text: "T" },
  { col: 24, row: 3, text: "GCT" },
  { col: 27, row: 3, text: ".AGE" },
  { col: 31, row: 3, text: "S.MD" },
  { col: 36, row: 3, text: "RG" },
  { col: 39, row: 3, text: "S" },
  { col: 41, row: 3, text: "-" },
  { col: 43, row: 3, text: "RH" },
  { col: 46, row: 3, text: "SEL:" },
  { col: 50, row: 3, text: "H" },

  // Mid-transition rows (where black background fades to cream)
  { col: 3, row: 4, text: "N·T" },
  { col: 7, row: 4, text: "S", inverted: true },
  { col: 12, row: 4, text: "T" },
  { col: 14, row: 4, text: "EGEN" },
  { col: 19, row: 4, text: "N" },
  { col: 21, row: 4, text: "ASTXO" },
  { col: 27, row: 4, text: "." },
  { col: 29, row: 4, text: "X" },
  { col: 31, row: 4, text: "V" },
  { col: 35, row: 4, text: "AT" },
  { col: 38, row: 4, text: "AGENT" },
  { col: 44, row: 4, text: "DE" },
  { col: 49, row: 4, text: "LOAD", inverted: true },

  { col: 2, row: 5, text: "ER" },
  { col: 6, row: 5, text: "7AS", inverted: true },
  { col: 9, row: 5, text: "RO" },
  { col: 11, row: 5, text: "7.X" },
  { col: 16, row: 5, text: "·" },
  { col: 18, row: 5, text: "BADEDT" },
  { col: 24, row: 5, text: "BAGEN" },
  { col: 29, row: 5, text: "B" },
  { col: 31, row: 5, text: "WAELE", inverted: true },
  { col: 37, row: 5, text: "H" },
  { col: 39, row: 5, text: "A", inverted: true },
  { col: 47, row: 5, text: "DRIFT" },
  { col: 51, row: 5, text: "7.XT" },

  { col: 1, row: 6, text: "S", inverted: true },
  { col: 4, row: 6, text: "PUBLIS" },
  { col: 10, row: 6, text: "A" },
  { col: 13, row: 6, text: "AOENE::SH", inverted: true },
  { col: 20, row: 6, text: "A" },
  { col: 23, row: 6, text: "█", inverted: true },
  { col: 27, row: 6, text: "T:0" },
  { col: 31, row: 6, text: "TL" },
  { col: 34, row: 6, text: "·" },
  { col: 36, row: 6, text: "TXT" },
  { col: 40, row: 6, text: "T" },
  { col: 42, row: 6, text: "BKILL", inverted: true },
  { col: 48, row: 6, text: "PO", inverted: true },
  { col: 51, row: 6, text: "BL", inverted: true },
  { col: 54, row: 6, text: "RA" },

  // Lower rows (cream zone, high contrast ink characters & black tiles)
  { col: 2, row: 7, text: "CGE" },
  { col: 8, row: 7, text: "ALIDHT", inverted: true },
  { col: 14, row: 7, text: "CONTEE", inverted: true },
  { col: 21, row: 7, text: "ARURIMECTUR" },
  { col: 31, row: 7, text: "M" },
  { col: 38, row: 7, text: "LO", inverted: true },
  { col: 41, row: 7, text: "ENT", inverted: true },
  { col: 45, row: 7, text: "RG" },
  { col: 48, row: 7, text: "ST-", inverted: true },
  { col: 52, row: 7, text: "R" },
  { col: 55, row: 7, text: "XT" },

  { col: 1, row: 8, text: "D" },
  { col: 6, row: 8, text: "R" },
  { col: 10, row: 8, text: "ER" },
  { col: 17, row: 8, text: "NTY" },
  { col: 20, row: 8, text: "NET" },
  { col: 24, row: 8, text: "·" },
  { col: 29, row: 8, text: "TY" },
  { col: 32, row: 8, text: "E" },
  { col: 34, row: 8, text: "E" },
  { col: 39, row: 8, text: "1" },
  { col: 44, row: 8, text: "CTTONE" },
  { col: 50, row: 8, text: "XT" },
  { col: 54, row: 8, text: "6" },
  { col: 56, row: 8, text: "TR" },
  { col: 59, row: 8, text: "A" },
  { col: 61, row: 8, text: "LE" },
  { col: 64, row: 8, text: "TEXT" },
  { col: 69, row: 8, text: "D" },

  { col: 4, row: 9, text: "L" },
  { col: 13, row: 9, text: "E" },
  { col: 16, row: 9, text: "EXT" },
  { col: 28, row: 9, text: "X" },
  { col: 37, row: 9, text: "0" },
  { col: 41, row: 9, text: ".X" },
  { col: 47, row: 9, text: "S" },
  { col: 52, row: 9, text: ": L" },
  { col: 57, row: 9, text: "ER" },
  { col: 63, row: 9, text: "ORI" },

  { col: 6, row: 10, text: "E" },
  { col: 8, row: 10, text: "L" },
  { col: 27, row: 10, text: "T" },
  { col: 42, row: 10, text: "A" },
  { col: 44, row: 10, text: "C" },
  { col: 48, row: 10, text: "AI" },
  { col: 51, row: 10, text: "T" },
  { col: 57, row: 10, text: "RO" },
  { col: 62, row: 10, text: "DOE" },

  // Dissolving sparse bottom rows
  { col: 12, row: 11, text: "X" },
  { col: 26, row: 11, text: "0" },
  { col: 46, row: 11, text: "IO" },
  { col: 53, row: 11, text: "GE" },
  { col: 64, row: 11, text: "A" },
  { col: 68, row: 11, text: "P", inverted: true },
];

export function TypographicDome() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useMotionTier();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = false;

    // Track rotation offsets for each arc
    const arcOffsets = ARC_TEXTS.map((_, i) =>
      i % 2 === 0 ? 0.05 * i : -0.05 * i,
    );
    const arcSpeeds = ARC_TEXTS.map((_, i) =>
      i % 2 === 0 ? 0.00015 : -0.00018,
    );

    // Mouse interactive coordinates (scoped to canvas only)
    let mouseX = -1000;
    let mouseY = -1000;
    let hoverActive = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      hoverActive = true;
      if (!animId && !isVisible) {
        draw();
      }
    };

    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      hoverActive = false;
    };

    canvas.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    canvas.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      if (width === 0) return;
      // Height responds to width (500px on desktop, 420px on mobile)
      height = width < 640 ? 440 : width < 1024 ? 520 : 580;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.save();

      // 1. Draw smooth gradient background: Dark Midnight -> Cream
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, DARK_BG);
      bgGrad.addColorStop(0.3, DARK_BG);
      bgGrad.addColorStop(0.58, "#636466");
      bgGrad.addColorStop(0.72, "#bfbcb3");
      bgGrad.addColorStop(0.88, CREAM_BG);
      bgGrad.addColorStop(1, CREAM_BG);

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Concentric Celestial Dome Arcs
      const cx = width / 2;
      const cy = height * 1.15;
      const baseR = Math.max(width * 0.48, 540);
      const isMobile = width < 640;
      const ringSpacing = isMobile ? 36 : 44;
      // Display fewer rings on small mobile screens to stay crisp and fast
      const activeRings = isMobile ? ARC_TEXTS.slice(0, 5) : ARC_TEXTS;

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      activeRings.forEach((text, ringIdx) => {
        const radius = baseR + ringIdx * ringSpacing;
        const offset = arcOffsets[ringIdx] ?? 0;
        const fontSize = isMobile ? 11 : 13;
        ctx.font = `600 ${fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

        const circumference = 2 * Math.PI * radius;
        const charSpacing = fontSize * 1.05;
        const totalChars = Math.floor(circumference / charSpacing);
        const repeatText = text.repeat(Math.ceil(totalChars / text.length));

        // Draw visible arc segment from -58 deg to +58 deg
        const maxAngle = Math.PI * 0.32;
        const stepAngle = (2 * Math.PI) / totalChars;

        for (let i = 0; i < totalChars; i++) {
          const angle = -Math.PI / 2 + (i * stepAngle + offset);
          const normAngle = ((angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

          // Only draw if within viewing aperture
          if (Math.abs(normAngle + Math.PI / 2) > maxAngle) continue;

          const charX = cx + Math.cos(angle) * radius;
          const charY = cy + Math.sin(angle) * radius;

          // Skip if completely out of bounds
          if (
            charX < -30 ||
            charX > width + 30 ||
            charY < -20 ||
            charY > height
          )
            continue;

          // Color calculation based on Y position (transitioning to ink when entering cream zone)
          const yNorm = charY / height;
          if (yNorm < 0.45) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
          } else if (yNorm < 0.65) {
            ctx.fillStyle = "rgba(220, 220, 225, 0.75)";
          } else {
            ctx.fillStyle = "rgba(17, 18, 22, 0.85)";
          }

          ctx.save();
          ctx.translate(charX, charY);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillText(repeatText[i % repeatText.length] ?? "", 0, 0);
          ctx.restore();
        }
      });

      // 3. Draw ASCII Matrix Dispersion Field
      const gridTotalCols = isMobile ? 48 : 72;
      const colWidth = Math.max(12, width / gridTotalCols);
      const rowHeight = isMobile ? 18 : 22;
      const startY = height * 0.42;

      STATIC_TOKENS.forEach((token) => {
        const cellX = (token.col + 0.5) * colWidth;
        const cellY = startY + token.row * rowHeight;

        if (cellX < 10 || cellX > width - 10 || cellY > height - 10) return;

        const yRatio = cellY / height;
        const isCreamGround = yRatio > 0.65;
        const dist = Math.hypot(cellX - mouseX, cellY - mouseY);
        const isHovered = hoverActive && dist < 100;

        ctx.font = `600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

        if (token.inverted) {
          const textMetrics = ctx.measureText(token.text);
          const boxPadding = 4;
          const boxWidth = textMetrics.width + boxPadding * 2;
          const boxHeight = 15;

          const boxX = cellX - boxWidth / 2;
          const boxY = cellY - boxHeight / 2;

          ctx.fillStyle = isCreamGround
            ? "#111216"
            : isHovered
              ? "#ffffff"
              : "#0d0e14";
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

          ctx.fillStyle = isCreamGround ? "#ffffff" : "#ffffff";
          ctx.fillText(token.text, cellX, cellY);
        } else {
          if (isHovered) {
            ctx.fillStyle = isCreamGround ? "#e11d48" : "#fbbf24";
          } else if (isCreamGround) {
            ctx.fillStyle = "rgba(17, 18, 22, 0.88)";
          } else if (yRatio > 0.52) {
            ctx.fillStyle = "rgba(230, 230, 235, 0.85)";
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          }

          ctx.fillText(token.text, cellX, cellY);
        }
      });

      ctx.restore();
    };

    const loop = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      draw();

      if (tier === "full") {
        for (let i = 0; i < arcOffsets.length; i++) {
          const currentOffset = arcOffsets[i] ?? 0;
          const currentSpeed = arcSpeeds[i] ?? 0;
          arcOffsets[i] = currentOffset + currentSpeed;
        }
        animId = requestAnimationFrame(loop);
      } else {
        animId = 0;
      }
    };

    const startLoop = () => {
      if (animId) return;
      animId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    // IntersectionObserver: PAUSE completely when off-screen!
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(container);

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [tier]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: DARK_BG,
        minHeight: "440px",
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
