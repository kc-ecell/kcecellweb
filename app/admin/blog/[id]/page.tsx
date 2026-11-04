import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { deletePost, savePost } from "@/lib/actions/admin/content";
import { POST_FIELDS, toIstInput } from "@/lib/admin/resources";
import { createServerSupabase } from "@/lib/supabase/server";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, slug, author_name, tags, excerpt, body_md, published_at, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const { tags, ...post } = data;
  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.title}</h1>
      <ResourceForm
        fields={POST_FIELDS}
        initial={{
          ...post,
          tag: tags[0] ?? "",
          published_at: toIstInput(data.published_at),
        }}
        backHref="/admin/blog"
        save={savePost}
        remove={deletePost}
      />
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="eyebrow">loading…</p>}>
      <Edit params={params} />
    </Suspense>
  );
}
