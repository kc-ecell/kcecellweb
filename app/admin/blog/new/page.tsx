import { ResourceForm } from "@/components/admin/ResourceForm";
import { savePost } from "@/lib/actions/admin/content";
import { POST_FIELDS } from "@/lib/admin/resources";

export default function Page() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add post</h1>
      <ResourceForm
        fields={POST_FIELDS}
        initial={{
          title: "",
          slug: "",
          author_name: "",
          tag: "",
          excerpt: "",
          body_md: "",
          published_at: "",
          status: "draft",
        }}
        backHref="/admin/blog"
        save={savePost}
      />
    </>
  );
}
