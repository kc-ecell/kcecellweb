"use server";

import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

// Terminal login. See docs/SECRET_ADMIN_ACCESS.md §4.
const emailSchema = z.string().trim().toLowerCase().email();
// Length follows the Supabase "Email OTP Length" setting (6 to 10 digits)
const codeSchema = z
  .string()
  .transform((code) => code.replace(/\s/g, ""))
  .pipe(z.string().regex(/^\d{6,10}$/));
const MIN_REQUEST_MS = 600;

async function isActiveStaff(email: string) {
  const { data } = await createAdminSupabase()
    .from("profiles")
    .select("id")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();
  return Boolean(data);
}

// Always resolves the same way after the same minimum time, so the response
// never reveals whether an address is staff.
export async function requestOtp(rawEmail: string): Promise<{ ok: true }> {
  const started = Date.now();
  const email = emailSchema.safeParse(rawEmail);
  if (email.success) {
    try {
      if (await isActiveStaff(email.data)) {
        const supabase = await createServerSupabase();
        const { error } = await supabase.auth.signInWithOtp({
          email: email.data,
          options: { shouldCreateUser: false },
        });
        if (error) console.error("requestOtp:", error.message);
      }
    } catch (err) {
      console.error("requestOtp failed:", err);
    }
  }
  const wait = MIN_REQUEST_MS - (Date.now() - started);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  return { ok: true };
}

export async function verifyOtp(
  rawEmail: string,
  rawCode: string,
): Promise<{ ok: boolean }> {
  const email = emailSchema.safeParse(rawEmail);
  const code = codeSchema.safeParse(rawCode);
  if (!email.success || !code.success) return { ok: false };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: code.data,
    type: "email",
  });
  if (error) return { ok: false };

  if (!(await isActiveStaff(email.data))) {
    await supabase.auth.signOut();
    return { ok: false };
  }
  return { ok: true };
}

export async function signOutStaff(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}
