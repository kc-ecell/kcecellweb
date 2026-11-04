"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Role = "owner" | "admin" | "editor";

interface Item {
  label: string;
  href?: string; // no href yet = screen not built
  roles?: Role[];
}

const STAFF_ITEMS: Item[] = [
  { label: "dashboard", href: "/admin" },
  { label: "events", href: "/admin/events" },
  { label: "team", href: "/admin/team" },
  { label: "achievements", href: "/admin/achievements" },
  { label: "timeline", href: "/admin/timeline" },
  { label: "gallery", href: "/admin/gallery" },
  { label: "blog", href: "/admin/blog" },
];

const MANAGEMENT_ITEMS: Item[] = [
  { label: "messages", roles: ["owner", "admin"] },
  { label: "stats", href: "/admin/stats", roles: ["owner", "admin"] },
  { label: "settings", roles: ["owner", "admin"] },
  { label: "staff", roles: ["owner"] },
  { label: "audit log", roles: ["owner", "admin"] },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  const canSee = (item: Item) => !item.roles || item.roles.includes(role);

  const renderItem = (item: Item) => {
    if (!item.href) {
      return (
        <li
          key={item.label}
          className="text-muted flex items-center justify-between px-3 py-2 text-sm"
        >
          {item.label}
          <span className="font-mono text-xs">soon</span>
        </li>
      );
    }
    const active =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);
    return (
      <li key={item.label}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "block px-3 py-2 text-sm",
            active ? "bg-sunk text-accent" : "text-ink-2 hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  const management = MANAGEMENT_ITEMS.filter(canSee);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="admin-nav"
        className="text-ink-2 hover:text-ink cursor-pointer px-2 py-3 font-mono text-sm md:hidden"
      >
        {open ? "close" : "menu"}
      </button>
      <nav
        id="admin-nav"
        aria-label="Admin"
        className={cn("w-full md:block", open ? "block" : "hidden")}
      >
        <ul>{STAFF_ITEMS.filter(canSee).map(renderItem)}</ul>
        {management.length > 0 && (
          <ul className="border-line mt-3 border-t pt-3">
            {management.map(renderItem)}
          </ul>
        )}
        <ul className="border-line mt-3 border-t pt-3">
          <li>
            <Link
              href="/"
              className="text-ink-2 hover:text-ink block px-3 py-2 text-sm"
            >
              view site ↗
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
