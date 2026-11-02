import { z } from "zod";

// Server env validation. Call getEnv() from server code that needs these; it
// validates once and throws a clear error on a missing/malformed key. Kept lazy
// (not validated at import) so builds of pages that don't touch these stay green
// before the project's secrets are set. See docs/DEPLOYMENT.md §2.
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_FROM_EMAIL: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  IP_HASH_SALT: z.string().min(16).optional(),
  ADMIN_BACKUP_DOOR_TOKEN: z.string().min(16).optional(),
});

let cached: z.infer<typeof serverSchema> | null = null;

export function getEnv() {
  if (!cached) cached = serverSchema.parse(process.env);
  return cached;
}
