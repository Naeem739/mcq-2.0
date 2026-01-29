"use client";

import { useActionState } from "react";

type UploadResult = { ok: true } | { ok: false; error: string } | undefined;

export default function UploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<UploadResult>;
}) {
  const [state, formAction, pending] = useActionState<UploadResult, FormData>(
    async (_prevState, formData) => {
      return action(formData);
    },
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false ? (
        <div className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : state?.ok === true ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Uploaded successfully.
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-800">Quiz title</label>
        <input
          name="title"
          placeholder="e.g. Digital Logic (Sign Magnitude)"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-800">CSV file</label>
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload CSV"}
      </button>
    </form>
  );
}

