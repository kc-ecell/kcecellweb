"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { type ActionResult, requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const StatInput = z.object({
  slug: z.string().min(1),
  label: z.string().trim().min(1, "add a label"),
  value: z.number().int().min(0, "can't be negative"),
  suffix: z.string().trim().max(8),
  source: z.string().trim().min(3, "say where this number comes from"),
  verified_on: z.iso.date("pick a date"),
});

export async function updateStat(input: unknown): Promise<ActionResult> {
  await requireStaff(["owner", "admin"]);
  const parsed = StatInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { slug, ...row } = parsed.data;
  const supabase = await createServerSupabase();
  const { data: current, error: readError } = await supabase
    .from("stats")
    .select("value, verified_on")
    .eq("slug", slug)
    .single();
  if (readError) return { ok: false, message: "couldn't find this stat." };

  // A changed number must be re-verified. See docs/ADMIN_PANEL.md §3.9.
  if (row.value !== current.value && row.verified_on <= current.verified_on) {
    return {
      ok: false,
      fieldErrors: {
        verified_on: ["number changed: update the verified date too"],
      },
    };
  }

  const { error } = await supabase.from("stats").update(row).eq("slug", slug);
  if (error) return { ok: false, message: "couldn't save. try again." };

  updateTag("stats");
  return { ok: true, data: undefined };
}
