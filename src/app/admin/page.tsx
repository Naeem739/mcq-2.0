import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UploadForm from "./UploadForm";
import { deleteQuizAdmin, uploadQuizAdmin } from "./actions";
import { adminLogout } from "./login/actions";

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

export default async function AdminPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Upload CSV and manage quizzes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
              href="/"
            >
              Home
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Upload MCQ CSV
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Columns: <span className="font-mono">question</span>,{" "}
              <span className="font-mono">optionA</span>..,{" "}
              <span className="font-mono">answer</span>, optional{" "}
              <span className="font-mono">hint</span>.
            </p>
            <div className="mt-4">
              <UploadForm action={uploadQuizAdmin} />
            </div>
          </div>

          {/* Quiz List */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Your quizzes
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Delete removes the quiz and all its questions.
            </p>

            <div className="mt-4 space-y-3">
              {quizzes.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
                  No quizzes yet.
                </div>
              ) : (
                quizzes.map((q: QuizWithCount) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zinc-900">
                        {q.title}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {q._count.questions} questions
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                        href={`/practice/${q.id}`}
                      >
                        Open
                      </Link>

                      <form action={deleteQuizAdmin}>
                        <input
                          type="hidden"
                          name="quizId"
                          value={q.id}
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
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
    </div>
  );
}
