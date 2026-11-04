import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/admin/MemberForm";
import { createServerSupabase } from "@/lib/supabase/server";

async function EditMember({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("team_members")
    .select(
      "id, name, role, department, tier, bio, photo_path, linkedin_url, github_url, instagram_url, sort, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.name}</h1>
      <MemberForm
        member={{
          ...data,
          bio: data.bio ?? "",
          linkedin_url: data.linkedin_url ?? "",
          github_url: data.github_url ?? "",
          instagram_url: data.instagram_url ?? "",
        }}
      />
    </>
  );
}

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="eyebrow">loading member…</p>}>
      <EditMember params={params} />
    </Suspense>
  );
}
