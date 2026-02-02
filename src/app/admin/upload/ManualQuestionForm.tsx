"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";

type ManualUploadResult = { ok: false; error: string } | { ok: true; message?: string } | undefined;

type Question = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
};

export default function ManualQuestionForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ ok: false; error: string } | { ok: true; message?: string }>;
}) {
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), text: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" }
  ]);
  
  // Wrapper for useActionState that accepts the correct signature
  const handleAction = async (state: ManualUploadResult, formData: FormData): Promise<ManualUploadResult> => {
    return await action(formData);
  };
  
  const [state, formAction, pending] = useActionState<ManualUploadResult, FormData>(
    handleAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok === false) {
      toast.error("Upload Failed", {
        description: state.error,
      });
    }
  }, [state]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: crypto.randomUUID(), text: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add questions data as JSON
    formData.set("questionsData", JSON.stringify(questions));
    
    formAction(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state?.ok === false ? (
        <div className="whitespace-pre-wrap rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
          ⚠️ {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">Quiz Title</label>
        <input
          name="title"
          required
          placeholder="e.g. Digital Logic Quiz"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            ➕ Add Question
          </button>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-5 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-slate-900">Question {index + 1}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  🗑️ Remove
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={question.text}
                onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                required
                rows={2}
                placeholder="Enter your question here..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Option A <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.optionA}
                  onChange={(e) => updateQuestion(question.id, "optionA", e.target.value)}
                  required
                  placeholder="First option"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Option B <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.optionB}
                  onChange={(e) => updateQuestion(question.id, "optionB", e.target.value)}
                  required
                  placeholder="Second option"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Option C <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.optionC}
                  onChange={(e) => updateQuestion(question.id, "optionC", e.target.value)}
                  required
                  placeholder="Third option"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Option D <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.optionD}
                  onChange={(e) => updateQuestion(question.id, "optionD", e.target.value)}
                  required
                  placeholder="Fourth option"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correct Answer <span className="text-red-500">*</span>
              </label>
              <select
                value={question.answer}
                onChange={(e) => updateQuestion(question.id, "answer", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="A">A - {question.optionA || "(empty)"}</option>
                <option value="B">B - {question.optionB || "(empty)"}</option>
                <option value="C">C - {question.optionC || "(empty)"}</option>
                <option value="D">D - {question.optionD || "(empty)"}</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
        >
          {pending ? "⏳ Creating Quiz..." : "✨ Create Quiz with " + questions.length + " Question" + (questions.length !== 1 ? "s" : "")}
        </button>
      </div>
    </form>
  );
}
