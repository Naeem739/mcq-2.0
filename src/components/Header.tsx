import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth";
import AuthNav from "./AuthNav";

export default async function Header() {
  const user = await getUserFromCookie();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo - Left */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900">Quiz Practice</h1>
                <p className="text-xs text-slate-600">Student Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                Profile
              </Link>
            )}
            <Link
              href="/admin/upload"
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Navigation - Center */}
          <div className="flex md:hidden items-center gap-1 sm:gap-2 flex-1 justify-center">
            <Link
              href="/"
              className="rounded px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            {user && (
              <Link
                href="/profile"
                className="rounded px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Profile
              </Link>
            )}
            <Link
              href="/admin/upload"
              className="rounded px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Admin
            </Link>
          </div>

          {/* Auth Component - Right */}
          <div className="flex-shrink-0">
            <AuthNav user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
