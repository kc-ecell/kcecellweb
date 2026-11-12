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

export interface PublicPhoto {
  id: string;
  url: string;
  alt: string;
  caption: string;
}

export async function getGallery(): Promise<PublicPhoto[]> {
  "use cache";
  cacheTag("gallery");
  const { data, error } = await createStaticSupabase()
    .from("gallery_photos")
    .select("id, path, alt, caption")
    .order("sort")
    .order("created_at", { ascending: false });
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((photo) => ({
    id: photo.id,
    url: mediaUrl(photo.path),
    alt: photo.alt,
    caption: photo.caption ?? "",
  }));
}

export interface PublicPost {
  slug: string;
  title: string;
  summary: string;
  author: string;
  tag: string;
  date: string;
  body: string;
}

const postDate = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const POST_COLUMNS =
  "slug, title, excerpt, author_name, tags, published_at, body_md";

interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  tags: string[];
  published_at: string | null;
  body_md: string;
}

function toPost(row: PostRow): PublicPost {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.excerpt,
    author: row.author_name,
    tag: row.tags[0] ?? "post",
    date: row.published_at
      ? postDate.format(new Date(row.published_at)).toLowerCase()
      : "",
    body: row.body_md,
  };
}

// Hourly, so scheduled posts appear close to their publish time
export async function getPosts(): Promise<PublicPost[]> {
  "use cache";
  cacheTag("posts");
  const { data, error } = await createStaticSupabase()
    .from("posts")
    .select(POST_COLUMNS)
    .order("published_at", { ascending: false });
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("hours");
  return data.map(toPost);
}

export async function getPost(slug: string): Promise<PublicPost | null> {
  "use cache";
  cacheTag("posts");
  cacheLife("hours");
  const { data } = await createStaticSupabase()
    .from("posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  return data ? toPost(data) : null;
}

export interface ContactSettings {
  email: string;
  address: string;
  reply_time: string;
  instagram: string;
  linkedin: string;
  github: string;
}

export async function getContactSettings(): Promise<ContactSettings> {
  "use cache";
  cacheTag("settings");
  const { data, error } = await createStaticSupabase()
    .from("site_settings")
    .select("key, value")
    .in("key", ["org.contact", "org.socials"]);
  if (error) cacheLife("minutes");
  else cacheLife("max");
  const value = (key: string) =>
    data?.find((row) => row.key === key)?.value ?? {};
  const contact = value("org.contact");
  const socials = value("org.socials");
  return {
    email: contact.email ?? "",
    address: contact.address ?? "",
    reply_time: contact.reply_time ?? "",
    instagram: socials.instagram ?? "",
    linkedin: socials.linkedin ?? "",
    github: socials.github ?? "",
  };
}
