"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { type ActionResult, requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const optionalUrl = z
  .union([z.url("use a full link starting with https://"), z.literal("")])
  .transform((value) => value || null);

const MemberInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "add a name"),
  role: z.string().trim().min(2, "add a role"),
  department: z.enum(["faculty", "leadership", "technical", "events", "media"]),
  tier: z.enum(["faculty", "leadership", "head", "cohead", "member"]),
  bio: z.string().trim().max(160, "keep it under 160 characters"),
  photo_path: z.string().nullable(),
  linkedin_url: optionalUrl,
  github_url: optionalUrl,
  instagram_url: optionalUrl,
  sort: z.number().int().min(0),
  status: z.enum(["draft", "published"]),
});

export async function saveMember(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = MemberInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { id, ...row } = parsed.data;
  const supabase = await createServerSupabase();

  if (id) {
    const { error } = await supabase
      .from("team_members")
      .update(row)
      .eq("id", id);
    if (error) return { ok: false, message: "couldn't save. try again." };
  } else {
    const { data: cohort } = await supabase
      .from("team_cohorts")
      .select("id")
      .eq("is_current", true)
      .single();
    if (!cohort) return { ok: false, message: "no current cohort is set." };
    const { error } = await supabase
      .from("team_members")
      .insert({ ...row, cohort_id: cohort.id });
    if (error) return { ok: false, message: "couldn't save. try again." };
  }

  updateTag("team");
  revalidatePath("/admin/team");
  return { ok: true, data: undefined };
}

export async function deleteMember(id: string): Promise<ActionResult> {
  await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "unknown member." };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", parsed.data);
  if (error) return { ok: false, message: "couldn't delete. try again." };

  updateTag("team");
  revalidatePath("/admin/team");
  return { ok: true, data: undefined };
}
