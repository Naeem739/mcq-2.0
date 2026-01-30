"use client";

import Link from "next/link";
import { logoutAction } from "@/app/auth/login/actions";

export default function AuthNav({ user }: { user?: { userId: string; email: string } | null }) {
  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-zinc-600">{user.email}</span>
          <form
            action={async () => {
              await logoutAction();
            }}
            className="inline"
          >
            <button
              type="submit"
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
            >
              Log out
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/auth/login" className="text-sm font-semibold text-blue-700 hover:underline">
            Log in
          </Link>
          <Link href="/auth/signup" className="text-sm font-semibold text-blue-700 hover:underline">
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
