import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { EVENT_FIELDS, toIstInput } from "@/lib/admin/resources";
import { deleteEvent, saveEvent } from "@/lib/actions/admin/content";
import { createServerSupabase } from "@/lib/supabase/server";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("events")
    .select(
      "id, title, slug, format, edition, summary, venue, starts_at, ends_at, attendance, is_flagship, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="display mb-8 text-4xl">{data.title}</h1>
      <ResourceForm
        fields={EVENT_FIELDS}
        initial={{
          ...data,
          edition: data.edition ?? "",
          venue: data.venue ?? "",
          starts_at: toIstInput(data.starts_at),
          ends_at: toIstInput(data.ends_at),
        }}
        backHref="/admin/events"
        save={saveEvent}
        remove={deleteEvent}
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
