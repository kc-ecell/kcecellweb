import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// User-session client for RSC and Server Actions. RLS applies as the signed-in
// staff member. See docs/ARCHITECTURE.md §4 / §5.
// TODO(phase2): add the <Database> generic once `npm run db:types` has run.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items) {
          try {
            for (const { name, value, options } of items) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // called from a Server Component where cookies are read-only;
            // the middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
