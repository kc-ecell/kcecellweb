import { createBrowserClient } from "@supabase/ssr";

// Browser client. Used only by the terminal OTP flow (docs/SECRET_ADMIN_ACCESS.md);
// everything else reads via lib/data/* and writes via Server Actions.
// TODO(phase2): add the <Database> generic once `npm run db:types` has run.
export function createClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
