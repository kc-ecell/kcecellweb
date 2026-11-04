import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { ACHIEVEMENT_FIELDS } from "@/lib/admin/resources";
import {
  deleteAchievement,
  saveAchievement,
} from "@/lib/actions/admin/content";
import { createServerSupabase } from "@/lib/supabase/server";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("achievements")
    .select(
      "id, title, year, category, organizer, result, prize, description, is_highlight, sort, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.title}</h1>
      <ResourceForm
        fields={ACHIEVEMENT_FIELDS}
        initial={{
          ...data,
          organizer: data.organizer ?? "",
          prize: data.prize ?? "",
          description: data.description ?? "",
        }}
        backHref="/admin/achievements"
        save={saveAchievement}
        remove={deleteAchievement}
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
