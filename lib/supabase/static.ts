import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for cached public reads, so pages stay static.
// RLS limits it to published rows. See docs/ARCHITECTURE.md §4.
// TODO(phase2): add the <Database> generic once `npm run db:types` has run.
export function createStaticSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
