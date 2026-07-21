import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname.toLowerCase() === "www.plebiq.com") {
    const destination = new URL(request.nextUrl.pathname, "https://plebiq.com");
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 301);
  }

  if (/^\/(auth|dashboard|admin)(\/|$)/.test(request.nextUrl.pathname)) {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
