import Image from "next/image";
import type { PublicMember } from "@/lib/data/public";

export function TeamCard({ member }: { member: PublicMember }) {
  return (
    <div className="team-card">
      <div className="team-photo-wrap">
        {member.photo ? (
          <>
            <Image
              src={member.photo}
              alt={member.name}
              width={340}
              height={340}
              className="team-photo-color"
            />
            {member.photoBw && (
              <Image
                src={member.photoBw}
                alt=""
                aria-hidden="true"
                width={340}
                height={340}
                className="team-photo-bw"
              />
            )}
          </>
        ) : (
          <div className="bg-sunk text-muted flex h-full w-full items-center justify-center text-2xl font-light">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
        )}
      </div>
      <div className="team-info">
        <h4>{member.name}</h4>
        <span className="role">{member.role}</span>
        <p className="bio">{member.bio}</p>
      </div>
    </div>
  );
}
