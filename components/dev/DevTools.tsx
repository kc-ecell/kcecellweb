"use client";

import dynamic from "next/dynamic";

// Dev-only tooling slot. This is the ONLY file allowed to import `agentation`
// (ESLint no-restricted-imports + the check:devtools build guard enforce that).
const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation),
  { ssr: false },
);

export function DevTools() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation endpoint={process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT} />;
}
