import { ResourceForm } from "@/components/admin/ResourceForm";
import { EVENT_FIELDS } from "@/lib/admin/resources";
import { saveEvent } from "@/lib/actions/admin/content";

export default function Page() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add event</h1>
      <ResourceForm
        fields={EVENT_FIELDS}
        initial={{
          title: "",
          slug: "",
          format: "hackathon",
          edition: "",
          summary: "",
          venue: "",
          starts_at: "",
          ends_at: "",
          attendance: null,
          is_flagship: false,
          status: "draft",
        }}
        backHref="/admin/events"
        save={saveEvent}
      />
    </>
  );
}
