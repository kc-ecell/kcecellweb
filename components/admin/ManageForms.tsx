"use client";

import { useState, useTransition } from "react";
import {
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/admin/Field";
import {
  inviteStaff,
  saveSettings,
  setMessageStatus,
  updateStaff,
} from "@/lib/actions/admin/manage";

export function MessageActions({
  id,
  mailto,
  status,
}: {
  id: string;
  mailto: string;
  status: string;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const change = (next: string) =>
    startTransition(async () => {
      const result = await setMessageStatus(id, next);
      if (result.ok) window.location.reload();
      else setNote(result.message ?? "couldn't update.");
    });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
      <a href={mailto} className="text-accent">
        reply by email
      </a>
      {status !== "read" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("read")}
          className="text-ink-2 hover:text-ink cursor-pointer"
        >
          mark read
        </button>
      )}
      {status !== "archived" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("archived")}
          className="text-ink-2 hover:text-ink cursor-pointer"
        >
          archive
        </button>
      )}
      <span role="status" className="text-danger text-xs">
        {note}
      </span>
    </div>
  );
}

export interface SettingsValues {
  email: string;
  address: string;
  reply_time: string;
  instagram: string;
  linkedin: string;
  github: string;
}

const SETTINGS_FIELDS: [keyof SettingsValues, string][] = [
  ["email", "contact email"],
  ["address", "address"],
  ["reply_time", "reply time"],
  ["instagram", "instagram link"],
  ["linkedin", "linkedin link"],
  ["github", "github link"],
];

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(form);
      setErrors(result.ok ? {} : (result.fieldErrors ?? {}));
      setNote(
        result.ok
          ? "saved. live on the site in a few seconds."
          : (result.message ?? "fix the fields above."),
      );
    });
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      {SETTINGS_FIELDS.map(([key, label]) => (
        <Field key={key} label={label} errors={errors[key]}>
          <input
            className={inputClass}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </Field>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "saving…" : "save"}
        </button>
        <p role="status" className="text-ink-2 text-sm">
          {note}
        </p>
      </div>
    </form>
  );
}

export function InviteForm() {
  const [form, setForm] = useState({
    email: "",
    display_name: "",
    role: "editor",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await inviteStaff(form);
      if (result.ok) {
        window.location.reload();
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setNote(result.message ?? "fix the fields above.");
    });
  };

  return (
    <form
      onSubmit={add}
      className="border-line bg-surface mb-8 max-w-3xl border p-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="email" errors={errors.email}>
          <input
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="name" errors={errors.display_name}>
          <input
            className={inputClass}
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          />
        </Field>
        <Field label="role" errors={errors.role}>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="editor">editor</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          add staff
        </button>
        <p role="status" className="text-danger text-sm">
          {note}
        </p>
      </div>
    </form>
  );
}

export function StaffRowControls({
  id,
  role,
  active,
  isSelf,
}: {
  id: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const update = (change: { role?: string; active?: boolean }) =>
    startTransition(async () => {
      const result = await updateStaff(id, change);
      if (result.ok) window.location.reload();
      else setNote(result.message ?? "couldn't update.");
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="role"
        disabled={pending || isSelf}
        className={`${inputClass} w-auto`}
        value={role}
        onChange={(e) => update({ role: e.target.value })}
      >
        <option value="editor">editor</option>
        <option value="admin">admin</option>
        <option value="owner">owner</option>
      </select>
      {!isSelf && (
        <button
          type="button"
          disabled={pending}
          onClick={() => update({ active: !active })}
          className={`cursor-pointer text-sm ${active ? "text-danger" : "text-accent"}`}
        >
          {active ? "deactivate" : "reactivate"}
        </button>
      )}
      <span role="status" className="text-danger text-xs">
        {note}
      </span>
    </div>
  );
}
