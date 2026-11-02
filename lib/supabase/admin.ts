import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Imported ONLY here (AGENTS.md rule 7).
// Used for the OTP allowlist lookup and inserting contact messages. Never
// reaches the client bundle thanks to `server-only`.
// TODO(phase2): add the <Database> generic once `npm run db:types` has run.
export function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
