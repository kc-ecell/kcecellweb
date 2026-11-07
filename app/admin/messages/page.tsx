import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MessageActions } from "@/components/admin/ManageForms";
import { requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const when = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

async function Inbox() {
  await requireStaff(["owner", "admin"]).catch(() => notFound());
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, topic, organisation, message, status, created_at")
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return <p className="text-muted">couldn&apos;t load messages.</p>;
  if (data.length === 0) return <p className="text-muted">inbox is clear.</p>;

  const pinned = [...data].sort(
    (a, b) =>
      Number(b.topic === "partnership") - Number(a.topic === "partnership"),
  );

  return (
    <ul className="max-w-3xl space-y-3">
      {pinned.map((item) => (
        <li key={item.id} className="border-line bg-surface border p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              {item.status === "new" && (
                <span className="text-accent font-mono text-xs">new · </span>
              )}
              {item.name}
              {item.organisation && ` · ${item.organisation}`}
            </p>
            <p className="text-muted font-mono text-xs">
              {item.topic} · {when.format(new Date(item.created_at))}
            </p>
          </div>
          <p className="text-muted text-xs">{item.email}</p>
          <p className="text-ink-2 mt-3 text-sm whitespace-pre-line">
            {item.message}
          </p>
          <MessageActions
            id={item.id}
            status={item.status}
            mailto={`mailto:${item.email}?subject=${encodeURIComponent("Re: your message to E-Cell KCCEMSR")}`}
          />
        </li>
      ))}
    </ul>
  );
}

export default function MessagesPage() {
  return (
    <>
      <h1 className="display mb-8 text-4xl">messages</h1>
      <Suspense fallback={<p className="eyebrow">loading messages…</p>}>
        <Inbox />
      </Suspense>
    </>
  );
}
