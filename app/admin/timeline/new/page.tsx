import { ResourceForm } from "@/components/admin/ResourceForm";
import { MILESTONE_FIELDS } from "@/lib/admin/resources";
import { saveMilestone } from "@/lib/actions/admin/content";

export default function Page() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add milestone</h1>
      <ResourceForm
        fields={MILESTONE_FIELDS}
        initial={{
          year_label: "",
          level: 1,
          title: "",
          description: "",
          on_home: false,
          sort: 100,
          status: "draft",
        }}
        backHref="/admin/timeline"
        save={saveMilestone}
      />
    </>
  );
}
