"use client";

import { useState, useTransition } from "react";
import {
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/admin/Field";
import { updateStat } from "@/lib/actions/admin/stats";

export interface StatRow {
  slug: string;
  label: string;
  value: number;
  suffix: string;
  source: string;
  verified_on: string;
}

export function StatForm({ stat }: { stat: StatRow }) {
  const [form, setForm] = useState(stat);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (patch: Partial<StatRow>) => {
    setForm({ ...form, ...patch });
    setMessage("");
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateStat(form);
      setErrors(result.ok ? {} : (result.fieldErrors ?? {}));
      setMessage(
        result.ok
          ? "saved. live on the site in a few seconds."
          : (result.message ?? "fix the fields above."),
      );
    });
  };

  return (
    <form onSubmit={save} className="border-line bg-surface border p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <Field label="label" errors={errors.label}>
          <input
            className={inputClass}
            value={form.label}
            onChange={(e) => set({ label: e.target.value })}
          />
        </Field>
        <Field label="value" errors={errors.value}>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.value}
            onChange={(e) => set({ value: e.target.valueAsNumber })}
          />
        </Field>
        <Field label="suffix" errors={errors.suffix}>
          <input
            className={inputClass}
            value={form.suffix}
            onChange={(e) => set({ suffix: e.target.value })}
          />
        </Field>
        <div className="lg:col-span-2">
          <Field label="source" errors={errors.source}>
            <input
              className={inputClass}
              value={form.source}
              onChange={(e) => set({ source: e.target.value })}
            />
          </Field>
        </div>
        <Field label="verified on" errors={errors.verified_on}>
          <input
            type="date"
            className={inputClass}
            value={form.verified_on}
            onChange={(e) => set({ verified_on: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "saving…" : "save"}
        </button>
        <p role="status" className="text-ink-2 text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}
