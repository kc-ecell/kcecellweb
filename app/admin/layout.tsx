import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getStaff } from "@/lib/auth/staff";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "admin",
  robots: { index: false, follow: false },
};

async function Shell({ children }: { children: React.ReactNode }) {
  const staff = await getStaff();
  if (!staff) notFound();

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="border-line bg-surface flex shrink-0 flex-wrap items-center justify-between border-b p-4 md:w-60 md:flex-col md:items-stretch md:justify-start md:border-r md:border-b-0">
        <p className="px-3 py-2 font-mono text-sm">e-cell admin</p>
        <AdminNav role={staff.role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-line flex items-center justify-between gap-4 border-b px-4 py-3 md:px-8">
          <p className="text-ink-2 min-w-0 truncate font-mono text-xs">
            {staff.email} · {staff.role}
          </p>
          <SignOutButton />
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<p className="eyebrow p-8">checking clearance…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
