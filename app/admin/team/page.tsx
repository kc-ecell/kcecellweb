import { Suspense } from "react";
import Link from "next/link";
import { primaryButtonClass } from "@/components/admin/Field";
import { createServerSupabase } from "@/lib/supabase/server";

const DEPARTMENTS = [
  ["faculty", "faculty"],
  ["leadership", "leadership"],
  ["technical", "technical"],
  ["events", "events & operations"],
  ["media", "media & communications"],
] as const;

async function Members() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("team_members")
    .select(
      "id, name, role, department, status, photo_path, team_cohorts!inner(is_current)",
    )
    .eq("team_cohorts.is_current", true)
    .order("sort");

  if (error) return <p className="text-muted">couldn&apos;t load the team.</p>;
  if (data.length === 0) {
    return <p className="text-muted">no members yet. add the first one.</p>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      {DEPARTMENTS.map(([slug, label]) => {
        const members = data.filter((member) => member.department === slug);
        if (members.length === 0) return null;
        return (
          <section key={slug}>
            <h2 className="text-ink-2 mb-2 font-mono text-xs">{label}</h2>
            <ul className="border-line divide-line divide-y border">
              {members.map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/admin/team/${member.id}`}
                    className="hover:bg-surface flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      {member.name}
                      <span className="text-muted block text-xs">
                        {member.role}
                      </span>
                    </span>
                    <span className="text-muted shrink-0 font-mono text-xs">
                      {member.status === "draft" && "draft · "}
                      {member.photo_path ? "" : "no photo · "}edit
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function TeamAdminPage() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="display text-4xl">team</h1>
        <Link href="/admin/team/new" className={primaryButtonClass}>
          add member
        </Link>
      </div>
      <Suspense fallback={<p className="eyebrow">loading team…</p>}>
        <Members />
      </Suspense>
    </>
  );
}
