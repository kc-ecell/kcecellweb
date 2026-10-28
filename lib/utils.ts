/** Join truthy class names. Upgrade to clsx + tailwind-merge in Phase 2 when
 *  the admin (shadcn) needs conflict resolution; a plain join is enough here. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
