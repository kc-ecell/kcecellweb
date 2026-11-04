import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { MILESTONE_FIELDS } from "@/lib/admin/resources";
import { deleteMilestone, saveMilestone } from "@/lib/actions/admin/content";
import { createServerSupabase } from "@/lib/supabase/server";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("timeline_milestones")
    .select(
      "id, year_label, level, title, description, badge_icon, sort, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.title}</h1>
      <ResourceForm
        fields={MILESTONE_FIELDS}
        initial={{
          id: data.id,
          year_label: data.year_label,
          level: data.level,
          title: data.title,
          description: data.description,
          on_home: data.badge_icon === "home",
          sort: data.sort,
          status: data.status,
        }}
        backHref="/admin/timeline"
        save={saveMilestone}
        remove={deleteMilestone}
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
