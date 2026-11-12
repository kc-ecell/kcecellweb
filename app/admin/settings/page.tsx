import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SettingsForm } from "@/components/admin/ManageForms";
import { requireStaff } from "@/lib/auth/staff";
import { getContactSettings } from "@/lib/data/public";

async function Settings() {
  await requireStaff(["owner", "admin"]).catch(() => notFound());
  return <SettingsForm initial={await getContactSettings()} />;
}

export default function SettingsPage() {
  return (
    <>
      <h1 className="display mb-2 text-4xl">settings</h1>
      <p className="text-ink-2 mb-8 text-sm">these show on the contact page.</p>
      <Suspense fallback={<p className="eyebrow">loading settings…</p>}>
        <Settings />
      </Suspense>
    </>
  );
}
