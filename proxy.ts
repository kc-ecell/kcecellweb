import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// /admin is a plain 404 for anyone without an active staff session.
// See docs/SECRET_ADMIN_ACCESS.md §5.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items) {
          for (const { name, value } of items) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of items) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStaff = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .eq("active", true)
      .maybeSingle();
    isStaff = Boolean(data);
  }

  if (!isStaff) {
    // Rewriting to a route that doesn't exist serves the normal public 404.
    return NextResponse.rewrite(new URL("/__404", request.url));
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
