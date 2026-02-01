"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";

type UploadResult = { ok: false; error: string } | undefined;

export default function UploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<UploadResult>;
}) {
  const [inputType, setInputType] = useState<"csv" | "json">("csv");
  const [state, formAction, pending] = useActionState<UploadResult, FormData>(
    async (_prevState, formData) => {
      formData.set("inputType", inputType);
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state?.ok === false) {
      toast.error("Upload Failed", {
        description: state.error,
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok === false ? (
        <div className="whitespace-pre-wrap rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
          ⚠️ {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">Quiz Title</label>
        <input
          name="title"
          placeholder="e.g. Digital Logic (Sign Magnitude)"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-900">Input Format</label>
        <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-white transition-colors">
            <input
              type="radio"
              name="inputType"
              value="csv"
              checked={inputType === "csv"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-slate-900">📄 CSV / Excel File</div>
              <div className="text-xs text-slate-600">Upload .csv or .xlsx/.xls</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-white transition-colors">
            <input
              type="radio"
              name="inputType"
              value="json"
              checked={inputType === "json"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-slate-900">{ } JSON</div>
              <div className="text-xs text-slate-600">Paste JSON text</div>
            </div>
          </label>
        </div>
      </div>

      {inputType === "csv" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Select CSV or Excel File</label>
          <input
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
          />
        </div>
      )}

      {inputType === "json" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Paste JSON Text</label>
          <textarea
            name="jsonText"
            rows={10}
            placeholder='[\n  {\n    "text": "What is 2+2?",\n    "options": ["2", "3", "4", "5"],\n    "answer": "C"\n  }\n]'
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 font-mono outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
      >
        {pending ? "⏳ Uploading..." : "✨ Create Quiz"}
      </button>
    </form>
  );
}

