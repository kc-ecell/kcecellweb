import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const when = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

async function Log() {
  await requireStaff(["owner", "admin"]).catch(() => notFound());
  const supabase = await createServerSupabase();
  const [{ data, error }, { data: people }] = await Promise.all([
    supabase
      .from("audit_log")
      .select("id, actor_id, action, table_name, record_id, diff, at")
      .order("at", { ascending: false })
      .limit(100),
    supabase.from("profiles").select("id, display_name"),
  ]);
  if (error) return <p className="text-muted">couldn&apos;t load the log.</p>;
  if (data.length === 0) return <p className="text-muted">no changes yet.</p>;

  const names = new Map(
    (people ?? []).map((person) => [person.id, person.display_name]),
  );

  return (
    <ul className="border-line divide-line max-w-4xl divide-y border">
      {data.map((entry) => (
        <li key={entry.id} className="px-4 py-3 text-sm">
          <details>
            <summary className="cursor-pointer">
              {names.get(entry.actor_id) ?? "system"} ·{" "}
              {entry.action.toLowerCase()} · {entry.table_name}
              <span className="text-muted ml-2 font-mono text-xs">
                {when.format(new Date(entry.at))}
              </span>
            </summary>
            <pre className="bg-sunk text-ink-2 mt-3 overflow-x-auto p-3 font-mono text-xs">
              {JSON.stringify(entry.diff, null, 2)}
            </pre>
          </details>
        </li>
      ))}
    </ul>
  );
}

export default function AuditPage() {
  return (
    <>
      <h1 className="display mb-2 text-4xl">audit log</h1>
      <p className="text-ink-2 mb-8 text-sm">the last 100 changes.</p>
      <Suspense fallback={<p className="eyebrow">loading log…</p>}>
        <Log />
      </Suspense>
    </>
  );
}
