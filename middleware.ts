import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mcq_admin";
const USER_COOKIE = "mcq_user";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (cookie !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /practice (except /practice/[quizId] which is public)
  if (pathname === "/practice" || (pathname.startsWith("/practice/") && pathname.split("/").length === 3)) {
    // Allow /practice/[quizId] to be public
    if (pathname === "/practice") {
      const cookie = req.cookies.get(USER_COOKIE)?.value;
      if (!cookie) {
        const url = req.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/practice/:path*"],
};

