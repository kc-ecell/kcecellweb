import { Suspense } from "react";
import { ListHeader, ResourceList } from "@/components/admin/ResourceList";
import { createServerSupabase } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("gallery_albums")
    .select(
      "id, title, status, gallery_photos!gallery_photos_album_id_fkey(count)",
    )
    .order("created_at", { ascending: false });
  if (error) return <p className="text-muted">couldn&apos;t load albums.</p>;
  return (
    <ResourceList
      baseHref="/admin/gallery"
      empty="no albums yet. add the first one."
      rows={data.map((row) => ({
        id: row.id,
        title: row.title,
        sub: `${row.gallery_photos[0]?.count ?? 0} photos`,
        draft: row.status === "draft",
      }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <ListHeader
        title="gallery"
        newHref="/admin/gallery/new"
        newLabel="add album"
      />
      <Suspense fallback={<p className="eyebrow">loading…</p>}>
        <Rows />
      </Suspense>
    </>
  );
}
