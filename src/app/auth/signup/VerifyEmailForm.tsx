"use client";

import { useActionState } from "react";

type VerifyResult = { ok: false; error: string } | { ok: true } | undefined;

export default function VerifyEmailForm({
  email,
  action,
}: {
  email: string;
  action: (formData: FormData) => Promise<VerifyResult>;
}) {
  const [state, formAction, pending] = useActionState<VerifyResult, FormData>(
    async (_prev, formData) => {
      formData.set("email", email);
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p>A verification code has been sent to <strong>{email}</strong></p>
        <p className="text-xs mt-1">Code expires in 15 minutes</p>
        <p className="text-xs mt-2 font-semibold">
          💡 <strong>Development Mode:</strong> Check your terminal/console for the code
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Verification Code</label>
        <input
          name="code"
          type="text"
          autoFocus
          required
          maxLength={6}
          placeholder="000000"
          className="w-full text-center text-lg tracking-widest rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl sm:rounded-2xl bg-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {pending ? "Verifying..." : "Verify Email"}
      </button>
    </form>
  );
}
