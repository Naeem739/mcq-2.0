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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">MCQ Maker</h1>
            <p className="mt-1 text-sm text-zinc-600">Upload MCQs and practice them like a quiz.</p>
          </div>
          <Link
            href="/admin/upload"
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Admin Upload
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {quizzes.length === 0 ? (
            <div className="text-sm text-zinc-600">
              No quizzes yet. Go to <Link className="text-blue-600 hover:underline" href="/admin/upload">Admin Upload</Link> to import a CSV.
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q: QuizWithCount) => (
                <Link
                  key={q.id}
                  href={`/practice/${q.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 hover:bg-zinc-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-zinc-900">{q.title}</div>
                    <div className="text-sm font-medium text-zinc-600">
                      {q._count.questions} questions
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
