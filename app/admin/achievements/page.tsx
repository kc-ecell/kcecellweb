import { Suspense } from "react";
import { ListHeader, ResourceList } from "@/components/admin/ResourceList";
import { createServerSupabase } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("achievements")
    .select("id, title, year, result, status")
    .order("sort");
  if (error) return <p className="text-muted">couldn&apos;t load this list.</p>;
  return (
    <ResourceList
      baseHref="/admin/achievements"
      empty="no achievements yet. add the first one."
      rows={data.map((row) => ({
        id: row.id,
        title: row.title,
        sub: `${row.year} · ${row.result}`,
        draft: row.status === "draft",
      }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <ListHeader
        title="achievements"
        newHref="/admin/achievements/new"
        newLabel="add achievement"
      />
      <Suspense fallback={<p className="eyebrow">loading…</p>}>
        <Rows />
      </Suspense>
    </>
  );
}
