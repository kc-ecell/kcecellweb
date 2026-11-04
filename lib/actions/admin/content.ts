"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { type ActionResult, requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const text = (message: string) => z.string().trim().min(1, message);
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);
const optionalNumber = z.number().int().min(0).nullable();
const status = z.enum(["draft", "published"]);
const id = z.uuid().optional();

// datetime-local gives "YYYY-MM-DDTHH:mm" in IST
const istDate = z
  .string()
  .transform((value) => (value ? `${value}:00+05:30` : null));

const EventInput = z.object({
  id,
  title: text("add a title"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes"),
  format: z.enum([
    "hackathon",
    "workshop",
    "talk",
    "competition",
    "bootcamp",
    "networking",
    "gaming",
    "other",
  ]),
  edition: optionalText,
  summary: text("add a summary").max(220, "keep it under 220 characters"),
  venue: optionalText,
  starts_at: istDate,
  ends_at: istDate,
  attendance: optionalNumber,
  is_flagship: z.boolean(),
  status,
});

const AchievementInput = z.object({
  id,
  title: text("add a title"),
  year: z.number().int().min(2016).max(2100),
  category: z.enum([
    "hackathon",
    "entrepreneurship",
    "innovation",
    "award",
    "event",
  ]),
  organizer: optionalText,
  result: text("add the result"),
  prize: optionalText,
  description: optionalText,
  is_highlight: z.boolean(),
  sort: z.number().int().min(0),
  status,
});

const MilestoneInput = z.object({
  id,
  year_label: text("add a year"),
  level: z.number().int(),
  title: text("add a title"),
  description: text("add a description"),
  on_home: z.boolean(),
  sort: z.number().int().min(0),
  status,
});

const PostInput = z.object({
  id,
  title: text("add a title"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes"),
  author_name: text("add an author"),
  tag: z.string().trim(),
  excerpt: text("add an excerpt").max(240, "keep it under 240 characters"),
  body_md: z.string(),
  published_at: istDate,
  status,
});

type Table = "events" | "achievements" | "timeline_milestones" | "posts";

async function persist(
  table: Table,
  tag: string,
  path: string,
  recordId: string | undefined,
  row: Record<string, unknown>,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = recordId
    ? await supabase.from(table).update(row).eq("id", recordId)
    : await supabase.from(table).insert(row);
  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "that slug is already used."
          : error.code === "23514"
            ? "some values aren't allowed. check dates and lengths."
            : "couldn't save. try again.",
    };
  }
  updateTag(tag);
  revalidatePath(path);
  return { ok: true, data: undefined };
}

async function destroy(
  table: Table,
  tag: string,
  path: string,
  recordId: string,
): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(recordId);
  if (!parsed.success) return { ok: false, message: "unknown item." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from(table).delete().eq("id", parsed.data);
  if (error) return { ok: false, message: "couldn't delete. try again." };
  updateTag(tag);
  revalidatePath(path);
  return { ok: true, data: undefined };
}

function invalid(error: z.ZodError): ActionResult {
  return { ok: false, fieldErrors: z.flattenError(error).fieldErrors };
}

export async function saveEvent(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = EventInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id: recordId, ...row } = parsed.data;
  return persist("events", "events", "/admin/events", recordId, row);
}

export async function deleteEvent(recordId: string): Promise<ActionResult> {
  await requireStaff();
  return destroy("events", "events", "/admin/events", recordId);
}

export async function saveAchievement(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = AchievementInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id: recordId, ...row } = parsed.data;

  if (row.is_highlight) {
    const supabase = await createServerSupabase();
    let others = supabase
      .from("achievements")
      .select("id", { count: "exact", head: true })
      .eq("is_highlight", true);
    if (recordId) others = others.neq("id", recordId);
    const { count } = await others;
    if ((count ?? 0) >= 3) {
      return {
        ok: false,
        fieldErrors: { is_highlight: ["3 are highlighted already"] },
      };
    }
  }
  return persist(
    "achievements",
    "achievements",
    "/admin/achievements",
    recordId,
    row,
  );
}

export async function deleteAchievement(
  recordId: string,
): Promise<ActionResult> {
  await requireStaff();
  return destroy(
    "achievements",
    "achievements",
    "/admin/achievements",
    recordId,
  );
}

export async function saveMilestone(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = MilestoneInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id: recordId, on_home: onHome, ...row } = parsed.data;
  // badge_icon is otherwise unused; "home" marks home page milestones
  return persist(
    "timeline_milestones",
    "timeline",
    "/admin/timeline",
    recordId,
    {
      ...row,
      badge_icon: onHome ? "home" : null,
    },
  );
}

export async function deleteMilestone(recordId: string): Promise<ActionResult> {
  await requireStaff();
  return destroy(
    "timeline_milestones",
    "timeline",
    "/admin/timeline",
    recordId,
  );
}

export async function savePost(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = PostInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id: recordId, tag, ...row } = parsed.data;
  return persist("posts", "posts", "/admin/blog", recordId, {
    ...row,
    tags: tag ? [tag] : [],
    published_at:
      row.published_at ??
      (row.status === "published" ? new Date().toISOString() : null),
  });
}

export async function deletePost(recordId: string): Promise<ActionResult> {
  await requireStaff();
  return destroy("posts", "posts", "/admin/blog", recordId);
}
