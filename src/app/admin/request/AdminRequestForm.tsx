"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type RequestResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

export default function AdminRequestForm({
  action,
}: {
  action: (formData: FormData) => Promise<RequestResult>;
}) {
  const [state, formAction, pending] = useActionState<RequestResult, FormData>(
    async (_prev, formData) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state?.ok === false) {
      toast.error("Request Failed", {
        description: state.error,
      });
    } else if (state?.ok === true) {
      toast.success("Request Submitted", {
        description: state.message,
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

      {state?.ok === true ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.message}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-800">Full Name</label>
        <input
          name="name"
          type="text"
          autoFocus
          required
          placeholder="John Doe"
          className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-800">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="admin@example.com"
          className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-800">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-800">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          placeholder="Repeat password"
          className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl sm:rounded-2xl bg-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {pending ? "Submitting request..." : "Submit Request"}
      </button>
    </form>
  );
}
