"use client";

// Motion tier engine. See docs/ANIMATIONS.md §0 and docs/ARCHITECTURE.md §6.
// Tiers: full | lite | off. prefers-reduced-motion always forces `off`.
// Override for QA with ?motion=full|lite|off (persisted to sessionStorage).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MotionTier = "full" | "lite" | "off";

type MotionContextValue = {
  tier: MotionTier;
  /** Manual override (e.g. the XP drawer motion toggle). null clears it. */
  setOverride: (tier: MotionTier | null) => void;
};

const MotionContext = createContext<MotionContextValue>({
  tier: "full",
  setOverride: () => {},
});

const OVERRIDE_KEY = "ecell:motion:override";

function readStoredOverride(): MotionTier | null {
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("motion");
    if (q === "full" || q === "lite" || q === "off") {
      sessionStorage.setItem(OVERRIDE_KEY, q);
      return q;
    }
    const stored = sessionStorage.getItem(OVERRIDE_KEY);
    if (stored === "full" || stored === "lite" || stored === "off")
      return stored;
  } catch {
    // sessionStorage unavailable (private mode) — fall through
  }
  return null;
}

function detectTier(): MotionTier {
  if (typeof window === "undefined") return "full";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return "off";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  const lowMemory =
    typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  const lowCores =
    typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4;
  const saveData = nav.connection?.saveData === true;

  const smallCoarse =
    window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 768;

  if (lowMemory || lowCores || saveData || smallCoarse) return "lite";

  // Last on purpose: creating a context blocks the main thread for ~180ms on a
  // throttled phone, so it only runs when nothing cheaper has decided the tier.
  try {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2")) return "lite";
  } catch {
    return "lite";
  }
  return "full";
}

export function MotionProvider({ children }: { children: ReactNode }) {
  // SSR renders with `full`; the real tier is resolved on mount. Components
  // that animate read the tier inside effects, so this never causes a flash.
  const [tier, setTier] = useState<MotionTier>("full");

  useEffect(() => {
    const resolve = () => setTier(readStoredOverride() ?? detectTier());
    resolve();

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", resolve);
    return () => mql.removeEventListener("change", resolve);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = tier;
  }, [tier]);

  const value = useMemo<MotionContextValue>(
    () => ({
      tier,
      setOverride: (next) => {
        try {
          if (next) sessionStorage.setItem(OVERRIDE_KEY, next);
          else sessionStorage.removeItem(OVERRIDE_KEY);
        } catch {
          // ignore storage failures
        }
        setTier(next ?? detectTier());
      },
    }),
    [tier],
  );

  return <MotionContext value={value}>{children}</MotionContext>;
}

export function useMotionTier(): MotionTier {
  return useContext(MotionContext).tier;
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
