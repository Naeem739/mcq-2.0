import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth";
import AuthNav from "./AuthNav";

export default async function Header() {
  const user = await getUserFromCookie();

  return (
    <header className="border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
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
                <h1 className="text-lg font-bold text-zinc-900">Quiz Practice</h1>
                <p className="text-xs text-zinc-600">Student Learning Platform</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
            )}
            <Link
              href="/admin/upload"
              className="text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <AuthNav user={user} />
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
