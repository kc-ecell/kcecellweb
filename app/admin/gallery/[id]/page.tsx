import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { deleteAlbum, saveAlbum } from "@/lib/actions/admin/gallery";
import { ALBUM_FIELDS } from "@/lib/admin/resources";
import { mediaUrl } from "@/lib/media";
import { createServerSupabase } from "@/lib/supabase/server";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("gallery_albums")
    .select("id, title, slug, status")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, path, alt, caption")
    .eq("album_id", id)
    .order("sort");

  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.title}</h1>
      <ResourceForm
        fields={ALBUM_FIELDS}
        initial={data}
        backHref="/admin/gallery"
        save={saveAlbum}
        remove={deleteAlbum}
      />
      <PhotoManager
        albumId={data.id}
        photos={(photos ?? []).map((photo) => ({
          id: photo.id,
          url: mediaUrl(photo.path),
          alt: photo.alt,
          caption: photo.caption ?? "",
        }))}
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
