"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/admin/Field";
import {
  addPhoto,
  deletePhoto,
  updatePhoto,
} from "@/lib/actions/admin/gallery";
import { toWebp } from "@/lib/admin/image";
import { createClientSupabase } from "@/lib/supabase/client";

export interface AlbumPhoto {
  id: string;
  url: string;
  alt: string;
  caption: string;
}

interface Pending {
  key: string;
  file: File;
  preview: string;
  alt: string;
  caption: string;
  state: "ready" | "uploading" | "failed";
}

const MAX_FILES = 50;
const PARALLEL = 4;

function ExistingPhoto({ photo }: { photo: AlbumPhoto }) {
  const [alt, setAlt] = useState(photo.alt);
  const [caption, setCaption] = useState(photo.caption);
  const [note, setNote] = useState("");
  const [busy, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await updatePhoto({ id: photo.id, alt, caption });
      setNote(
        result.ok
          ? "saved."
          : (result.fieldErrors?.alt?.[0] ?? "couldn't save."),
      );
    });

  const remove = () => {
    if (!window.confirm("delete this photo?")) return;
    startTransition(async () => {
      const result = await deletePhoto(photo.id);
      if (result.ok) window.location.reload();
      else setNote("couldn't delete.");
    });
  };

  return (
    <li className="border-line bg-surface border p-3">
      <div className="bg-sunk relative mb-3 aspect-[4/3]">
        <Image
          src={photo.url}
          alt={alt}
          fill
          sizes="300px"
          className="object-cover"
        />
      </div>
      <div className="space-y-2">
        <Field label="alt text">
          <input
            className={inputClass}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </Field>
        <Field label="caption">
          <input
            className={inputClass}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="text-accent cursor-pointer"
        >
          save
        </button>
        <span role="status" className="text-ink-2 text-xs">
          {note}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="text-danger ml-auto cursor-pointer"
        >
          delete
        </button>
      </div>
    </li>
  );
}

export function PhotoManager({
  albumId,
  photos,
}: {
  albumId: string;
  photos: AlbumPhoto[];
}) {
  const [queue, setQueue] = useState<Pending[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const choose = (files: FileList | null) => {
    if (!files) return;
    const chosen = Array.from(files).slice(0, MAX_FILES - queue.length);
    setQueue([
      ...queue,
      ...chosen.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        alt: "",
        caption: "",
        state: "ready" as const,
      })),
    ]);
  };

  const patch = (key: string, change: Partial<Pending>) =>
    setQueue((items) =>
      items.map((item) => (item.key === key ? { ...item, ...change } : item)),
    );

  const uploadOne = async (item: Pending): Promise<boolean> => {
    patch(item.key, { state: "uploading" });
    try {
      const { blob, width, height } = await toWebp(item.file);
      const path = `gallery/${crypto.randomUUID()}.webp`;
      const { error } = await createClientSupabase()
        .storage.from("media")
        .upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      const result = await addPhoto({
        album_id: albumId,
        path,
        width,
        height,
        alt: item.alt,
        caption: item.caption,
      });
      if (!result.ok) throw new Error("save failed");
      return true;
    } catch {
      patch(item.key, { state: "failed" });
      return false;
    }
  };

  const uploadAll = async () => {
    if (queue.some((item) => item.alt.trim().length < 8)) {
      setMessage("every photo needs alt text of 8+ characters.");
      return;
    }
    setMessage("");
    setUploading(true);
    const items = [...queue];
    let failed = 0;
    const worker = async () => {
      for (let item = items.shift(); item; item = items.shift()) {
        if (!(await uploadOne(item))) failed += 1;
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    setUploading(false);
    if (failed === 0) window.location.reload();
    else
      setMessage(`${failed} failed. the rest are saved, so reload to check.`);
  };

  return (
    <section className="mt-12 max-w-5xl">
      <h2 className="text-ink-2 mb-4 font-mono text-xs">
        photos ({photos.length})
      </h2>

      <Field label={`add photos (up to ${MAX_FILES} at once)`}>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className={inputClass}
          onChange={(e) => choose(e.target.files)}
        />
      </Field>

      {queue.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {queue.map((item) => (
              <li
                key={item.key}
                className="border-line bg-surface flex flex-wrap gap-3 border p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
                <img
                  src={item.preview}
                  alt=""
                  className="h-20 w-20 object-cover"
                />
                <div className="min-w-48 flex-1 space-y-2">
                  <input
                    aria-label={`alt text for ${item.file.name}`}
                    placeholder="alt text: what's in this photo?"
                    className={inputClass}
                    value={item.alt}
                    onChange={(e) => patch(item.key, { alt: e.target.value })}
                  />
                  <input
                    aria-label={`caption for ${item.file.name}`}
                    placeholder="caption (optional)"
                    className={inputClass}
                    value={item.caption}
                    onChange={(e) =>
                      patch(item.key, { caption: e.target.value })
                    }
                  />
                  {item.state !== "ready" && (
                    <p className="text-ink-2 font-mono text-xs">{item.state}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={uploadAll}
            disabled={uploading}
            className={`${primaryButtonClass} mt-4`}
          >
            {uploading ? "uploading…" : `upload ${queue.length}`}
          </button>
        </>
      )}
      <p role="status" className="text-danger mt-2 text-sm">
        {message}
      </p>

      {photos.length === 0 ? (
        <p className="text-muted mt-6 text-sm">no photos in this album yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <ExistingPhoto key={photo.id} photo={photo} />
          ))}
        </ul>
      )}
    </section>
  );
}
