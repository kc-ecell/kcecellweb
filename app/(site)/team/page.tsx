import { TeamGrid } from "@/components/site/TeamGrid";
import { getTeam } from "@/lib/data/public";

export default async function TeamPage() {
  const members = await getTeam();

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">cohort 2026–27 · kccemsr</p>
          <h1 className="display">
            the team<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          {members.length} people across five departments. we run the
          hackathons, manage the code, book the stages, and back the ventures.
        </p>
      </div>

      <TeamGrid members={members} />
    </div>
  );
}
