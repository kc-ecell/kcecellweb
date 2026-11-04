"use client";

import { useTransition } from "react";
import { signOutStaff } from "@/lib/actions/auth";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutStaff();
          window.location.assign("/");
        })
      }
      className="border-line text-ink-2 hover:text-ink shrink-0 cursor-pointer border px-3 py-2 font-mono text-xs"
    >
      {pending ? "logging out…" : "log out"}
    </button>
  );
}
