"use client";

import { useActionState } from "react";

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

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Admin password</label>
        <input
          name="password"
          type="password"
          autoFocus
          required
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none ring-blue-500 focus:ring-2"
        />
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

