// Photos live either in /public ("/team/x.png") or in the Supabase `media`
// bucket ("team/x.webp"). The grayscale version always sits next to the colour
// file with a -bw suffix.
export function mediaUrl(path: string): string {
  if (path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

export function grayscalePath(path: string): string {
  return path.replace(/(\.\w+)$/, "-bw$1");
}
