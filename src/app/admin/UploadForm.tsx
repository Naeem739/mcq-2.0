"use client";

import { useActionState, useState } from "react";

type UploadResult = { ok: true } | { ok: false; error: string } | undefined;

export default function UploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<UploadResult>;
}) {
  const [inputType, setInputType] = useState<"csv" | "json">("csv");
  const [state, formAction, pending] = useActionState<UploadResult, FormData>(
    async (_prevState, formData) => {
      // Add input type to form data
      formData.set("inputType", inputType);
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
        <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">Quiz title</label>
        <input
          name="title"
          placeholder="e.g. Digital Logic (Sign Magnitude)"
          className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      {/* Input Type Selector */}
      <div>
        <label className="mb-2 block text-xs sm:text-sm font-medium text-zinc-800">Input Type</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="csv"
              checked={inputType === "csv"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json")}
              className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm text-zinc-700">CSV File</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="json"
              checked={inputType === "json"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json")}
              className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm text-zinc-700">JSON Text</span>
          </label>
        </div>
      </div>

      {/* CSV File Input */}
      {inputType === "csv" && (
        <div>
          <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">CSV file</label>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:rounded-lg sm:file:rounded-xl file:border-0 file:bg-zinc-900 file:px-3 sm:file:px-4 file:py-1.5 sm:file:py-2 file:text-xs sm:file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
          />
        </div>
      )}

      {/* JSON Text Input */}
      {inputType === "json" && (
        <div>
          <label className="mb-1 block text-xs sm:text-sm font-medium text-zinc-800">JSON Text</label>
          <textarea
            name="jsonText"
            rows={12}
            placeholder='[\n  {\n    "text": "What is 2+2?",\n    "options": ["2", "3", "4", "5"],\n    "answer": "C",\n    "hint": "Basic math"\n  }\n]'
            className="w-full rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-900 font-mono outline-none ring-blue-500 focus:ring-2 resize-y"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl sm:rounded-2xl bg-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {pending ? "Uploading..." : "Create Quiz"}
      </button>
    </form>
  );
}

