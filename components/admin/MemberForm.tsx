"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/admin/Field";
import { deleteMember, saveMember } from "@/lib/actions/admin/team";
import { createClientSupabase } from "@/lib/supabase/client";

export interface MemberRow {
  id?: string;
  name: string;
  role: string;
  department: string;
  tier: string;
  bio: string;
  photo_path: string | null;
  linkedin_url: string;
  github_url: string;
  instagram_url: string;
  sort: number;
  status: string;
}

const MAX_SIDE = 1200;

async function toWebp(file: File, grayscale: boolean): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  if (grayscale) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
      const y = 0.299 * px[i]! + 0.587 * px[i + 1]! + 0.114 * px[i + 2]!;
      px[i] = px[i + 1] = px[i + 2] = y;
    }
    ctx.putImageData(image, 0, 0);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
      "image/webp",
      0.88,
    );
  });
}

async function uploadPhotos(colour: File, gray: File | null): Promise<string> {
  const supabase = createClientSupabase();
  const name = `team/${crypto.randomUUID()}`;
  const files: [string, Blob][] = [
    [`${name}.webp`, await toWebp(colour, false)],
    [`${name}-bw.webp`, await toWebp(gray ?? colour, !gray)],
  ];
  for (const [path, blob] of files) {
    const { error } = await supabase.storage
      .from("media")
      .upload(path, blob, { contentType: "image/webp" });
    if (error) throw error;
  }
  return `${name}.webp`;
}

export function MemberForm({ member }: { member: MemberRow }) {
  const [form, setForm] = useState(member);
  const [colour, setColour] = useState<File | null>(null);
  const [gray, setGray] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (patch: Partial<MemberRow>) => setForm({ ...form, ...patch });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      let photoPath = form.photo_path;
      if (colour) {
        try {
          photoPath = await uploadPhotos(colour, gray);
        } catch {
          setMessage("photo upload failed. try a smaller image.");
          return;
        }
      }
      const result = await saveMember({ ...form, photo_path: photoPath });
      if (result.ok) {
        window.location.assign("/admin/team");
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message ?? "fix the fields above.");
    });
  };

  const remove = () => {
    if (!form.id || !window.confirm(`delete ${form.name}?`)) return;
    const id = form.id;
    startTransition(async () => {
      const result = await deleteMember(id);
      if (result.ok) {
        window.location.assign("/admin/team");
      } else {
        setMessage(result.message ?? "couldn't delete.");
      }
    });
  };

  const text = (
    label: string,
    key: "name" | "role" | "linkedin_url" | "github_url" | "instagram_url",
  ) => (
    <Field label={label} errors={errors[key]}>
      <input
        className={inputClass}
        value={form[key]}
        onChange={(e) => set({ [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {text("name", "name")}
        {text("role", "role")}
        <Field label="department" errors={errors.department}>
          <select
            className={inputClass}
            value={form.department}
            onChange={(e) => set({ department: e.target.value })}
          >
            <option value="faculty">faculty</option>
            <option value="leadership">leadership</option>
            <option value="technical">technical</option>
            <option value="events">events & operations</option>
            <option value="media">media & communications</option>
          </select>
        </Field>
        <Field label="level" errors={errors.tier}>
          <select
            className={inputClass}
            value={form.tier}
            onChange={(e) => set({ tier: e.target.value })}
          >
            <option value="faculty">faculty</option>
            <option value="leadership">leadership</option>
            <option value="head">head</option>
            <option value="cohead">co-head</option>
            <option value="member">member</option>
          </select>
        </Field>
      </div>

      <Field label={`bio (${form.bio.length}/160)`} errors={errors.bio}>
        <textarea
          rows={3}
          className={inputClass}
          value={form.bio}
          onChange={(e) => set({ bio: e.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={form.photo_path ? "replace colour photo" : "colour photo"}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={inputClass}
            onChange={(e) => setColour(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Field label="grayscale photo (optional, made automatically if empty)">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={inputClass}
            onChange={(e) => setGray(e.target.files?.[0] ?? null)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {text("linkedin", "linkedin_url")}
        {text("github", "github_url")}
        {text("instagram", "instagram_url")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="position (lower shows first)" errors={errors.sort}>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.sort}
            onChange={(e) => set({ sort: e.target.valueAsNumber })}
          />
        </Field>
        <Field label="status" errors={errors.status}>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => set({ status: e.target.value })}
          >
            <option value="published">published</option>
            <option value="draft">draft (hidden from the site)</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "saving…" : "save"}
        </button>
        <Link href="/admin/team" className="text-ink-2 hover:text-ink text-sm">
          cancel
        </Link>
        {form.id && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-danger ml-auto cursor-pointer text-sm"
          >
            delete
          </button>
        )}
      </div>
      <p role="status" className="text-danger text-sm">
        {message}
      </p>
    </form>
  );
}
