import { Suspense } from "react";
import { ListHeader, ResourceList } from "@/components/admin/ResourceList";
import { createServerSupabase } from "@/lib/supabase/server";

async function Rows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, author_name, status, body_md")
    .order("published_at", { ascending: false, nullsFirst: true });
  if (error) return <p className="text-muted">couldn&apos;t load posts.</p>;
  return (
    <ResourceList
      baseHref="/admin/blog"
      empty="no posts yet. write the first one."
      rows={data.map((row) => ({
        id: row.id,
        title: row.title,
        sub: `${row.author_name}${row.body_md ? "" : " · no article text yet"}`,
        draft: row.status === "draft",
      }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <ListHeader title="blog" newHref="/admin/blog/new" newLabel="add post" />
      <Suspense fallback={<p className="eyebrow">loading…</p>}>
        <Rows />
      </Suspense>
    </>
  );
}
