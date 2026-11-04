"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { type ActionResult, requireStaff } from "@/lib/auth/staff";
import { createServerSupabase } from "@/lib/supabase/server";

const AlbumInput = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1, "add a title"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes"),
  status: z.enum(["draft", "published"]),
});

const alt = z.string().trim().min(8, "describe the photo in 8+ characters");
const caption = z
  .string()
  .trim()
  .transform((value) => value || null);

const NewPhoto = z.object({
  album_id: z.uuid(),
  path: z.string().regex(/^gallery\/[\w-]+\.webp$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt,
  caption,
});

const PhotoEdit = z.object({ id: z.uuid(), alt, caption });

function refresh(albumId?: string) {
  updateTag("gallery");
  revalidatePath("/admin/gallery");
  if (albumId) revalidatePath(`/admin/gallery/${albumId}`);
}

// Only files we uploaded; /public paths aren't in storage. Removing storage
// files is owner/admin only under RLS, so for editors this quietly does nothing.
async function removeFiles(paths: string[]) {
  const stored = paths.filter((path) => !path.startsWith("/"));
  if (stored.length === 0) return;
  const supabase = await createServerSupabase();
  await supabase.storage.from("media").remove(stored);
}

export async function saveAlbum(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = AlbumInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const { id, ...row } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("gallery_albums").update(row).eq("id", id)
    : await supabase.from("gallery_albums").insert(row);
  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "that slug is already used."
          : "couldn't save. try again.",
    };
  }
  refresh(id);
  return { ok: true, data: undefined };
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) {
    return { ok: false, message: "unknown album." };
  }
  const supabase = await createServerSupabase();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("path")
    .eq("album_id", id);
  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
  if (error) return { ok: false, message: "couldn't delete. try again." };
  await removeFiles((photos ?? []).map((photo) => photo.path));
  refresh();
  return { ok: true, data: undefined };
}

export async function addPhoto(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = NewPhoto.safeParse(input);
  if (!parsed.success) return { ok: false, message: "check the alt text." };
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("gallery_photos")
    .insert({ ...parsed.data, sort: 1000 });
  if (error) return { ok: false, message: "couldn't add the photo." };
  refresh(parsed.data.album_id);
  return { ok: true, data: undefined };
}

export async function updatePhoto(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = PhotoEdit.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const { id, ...row } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("gallery_photos")
    .update(row)
    .eq("id", id);
  if (error) return { ok: false, message: "couldn't save." };
  refresh();
  return { ok: true, data: undefined };
}

export async function deletePhoto(id: string): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) {
    return { ok: false, message: "unknown photo." };
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("gallery_photos")
    .select("path, album_id")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { ok: false, message: "couldn't delete." };
  if (data) await removeFiles([data.path]);
  refresh(data?.album_id);
  return { ok: true, data: undefined };
}
