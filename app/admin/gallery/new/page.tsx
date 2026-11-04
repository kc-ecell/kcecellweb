import { ResourceForm } from "@/components/admin/ResourceForm";
import { saveAlbum } from "@/lib/actions/admin/gallery";
import { ALBUM_FIELDS } from "@/lib/admin/resources";

export default function Page() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add album</h1>
      <ResourceForm
        fields={ALBUM_FIELDS}
        initial={{ title: "", slug: "", status: "draft" }}
        backHref="/admin/gallery"
        save={saveAlbum}
      />
    </>
  );
}
