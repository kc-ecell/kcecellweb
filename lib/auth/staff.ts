import "server-only";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";

export type StaffRole = "owner" | "admin" | "editor";

export interface Staff {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
}

/** Signed-in active staff member, or null. Cached per request. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    role: data.role as StaffRole,
  };
});

/** First line of every admin Server Action. RLS still enforces the same rule. */
export async function requireStaff(
  roles: StaffRole[] = ["owner", "admin", "editor"],
): Promise<Staff> {
  const staff = await getStaff();
  if (!staff || !roles.includes(staff.role)) {
    throw new Error("Not authorised");
  }
  return staff;
}

/** Return shape of every admin Server Action. See docs/ADMIN_PANEL.md §5. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message?: string; fieldErrors?: Record<string, string[]> };
