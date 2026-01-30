"use client";

import Link from "next/link";
import { logoutAction } from "@/app/auth/login/actions";

export default function AuthNav({ user }: { user?: { userId: string; email: string } | null }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
      {user ? (
        <>
          <span className="text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">
            {user.email}
          </span>
          <form
            action={async () => {
              await logoutAction();
            }}
            className="inline"
          >
            <button
              type="submit"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 whitespace-nowrap"
            >
              Logout
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/auth/login" className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap">
            Log in
          </Link>
          <span className="text-slate-400">|</span>
          <Link href="/auth/signup" className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap">
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
