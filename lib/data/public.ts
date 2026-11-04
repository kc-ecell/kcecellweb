import { cacheLife, cacheTag } from "next/cache";
import { grayscalePath, mediaUrl } from "@/lib/media";
import { createStaticSupabase } from "@/lib/supabase/static";

export interface PublicStat {
  slug: string;
  label: string;
  display: string;
}

export interface PublicMember {
  id: string;
  name: string;
  role: string;
  department: string;
  tier: string;
  bio: string;
  photo: string | null;
  photoBw: string | null;
}

// A failed read is only cached briefly, so the site recovers by itself.
export async function getStats(): Promise<PublicStat[]> {
  "use cache";
  cacheTag("stats");
  const { data, error } = await createStaticSupabase()
    .from("stats")
    .select("slug, label, value, suffix")
    .order("sort");
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((stat) => ({
    slug: stat.slug,
    label: stat.label.toLowerCase(),
    display: `${stat.value}${stat.suffix}`,
  }));
}

export async function getTeam(): Promise<PublicMember[]> {
  "use cache";
  cacheTag("team");
  const { data, error } = await createStaticSupabase()
    .from("team_members")
    .select(
      "id, name, role, department, tier, bio, photo_path, team_cohorts!inner(is_current)",
    )
    .eq("team_cohorts.is_current", true)
    .order("sort");
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    department: member.department,
    tier: member.tier,
    bio: member.bio ?? "",
    photo: member.photo_path ? mediaUrl(member.photo_path) : null,
    photoBw: member.photo_path
      ? mediaUrl(grayscalePath(member.photo_path))
      : null,
  }));
}
