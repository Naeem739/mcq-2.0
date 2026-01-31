import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mcq_admin";
const USER_COOKIE = "mcq_user";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin (except /admin/login and /admin/request)
  if (pathname.startsWith("/admin") && 
      !pathname.startsWith("/admin/login") && 
      !pathname.startsWith("/admin/request")) {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    try {
      const adminData = cookie ? JSON.parse(cookie) : null;
      if (!adminData || !adminData.siteId) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /superadmin (except /superadmin/login)
  if (pathname.startsWith("/superadmin") && !pathname.startsWith("/superadmin/login")) {
    const cookie = req.cookies.get("mcq_super_admin")?.value;
    if (cookie !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/superadmin/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect /practice and /practice/[quizId] - require login or admin
  if (pathname === "/practice" || (pathname.startsWith("/practice/") && pathname.split("/").length === 3)) {
    const userCookie = req.cookies.get(USER_COOKIE)?.value;
    const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
    // Allow access if user is logged in OR admin is logged in
    if (!userCookie) {
      try {
        const adminData = adminCookie ? JSON.parse(adminCookie) : null;
        if (!adminData || !adminData.siteId) {
          const url = req.nextUrl.clone();
          url.pathname = "/auth/login";
          url.searchParams.set("next", pathname);
          return NextResponse.redirect(url);
        }
      } catch {
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
  matcher: ["/admin/:path*", "/practice/:path*", "/superadmin/:path*"],
};

