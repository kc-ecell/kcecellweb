import Link from "next/link";
import { primaryButtonClass } from "@/components/admin/Field";

export function ListHeader({
  title,
  newHref,
  newLabel,
}: {
  title: string;
  newHref: string;
  newLabel: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <h1 className="display text-4xl">{title}</h1>
      <Link href={newHref} className={primaryButtonClass}>
        {newLabel}
      </Link>
    </div>
  );
}

export function ResourceList({
  rows,
  baseHref,
  empty,
}: {
  rows: { id: string; title: string; sub: string; draft: boolean }[];
  baseHref: string;
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="border-line divide-line max-w-3xl divide-y border">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={`${baseHref}/${row.id}`}
            className="hover:bg-surface flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span className="min-w-0">
              {row.title}
              <span className="text-muted block text-xs">{row.sub}</span>
            </span>
            <span className="text-muted shrink-0 font-mono text-xs">
              {row.draft && "draft · "}edit
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
