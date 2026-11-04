import { MemberForm } from "@/components/admin/MemberForm";

export default function NewMemberPage() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">add member</h1>
      <MemberForm
        member={{
          name: "",
          role: "",
          department: "technical",
          tier: "member",
          bio: "",
          photo_path: null,
          linkedin_url: "",
          github_url: "",
          instagram_url: "",
          sort: 100,
          status: "published",
        }}
      />
    </>
  );
}
