"use client";

import { useEffect, useRef } from "react";

export function MatrixRain({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const chars = "ECEL0123456789KCCEMSRTHANEABCDEFGHIJKLMNOPQRSTUVWXYZλπψω";
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * -50),
    );

    const draw = () => {
      ctx.fillStyle = "rgba(6, 7, 8, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#10b981";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)] ?? "0";
        const x = i * fontSize;
        const y = (drops[i] ?? 0) * fontSize;

        // Leading char is white
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, x, y);
        ctx.fillStyle = "#10b981";

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          const current = drops[i] ?? 0;
          drops[i] = current + 1;
        }
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const timeout = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="animate-in fade-in pointer-events-none fixed inset-0 z-[100] bg-black/90 duration-300">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
