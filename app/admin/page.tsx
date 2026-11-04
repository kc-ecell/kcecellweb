import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "admin",
  robots: { index: false, follow: false },
};

async function Dashboard() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: staff } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (!staff) notFound();

  return (
    <>
      <p className="eyebrow mb-2">root@ecell:~# · {staff.role}</p>
      <h1 className="display">
        hi, {staff.display_name}
        <span className="dot-accent">.</span>
      </h1>
      <p className="text-ink-2 mt-4">
        you&apos;re in. editors for events, team and stats land here next.
      </p>
      <SignOutButton />
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="wrap flex-1 pt-24 pb-28">
      <Suspense fallback={<p className="eyebrow">checking clearance…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
