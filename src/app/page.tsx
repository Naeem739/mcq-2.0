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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
        <div className="mb-12 sm:mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">Enhance Your Skills</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Quiz Practice Platform
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Challenge yourself with our comprehensive quizzes and track your progress to master your knowledge.
          </p>
        </div>

        {/* Quizzes Grid */}
        <div>
          {quizzes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Quizzes Available</h3>
              <p className="text-slate-600 mb-6">
                There are no quizzes to practice yet. Check back soon or contact your administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quizzes.map((q: QuizWithCount) => (
                <Link
                  key={q.id}
                  href={`/practice/${q.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:-translate-y-1"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-16 -mt-16" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors break-words">
                          {q.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Questions</span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {q._count.questions}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {quizzes.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{quizzes.length}</div>
              <p className="mt-2 text-sm text-slate-600">Available Quizzes</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {quizzes.reduce((sum, q) => sum + q._count.questions, 0)}
              </div>
              <p className="mt-2 text-sm text-slate-600">Total Questions</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 text-center col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q._count.questions, 0) / quizzes.length) : 0}
              </div>
              <p className="mt-2 text-sm text-slate-600">Avg. Questions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
