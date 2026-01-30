import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadQuiz } from "./actions";
import UploadForm from "./UploadForm";
import { isAdminAuthed } from "@/lib/adminAuth";
import { deleteQuizAdmin, updateQuizTitle } from "../actions";
import EditQuizTitle from "@/components/EditQuizTitle";

export const dynamic = "force-dynamic";

/**
 * Quiz type with question count
 */
type QuizWithCount = {
  id: string;
  title: string;
  createdAt: Date;
  _count: {
    questions: number;
  };
};

export default async function AdminUploadPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login?next=/admin/upload");

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
            Admin: Upload Quiz CSV
          </h1>
          <div className="flex items-center gap-3">
            <Link className="text-xs sm:text-sm font-medium text-blue-600 hover:underline" href="/">
              Home
            </Link>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          <p className="mb-4 text-xs sm:text-sm text-zinc-600">
            Upload a CSV file or paste JSON text. CSV format: <span className="font-mono">question</span>,{" "}
            <span className="font-mono">optionA</span>, <span className="font-mono">optionB</span>,{" "}
            <span className="font-mono">optionC</span>, <span className="font-mono">optionD</span>,{" "}
            <span className="font-mono">answer</span> (A/B/C/D or 1..N), optional{" "}
            <span className="font-mono">hint</span>.
          </p>

          <UploadForm action={uploadQuiz} />

          <details className="mt-4 sm:mt-6 rounded-lg sm:rounded-xl border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-2 sm:py-3">
            <summary className="cursor-pointer text-xs sm:text-sm font-medium text-zinc-800">
              Show examples
            </summary>
            <div className="mt-2 sm:mt-3 space-y-3">
              <div>
                <p className="text-xs font-semibold text-zinc-800 mb-1">CSV Example:</p>
                <pre className="overflow-x-auto rounded-lg bg-white p-2 sm:p-3 text-xs text-zinc-800">
question,optionA,optionB,optionC,optionD,answer,hint
"Sign Magnitude পদ্ধতিতে MSB 1 হলে সংখ্যাটি কী নির্দেশ করে?","ধনাত্মক","ঋণাত্মক","শূন্য","—","B","Sign bit = 1 means negative"
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800 mb-1">JSON Example:</p>
                <pre className="overflow-x-auto rounded-lg bg-white p-2 sm:p-3 text-xs text-zinc-800">
{`[
  {
    "text": "What is 2+2?",
    "options": ["2", "3", "4", "5"],
    "answer": "C",
    "hint": "Basic math"
  },
  {
    "text": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "answer": 2,
    "hint": "City of lights"
  }
]`}
                </pre>
              </div>
            </div>
          </details>
        </div>

        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Existing quizzes</h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">You can edit title, open, or delete a quiz.</p>

          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            {quizzes.length === 0 ? (
              <div className="rounded-lg sm:rounded-xl border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-600">
                No quizzes yet.
              </div>
            ) : (
              quizzes.map((q: QuizWithCount) => (
                <div
                  key={q.id}
                  className="flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                    <EditQuizTitle
                      quizId={q.id}
                      currentTitle={q.title}
                      action={updateQuizTitle}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-500">{q._count.questions} {q._count.questions === 1 ? 'question' : 'questions'}</div>
                    <div className="flex items-center gap-2">
                      <Link
                        className="rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 text-center transition-colors"
                        href={`/practice/${q.id}`}
                      >
                        Open
                      </Link>
                      <form action={deleteQuizAdmin}>
                        <input type="hidden" name="quizId" value={q.id} />
                        <button
                          className="rounded-lg sm:rounded-xl bg-red-600 px-3 py-1.5 sm:py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                          type="submit"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-zinc-500">
            Developed by <span className="font-semibold text-zinc-700">Naeem</span>
          </p>
        </div>
      </div>
    </div>
  );
}
