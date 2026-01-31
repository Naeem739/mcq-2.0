"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type LoginResult = { ok: false; error: string } | undefined;

export default function LoginForm({
  nextPath,
  action,
}: {
  nextPath: string;
  action: (formData: FormData) => Promise<LoginResult>;
}) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    async (_prev, formData) => {
      formData.set("next", nextPath);
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state?.ok === false) {
      toast.error("Login Failed", {
        description: state.error,
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Email</label>
        <input
          name="email"
          type="email"
          autoFocus
          required
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Site Code</label>
        <input
          name="siteCode"
          type="text"
          required
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2 font-mono uppercase"
          placeholder="Enter your 12-digit site code"
          maxLength={12}
        />
        <p className="mt-1 text-xs text-zinc-500">Enter the site code assigned by Super Admin</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl sm:rounded-2xl bg-zinc-900 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

