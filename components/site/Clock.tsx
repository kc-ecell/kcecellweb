"use client";

import { useEffect, useState } from "react";

const fmt = () =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(new Date());

// Live IST clock. Starts as a placeholder to avoid a hydration mismatch; the
// first real value is set off a rAF (not synchronously in the effect).
export function Clock({ className }: { className?: string }) {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTime(fmt()));
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return (
    <span className={className}>
      <span className="tabular-nums">{time}</span> ist
    </span>
  );
}
