"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";

type UpdateResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export default function EditQuizModal({
  quizId,
  currentTitle,
  existingQuestions,
  questionCount,
  action,
  onClose,
}: {
  quizId: string;
  currentTitle: string;
  existingQuestions: Question[];
  questionCount: number;
  action: (formData: FormData) => Promise<UpdateResult>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(currentTitle);
  const [inputType, setInputType] = useState<"csv" | "json">("csv");
  const [isPending, startTransition] = useTransition();

  // Convert existing questions to JSON format
  const existingQuestionsJson = JSON.stringify(
    existingQuestions.map((q) => ({
      text: q.text,
      options: q.options,
      answer: q.correctIndex,
    })),
    null,
    2
  );

  // Convert existing questions to CSV format
  const existingQuestionsCSV = () => {
    const header = "question,optionA,optionB,optionC,optionD,answer\n";
    const rows = existingQuestions.map((q) => {
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
      const answerLetter = ["A", "B", "C", "D"][q.correctIndex] || "A";
      return `${escapeCsv(q.text)},${q.options.map(escapeCsv).join(",")},${answerLetter}`;
    }).join("\n");
    return header + rows;
  };

  // Download CSV file
  const downloadCSV = () => {
    const csv = existingQuestionsCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTitle.replace(/[^a-z0-9]/gi, "_")}_questions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Download JSON file as .txt
  const downloadJSON = () => {
    const blob = new Blob([existingQuestionsJson], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTitle.replace(/[^a-z0-9]/gi, "_")}_questions.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!confirm(`Are you sure you want to update this quiz? This will replace all ${questionCount} existing questions.`)) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("quizId", quizId);
    formData.set("title", title);
    formData.set("inputType", inputType);

    startTransition(async () => {
      const result = await action(formData);

      if (result?.ok === false) {
        toast.error("Update Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        toast.success(result.message || "Quiz updated successfully");
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Edit Quiz</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-lg bg-amber-50 border border-amber-300 p-4">
            <p className="text-sm text-amber-900 font-medium">
              <strong>⚠️ Important:</strong> This action will permanently replace all existing quiz content.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Quiz Title</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Digital Logic Quiz"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="font-medium text-slate-900">📄 CSV File</div>
                  <div className="text-xs text-slate-600">Upload .csv file</div>
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
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      📋 Current Questions ({questionCount})
                    </p>
                    <p className="text-xs text-blue-700">
                      Download your existing questions before uploading a new file
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    ⬇️ Download CSV
                  </button>
                </div>
                <div className="text-xs text-blue-800 bg-white rounded p-2 font-mono overflow-x-auto max-h-32 overflow-y-auto">
                  {existingQuestionsCSV().split('\n').slice(0, 4).join('\n')}
                  {questionCount > 3 && '\n...'}
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Upload New CSV File</label>
                <input
                  name="file"
                  type="file"
                  accept=".csv,text/csv"
                  required
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Format: question, optionA, optionB, optionC, optionD, answer (A/B/C/D)
                </p>
              </div>
            </div>
          )}

          {inputType === "json" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      📋 Current Questions ({questionCount})
                    </p>
                    <p className="text-xs text-blue-700">
                      Download your existing questions as a text file
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadJSON}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    ⬇️ Download TXT
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Edit JSON Content</label>
                <textarea
                  name="jsonText"
                  rows={15}
                  required
                  defaultValue={existingQuestionsJson}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-mono outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Format: answer can be 0-3 (index) or "A"-"D" (letter)
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
            >
              {isPending ? "⏳ Updating..." : "✨ Update Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
