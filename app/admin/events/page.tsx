import { Suspense } from "react";
import { ListHeader, ResourceList } from "@/components/admin/ResourceList";
import { createServerSupabase } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, edition, status")
    .order("starts_at", { ascending: false, nullsFirst: true });
  if (error) return <p className="text-muted">couldn&apos;t load this list.</p>;
  return (
    <ResourceList
      baseHref="/admin/events"
      empty="no events yet. add the first one."
      rows={data.map((row) => ({
        id: row.id,
        title: row.title,
        sub: row.edition ?? "",
        draft: row.status === "draft",
      }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <ListHeader
        title="events"
        newHref="/admin/events/new"
        newLabel="add event"
      />
      <Suspense fallback={<p className="eyebrow">loading…</p>}>
        <Rows />
      </Suspense>
    </>
  );
}
