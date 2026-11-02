"use client";

// Pixel-photo background (Forge-style). Renders `src` pixelated by drawing it
// tiny and scaling up with smoothing off. With no `src` it draws a procedural
// dithered dark→emerald field, so the hero looks intentional before a real
// photo exists — drop a /public/hero.webp and pass src to swap it in.
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function PixelPhoto({
  src,
  pixel = 10,
  className,
}: {
  src?: string;
  pixel?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img: HTMLImageElement | null = null;
    let cancelled = false;

    const drawProcedural = (cols: number, rows: number) => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // diagonal gradient void -> dim emerald, + ordered-ish dither + vignette
          const g = (x / cols) * 0.5 + (1 - y / rows) * 0.5;
          const dither = (((x * 7 + y * 13) % 5) - 2) * 0.012;
          const vignette = 1 - Math.hypot(x / cols - 0.5, y / rows - 0.5) * 0.9;
          const t = Math.max(0, Math.min(1, g * 0.5 + dither)) * vignette;
          const r = Math.round(6 + t * 10);
          const gr = Math.round(7 + t * 90);
          const b = Math.round(8 + t * 40);
          ctx.fillStyle = `rgb(${r},${gr},${b})`;
          ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
          // sparse brighter emerald specks
          if ((x * 31 + y * 17) % 97 === 0) {
            ctx.fillStyle = "rgba(22,168,90,0.55)";
            ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
          }
        }
      }
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const cols = Math.ceil(rect.width / pixel) || 1;
      const rows = Math.ceil(rect.height / pixel) || 1;
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.imageRendering = "pixelated";
      ctx.imageSmoothingEnabled = false;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, cols, rows);
      } else {
        // scale the canvas backing store to full px grid for the procedural draw
        canvas.width = cols * pixel;
        canvas.height = rows * pixel;
        drawProcedural(cols, rows);
      }
    };

    if (src) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!cancelled) render();
      };
      img.src = src;
    }
    render();

    const ro = new ResizeObserver(() => render());
    ro.observe(canvas);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src, pixel]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    />
  );
}
