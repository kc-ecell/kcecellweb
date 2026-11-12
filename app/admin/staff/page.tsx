import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InviteForm, StaffRowControls } from "@/components/admin/ManageForms";
import { requireStaff } from "@/lib/auth/staff";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const when = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

async function Staff() {
  const me = await requireStaff(["owner"]).catch(() => notFound());
  const supabase = await createServerSupabase();
  const [{ data, error }, { data: cap }, { data: auth }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, display_name, role, active")
      .order("created_at"),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "private.staff_cap")
      .maybeSingle(),
    createAdminSupabase().auth.admin.listUsers({ perPage: 100 }),
  ]);
  if (error) return <p className="text-muted">couldn&apos;t load staff.</p>;

  const seats = cap?.value?.max_active_staff ?? 10;
  const lastLogin = new Map(
    (auth?.users ?? []).map((user) => [user.id, user.last_sign_in_at]),
  );

  return (
    <>
      <p className="text-ink-2 mb-6 text-sm">
        {data.filter((person) => person.active).length} / {seats} seats used.
        new staff log in through the terminal with their email.
      </p>
      <InviteForm />
      <ul className="border-line divide-line max-w-3xl divide-y border">
        {data.map((person) => {
          const login = lastLogin.get(person.id);
          return (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="min-w-0">
                {person.display_name}
                {!person.active && " (inactive)"}
                <span className="text-muted block text-xs">
                  {person.email} · last login{" "}
                  {login ? when.format(new Date(login)) : "never"}
                </span>
              </span>
              <StaffRowControls
                id={person.id}
                role={person.role}
                active={person.active}
                isSelf={person.id === me.id}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function StaffPage() {
  return (
    <>
      <h1 className="display mb-4 text-4xl">staff</h1>
      <Suspense fallback={<p className="eyebrow">loading staff…</p>}>
        <Staff />
      </Suspense>
    </>
  );
}
