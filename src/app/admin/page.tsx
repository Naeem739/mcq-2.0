import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UploadForm from "./UploadForm";
import { deleteQuizAdmin, uploadQuizAdmin, updateQuizTitle } from "./actions";
import { adminLogout } from "./login/actions";
import EditQuizTitle from "@/components/EditQuizTitle";
import DeleteQuizButton from "@/components/DeleteQuizButton";
import { getAdminSiteId } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type QuizWithCount = {
  id: string;
  title: string;
  chapter: number;
  createdAt: Date;
  _count: {
    questions: number;
  };
};

export default async function AdminPage() {
  const siteId = await getAdminSiteId();
  if (!siteId) {
    return null;
  }

  const quizzes = await prisma.quiz.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
              Upload CSV and manage quizzes.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form action={adminLogout} className="flex-1 sm:flex-none">
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-zinc-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
              Upload Quiz
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
              Upload CSV file or paste JSON text. CSV format: <span className="font-mono">question</span>,{" "}
              <span className="font-mono">optionA</span>..,{" "}
              <span className="font-mono">answer</span>, optional{" "}
              <span className="font-mono">hint</span>.
            </p>
            <div className="mt-3 sm:mt-4">
              <UploadForm action={uploadQuizAdmin} />
            </div>
          </div>

          {/* Quiz List */}
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
              Your quizzes
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
              Edit title, open, or delete quizzes. Delete removes the quiz and all its questions.
            </p>

            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {quizzes.length === 0 ? (
                <div className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-zinc-600">
                  No quizzes yet.
                </div>
              ) : (
                quizzes.map((q: QuizWithCount) => (
                  <div
                    key={q.id}
                    className="flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <EditQuizTitle
                          quizId={q.id}
                          currentTitle={q.title}
                          action={updateQuizTitle}
                        />
                        <div className="mt-1 text-xs text-zinc-500">
                          Chapter {q.chapter}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-zinc-500">
                        {q._count.questions} {q._count.questions === 1 ? 'question' : 'questions'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          className="rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 text-center transition-colors"
                          href={`/practice/${q.id}`}
                        >
                          Open
                        </Link>

                        <DeleteQuizButton
                          quizId={q.id}
                          action={deleteQuizAdmin}
                        />
                      </div>
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
