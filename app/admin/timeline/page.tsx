import { Suspense } from "react";
import { ListHeader, ResourceList } from "@/components/admin/ResourceList";
import { createServerSupabase } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("timeline_milestones")
    .select("id, year_label, title, status")
    .order("sort");
  if (error) return <p className="text-muted">couldn&apos;t load this list.</p>;
  return (
    <ResourceList
      baseHref="/admin/timeline"
      empty="no milestones yet. add the first one."
      rows={data.map((row) => ({
        id: row.id,
        title: row.title,
        sub: row.year_label,
        draft: row.status === "draft",
      }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <ListHeader
        title="timeline"
        newHref="/admin/timeline/new"
        newLabel="add milestone"
      />
      <Suspense fallback={<p className="eyebrow">loading…</p>}>
        <Rows />
      </Suspense>
    </>
  );
}
