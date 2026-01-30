import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

export default async function Home() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">Quiz Practice</h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600">Practice quizzes and improve your knowledge</p>
          </div>
          <Link
            href="/admin/upload"
            className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-zinc-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 text-center transition-colors"
          >
            Admin Upload
          </Link>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          {quizzes.length === 0 ? (
            <div className="text-xs sm:text-sm text-zinc-600">
              No quizzes available yet. Go to <Link className="text-blue-600 hover:underline" href="/admin/upload">Admin Upload</Link> to import a CSV.
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {quizzes.map((q: QuizWithCount) => (
                <Link
                  key={q.id}
                  href={`/practice/${q.id}`}
                  className="block rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-3 sm:py-4 hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="font-semibold text-sm sm:text-base text-zinc-900 break-words">{q.title}</div>
                    <div className="text-xs sm:text-sm font-medium text-zinc-600 whitespace-nowrap">
                      {q._count.questions} {q._count.questions === 1 ? 'question' : 'questions'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
