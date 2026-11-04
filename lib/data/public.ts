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

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  format: string;
  summary: string;
  venue: string;
  dateLabel: string;
  upcoming: boolean;
  tagClass: string;
}

const EVENT_TAGS: Record<string, string> = {
  hackathon: "t-hackathon",
  competition: "t-competition",
};

export async function getEvents(): Promise<PublicEvent[]> {
  "use cache";
  cacheTag("events");
  const { data, error } = await createStaticSupabase()
    .from("events")
    .select("id, slug, title, format, summary, venue, edition, starts_at")
    .order("starts_at", { ascending: false, nullsFirst: true })
    .order("title", { ascending: false });
  if (error) {
    cacheLife("minutes");
    return [];
  }
  // "upcoming" depends on today, so this refreshes daily
  cacheLife("days");
  const now = Date.now();
  return data.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    format: event.format,
    summary: event.summary,
    venue: event.venue ?? "",
    dateLabel: event.edition ?? "",
    upcoming: !event.starts_at || new Date(event.starts_at).getTime() > now,
    tagClass: EVENT_TAGS[event.format] ?? "t-workshop",
  }));
}

export interface PublicAchievement {
  id: string;
  year: number;
  title: string;
  organizer: string | null;
  result: string;
  description: string;
  tagClass: string;
}

export async function getAchievements(): Promise<PublicAchievement[]> {
  "use cache";
  cacheTag("achievements");
  const { data, error } = await createStaticSupabase()
    .from("achievements")
    .select("id, year, title, organizer, result, description")
    .order("sort");
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((win) => ({
    ...win,
    description: win.description ?? "",
    tagClass: /1st|2nd|winner/i.test(win.result) ? "t-winner" : "t-competition",
  }));
}

export interface PublicMilestone {
  id: string;
  year: string;
  level: number;
  title: string;
  description: string;
  onHome: boolean;
}

export async function getTimeline(): Promise<PublicMilestone[]> {
  "use cache";
  cacheTag("timeline");
  const { data, error } = await createStaticSupabase()
    .from("timeline_milestones")
    .select("id, year_label, level, title, description, badge_icon")
    .order("sort");
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((milestone) => ({
    id: milestone.id,
    year: milestone.year_label,
    level: milestone.level,
    title: milestone.title,
    description: milestone.description,
    onHome: milestone.badge_icon === "home",
  }));
}
