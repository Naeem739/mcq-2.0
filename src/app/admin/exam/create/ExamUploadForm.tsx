"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";

type UploadResult = { ok: false; error: string } | undefined;

type Question = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
};

export default function ExamUploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<UploadResult>;
}) {
  const [inputType, setInputType] = useState<"csv" | "json" | "manual" | "content">("manual");
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), text: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" }
  ]);
  
  const [state, formAction, pending] = useActionState<UploadResult, FormData>(
    async (_prevState, formData) => {
      formData.set("inputType", inputType);
      if (inputType === "manual") {
        formData.set("questionsData", JSON.stringify(questions));
      }
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

  // Get minimum date (current date)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok === false ? (
        <div className="whitespace-pre-wrap rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
          ⚠️ {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Exam Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="e.g. Mid-term Exam - ICT"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            name="duration"
            type="number"
            min="1"
            required
            defaultValue="60"
            placeholder="e.g. 60"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Schedule Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          name="scheduledAt"
          type="datetime-local"
          required
          min={getMinDateTime()}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="mt-1 text-xs text-slate-500">Students can take the exam after this time</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-900">Input Format</label>
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-white transition-colors">
            <input
              type="radio"
              name="inputType"
              value="manual"
              checked={inputType === "manual"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json" | "manual" | "content")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-slate-900">✍️ Manual Entry</div>
              <div className="text-xs text-slate-600">Add questions one by one</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-white transition-colors">
            <input
              type="radio"
              name="inputType"
              value="csv"
              checked={inputType === "csv"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json" | "manual" | "content")}
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
              onChange={(e) => setInputType(e.target.value as "csv" | "json" | "manual" | "content")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-slate-900">{ } JSON</div>
              <div className="text-xs text-slate-600">Paste JSON text</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-white transition-colors">
            <input
              type="radio"
              name="inputType"
              value="content"
              checked={inputType === "content"}
              onChange={(e) => setInputType(e.target.value as "csv" | "json" | "manual" | "content")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-slate-900">📝 Content Upload</div>
              <div className="text-xs text-slate-600">Paste raw content text</div>
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

      {inputType === "content" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Paste Content Text</label>
          <textarea
            name="contentText"
            rows={12}
            placeholder="Question,OptionA,OptionB,OptionC,OptionD,Answer\nWhat is the capital of Bangladesh?,Dhaka,Chittagong,Khulna,Rajshahi,A"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 font-mono outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
          />
        </div>
      )}

      {inputType === "manual" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Questions</h3>
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

          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            ➕ Add Question
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
      >
        {pending ? "⏳ Creating..." : "📅 Schedule Exam"}
      </button>
    </form>
  );
}
