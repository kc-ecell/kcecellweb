"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/admin/Field";
import type { ResourceField } from "@/lib/admin/resources";
import type { ActionResult } from "@/lib/auth/staff";

type Values = Record<string, string | number | boolean | null>;

export function ResourceForm({
  fields,
  initial,
  backHref,
  save,
  remove,
}: {
  fields: ResourceField[];
  initial: Values;
  backHref: string;
  save: (input: unknown) => Promise<ActionResult>;
  remove?: (id: string) => Promise<ActionResult>;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (key: string, value: Values[string]) =>
    setForm({ ...form, [key]: value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await save(form);
      if (result.ok) {
        window.location.assign(backHref);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message ?? "fix the fields above.");
    });
  };

  const destroy = () => {
    const id = form.id;
    if (typeof id !== "string" || !remove) return;
    if (!window.confirm("delete this permanently?")) return;
    startTransition(async () => {
      const result = await remove(id);
      if (result.ok) window.location.assign(backHref);
      else setMessage(result.message ?? "couldn't delete.");
    });
  };

  const control = (field: ResourceField) => {
    const value = form[field.key];
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows={4}
            className={inputClass}
            value={String(value ?? "")}
            onChange={(e) => set(field.key, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            className={inputClass}
            value={String(value ?? "")}
            onChange={(e) => set(field.key, e.target.value)}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            className={inputClass}
            value={value === null ? "" : Number(value)}
            onChange={(e) =>
              set(
                field.key,
                e.target.value === "" ? null : e.target.valueAsNumber,
              )
            }
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            className="size-5"
            checked={Boolean(value)}
            onChange={(e) => set(field.key, e.target.checked)}
          />
        );
      default:
        return (
          <input
            type={field.type === "datetime" ? "datetime-local" : "text"}
            className={inputClass}
            value={String(value ?? "")}
            onChange={(e) => set(field.key, e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const length = String(form[field.key] ?? "").length;
          const label = field.max
            ? `${field.label} (${length}/${field.max})`
            : field.label;
          return (
            <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
              <Field label={label} errors={errors[field.key]}>
                {control(field)}
              </Field>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "saving…" : "save"}
        </button>
        <Link href={backHref} className="text-ink-2 hover:text-ink text-sm">
          cancel
        </Link>
        {typeof form.id === "string" && remove && (
          <button
            type="button"
            onClick={destroy}
            disabled={pending}
            className="text-danger ml-auto cursor-pointer text-sm"
          >
            delete
          </button>
        )}
      </div>
      <p role="status" className="text-danger mt-2 text-sm">
        {message}
      </p>
    </form>
  );
}
