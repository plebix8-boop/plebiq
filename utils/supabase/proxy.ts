import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const rawRole = (user?.app_metadata as Record<string, unknown> | undefined)?.role;
    const role = typeof rawRole === "string" ? rawRole : "user";
    if (!user || role !== "admin") {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  if (!user && pathname.startsWith("/dashboard")) {
    const redirectResponse = NextResponse.redirect(new URL("/auth", request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname.startsWith("/auth")) {
    const rawRole = (user.app_metadata as Record<string, unknown>)?.role;
    const role = typeof rawRole === "string" ? rawRole : "user";
    const destination = role === "admin" ? "/admin/polls" : "/";
    const redirectResponse = NextResponse.redirect(new URL(destination, request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
