"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { type ActionResult, requireStaff } from "@/lib/auth/staff";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const done: ActionResult = { ok: true, data: undefined };

export async function setMessageStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  await requireStaff(["owner", "admin"]);
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["new", "read", "archived"]) })
    .safeParse({ id, status });
  if (!parsed.success) return { ok: false, message: "unknown message." };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, message: "couldn't update." };
  revalidatePath("/admin/messages");
  return done;
}

const optionalUrl = z.union([
  z.url("use a full link starting with https://"),
  z.literal(""),
]);

const SettingsInput = z.object({
  email: z.email("add a valid email"),
  address: z.string().trim().min(5, "add the address"),
  reply_time: z.string().trim().min(3, "add a reply time"),
  instagram: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
});

export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireStaff(["owner", "admin"]);
  const parsed = SettingsInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { email, address, reply_time, ...socials } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("site_settings").upsert([
    { key: "org.contact", value: { email, address, reply_time } },
    { key: "org.socials", value: socials },
  ]);
  if (error) return { ok: false, message: "couldn't save. try again." };
  updateTag("settings");
  return done;
}

const StaffInput = z.object({
  email: z.email("add a valid email").toLowerCase(),
  display_name: z.string().trim().min(2, "add a name"),
  role: z.enum(["owner", "admin", "editor"]),
});

export async function inviteStaff(input: unknown): Promise<ActionResult> {
  await requireStaff(["owner"]);
  const parsed = StaffInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const admin = createAdminSupabase();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
  });
  if (error) {
    return { ok: false, message: "couldn't add them. are they already staff?" };
  }

  const supabase = await createServerSupabase();
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, ...parsed.data });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return {
      ok: false,
      message: profileError.message.includes("cap")
        ? "staff cap reached. deactivate someone first."
        : "couldn't add them.",
    };
  }
  revalidatePath("/admin/staff");
  return done;
}

export async function updateStaff(
  id: string,
  change: { role?: string; active?: boolean },
): Promise<ActionResult> {
  await requireStaff(["owner"]);
  const parsed = z
    .object({
      id: z.uuid(),
      role: z.enum(["owner", "admin", "editor"]).optional(),
      active: z.boolean().optional(),
    })
    .safeParse({ id, ...change });
  if (!parsed.success) return { ok: false, message: "unknown staff member." };

  const { id: staffId, ...row } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", staffId);
  if (error) {
    return {
      ok: false,
      message: /owner/i.test(error.message)
        ? "there must always be one active owner."
        : /cap/i.test(error.message)
          ? "staff cap reached."
          : "couldn't update.",
    };
  }
  revalidatePath("/admin/staff");
  return done;
}
