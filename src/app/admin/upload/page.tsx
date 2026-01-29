import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadQuiz } from "./actions";
import UploadForm from "./UploadForm";
import { isAdminAuthed } from "@/lib/adminAuth";
import { deleteQuizAdmin } from "../actions";

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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Admin: Upload MCQ CSV
          </h1>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-medium text-blue-600 hover:underline" href="/">
              Home
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-zinc-600">
            Upload a CSV with columns like: <span className="font-mono">question</span>,{" "}
            <span className="font-mono">optionA</span>, <span className="font-mono">optionB</span>,{" "}
            <span className="font-mono">optionC</span>, <span className="font-mono">optionD</span>,{" "}
            <span className="font-mono">answer</span> (A/B/C/D or 1..N), optional{" "}
            <span className="font-mono">hint</span>.
          </p>

          <UploadForm action={uploadQuiz} />

          <details className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-zinc-800">
              Show CSV example
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-zinc-800">
question,optionA,optionB,optionC,optionD,answer,hint
"Sign Magnitude পদ্ধতিতে MSB 1 হলে সংখ্যাটি কী নির্দেশ করে?","ধনাত্মক","ঋণাত্মক","শূন্য","—","B","Sign bit = 1 means negative"
            </pre>
          </details>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Existing quizzes</h2>
          <p className="mt-1 text-sm text-zinc-600">You can open or delete a quiz.</p>

          <div className="mt-4 space-y-3">
            {quizzes.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                No quizzes yet.
              </div>
            ) : (
              quizzes.map((q: QuizWithCount) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-900">{q.title}</div>
                    <div className="text-xs text-zinc-500">{q._count.questions} questions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                      href={`/practice/${q.id}`}
                    >
                      Open
                    </Link>
                    <form action={deleteQuizAdmin}>
                      <input type="hidden" name="quizId" value={q.id} />
                      <button
                        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
