// Dev-only tooling slot. This is the ONLY file allowed to import `agentation`
// (ESLint no-restricted-imports + the check:devtools build guard enforce that).
//
// Agentation is NOT installed yet — the team adds it when ready. Until then this
// slot renders nothing. When installed, follow docs/CONTRIBUTING.md#dev-tools:
//
//   const Agentation = dynamic(
//     () => import("agentation").then((m) => m.Agentation),
//     { ssr: false },
//   );
//
// and render <Agentation endpoint={process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT} />
// below, behind the same NODE_ENV check.
export function DevTools() {
  if (process.env.NODE_ENV !== "development") return null;
  return null;
}
