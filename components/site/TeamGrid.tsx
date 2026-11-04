"use client";

import { useState } from "react";
import { TeamCard } from "@/components/site/TeamCard";
import type { PublicMember } from "@/lib/data/public";

const DEPTS = [
  { id: "all", label: "all builders" },
  { id: "leadership", label: "leadership" },
  { id: "technical", label: "technical" },
  { id: "events", label: "events & ops" },
  { id: "media", label: "media & comms" },
  { id: "faculty", label: "faculty" },
];

export function TeamGrid({ members }: { members: PublicMember[] }) {
  const [activeDept, setActiveDept] = useState("all");
  const filtered =
    activeDept === "all"
      ? members
      : members.filter((member) => member.department === activeDept);

  return (
    <>
      <nav className="filters" aria-label="Filter by department">
        {DEPTS.map((dept) => (
          <button
            key={dept.id}
            type="button"
            onClick={() => setActiveDept(dept.id)}
            aria-current={activeDept === dept.id ? "true" : undefined}
          >
            {dept.label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-muted mt-8">nobody listed here yet.</p>
      ) : (
        <div className="team-grid">
          {filtered.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </>
  );
}
