"use server";

import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";

const ContactInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  topic: z.enum(["general", "partnership", "speaker", "media", "other"]),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0), // honeypot: hidden from people, bots fill it in
});

export async function submitContact(
  input: unknown,
): Promise<{ ok: boolean; message?: string }> {
  const parsed = ContactInput.safeParse(input);
  if (!parsed.success) {
    // Pretend a bot's message worked so it doesn't adapt
    if (parsed.error.issues.some((issue) => issue.path[0] === "website")) {
      return { ok: true };
    }
    return {
      ok: false,
      message: "check your name, email, and a message of 10+ characters.",
    };
  }

  const { name, email, topic, message } = parsed.data;
  const { error } = await createAdminSupabase()
    .from("contact_messages")
    .insert({ name, email, topic, message });
  if (error) {
    console.error("submitContact:", error.message);
    return {
      ok: false,
      message: "couldn't send that. email us directly instead.",
    };
  }
  return { ok: true };
}
