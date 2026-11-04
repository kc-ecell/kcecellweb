import { ResourceForm } from "@/components/admin/ResourceForm";
import { ACHIEVEMENT_FIELDS } from "@/lib/admin/resources";
import { saveAchievement } from "@/lib/actions/admin/content";

export default function Page() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add achievement</h1>
      <ResourceForm
        fields={ACHIEVEMENT_FIELDS}
        initial={{
          title: "",
          year: 2026,
          category: "hackathon",
          organizer: "",
          result: "",
          prize: "",
          description: "",
          is_highlight: false,
          sort: 100,
          status: "draft",
        }}
        backHref="/admin/achievements"
        save={saveAchievement}
      />
    </>
  );
}
