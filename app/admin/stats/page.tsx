import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StatForm } from "@/components/admin/StatForm";
import { requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

async function Stats() {
  await requireStaff(["owner", "admin"]).catch(() => notFound());
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("stats")
    .select("slug, label, value, suffix, source, verified_on")
    .order("sort");

  if (error) return <p className="text-muted">couldn&apos;t load stats.</p>;
  if (data.length === 0) return <p className="text-muted">no stats yet.</p>;

  return (
    <div className="max-w-4xl space-y-4">
      {data.map((stat) => (
        <StatForm key={stat.slug} stat={stat} />
      ))}
    </div>
  );
}

export default function StatsPage() {
  return (
    <>
      <h1 className="display mb-2 text-4xl">stats</h1>
      <p className="text-ink-2 mb-8 text-sm">
        changing a number needs a newer verified date, so the site stays honest.
      </p>
      <Suspense fallback={<p className="eyebrow">loading stats…</p>}>
        <Stats />
      </Suspense>
    </>
  );
}
