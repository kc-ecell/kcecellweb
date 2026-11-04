import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line bg-surface border p-5">
      <h2 className="text-ink-2 mb-3 font-mono text-xs">{title}</h2>
      {children}
    </section>
  );
}

function Big({ value }: { value: number | null }) {
  return (
    <p className="text-4xl font-semibold">{value === null ? "–" : value}</p>
  );
}

async function Dashboard() {
  const staff = await getStaff();
  if (!staff) notFound();

  const canManage = staff.role === "owner" || staff.role === "admin";
  const supabase = await createServerSupabase();
  const now = new Date();
  const nowIso = now.toISOString();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const count = { count: "exact", head: true } as const;

  const [
    upcoming,
    draftEvents,
    draftPosts,
    noCover,
    noPhoto,
    noAttendance,
    oldStats,
    messages,
    audit,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, starts_at")
      .gte("starts_at", nowIso)
      .order("starts_at")
      .limit(3),
    supabase.from("events").select("id", count).eq("status", "draft"),
    supabase.from("posts").select("id", count).eq("status", "draft"),
    supabase.from("events").select("id", count).is("cover_path", null),
    supabase.from("team_members").select("id", count).is("photo_path", null),
    supabase
      .from("events")
      .select("id", count)
      .lt("ends_at", nowIso)
      .is("attendance", null),
    supabase
      .from("stats")
      .select("slug", count)
      .lt("verified_on", sixMonthsAgo.toISOString().slice(0, 10)),
    canManage
      ? supabase
          .from("contact_messages")
          .select("id", count)
          .eq("status", "new")
      : null,
    canManage
      ? supabase
          .from("audit_log")
          .select("id, action, table_name, at")
          .order("at", { ascending: false })
          .limit(5)
      : null,
  ]);

  const drafts =
    draftEvents.count === null || draftPosts.count === null
      ? null
      : draftEvents.count + draftPosts.count;

  const health = [
    { label: "events missing a cover", value: noCover.count },
    { label: "team members without a photo", value: noPhoto.count },
    { label: "past events missing attendance", value: noAttendance.count },
    { label: "stats not verified in 6 months", value: oldStats.count },
  ];

  return (
    <>
      <h1 className="display">
        hi, {staff.displayName}
        <span className="dot-accent">.</span>
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="upcoming events">
          {upcoming.error ? (
            <p className="text-muted text-sm">couldn&apos;t load events.</p>
          ) : upcoming.data.length === 0 ? (
            <p className="text-muted text-sm">nothing scheduled yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {upcoming.data.map((event) => (
                <li key={event.id}>
                  {event.title}
                  <span className="text-muted block font-mono text-xs">
                    {dateFormat.format(new Date(event.starts_at))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="drafts waiting">
          <Big value={drafts} />
        </Card>

        {canManage && (
          <Card title="new messages">
            <Big value={messages?.count ?? null} />
          </Card>
        )}

        <Card title="content health">
          <ul className="space-y-2 text-sm">
            {health.map((item) => (
              <li key={item.label} className="flex justify-between gap-4">
                <span className="text-ink-2">{item.label}</span>
                <span
                  className={item.value ? "text-warn font-mono" : "font-mono"}
                >
                  {item.value ?? "–"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {canManage && (
          <Card title="recent activity">
            {!audit?.data || audit.data.length === 0 ? (
              <p className="text-muted text-sm">no changes recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {audit.data.map((entry) => (
                  <li key={entry.id}>
                    {entry.action.toLowerCase()} · {entry.table_name}
                    <span className="text-muted block font-mono text-xs">
                      {dateFormat.format(new Date(entry.at))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="eyebrow">loading dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}
