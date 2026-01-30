"use client";

import { useActionState } from "react";

type LoginResult = { ok: false; error: string } | undefined;

export default function LoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<LoginResult>;
}) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    async (_prev, formData) => {
      return action(formData);
    },
    undefined,
  );

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
          placeholder="you@example.com"
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Password</label>
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl sm:rounded-2xl bg-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
