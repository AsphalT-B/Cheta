import { NextRequest, NextResponse } from "next/server";

function hasBetterAuthSession(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => name.includes("better-auth.session_token"));
}

export function proxy(request: NextRequest) {
  if (!hasBetterAuthSession(request)) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
