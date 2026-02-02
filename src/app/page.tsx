import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isUserAuthed, getUserSiteId, getUserId } from "@/lib/auth";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import ChapterView from "@/components/ChapterView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type QuizWithCount = {
  id: string;
  title: string;
  chapter: number;
  createdAt: Date;
  _count: {
    questions: number;
  };
};

export default async function Home() {
  const isLoggedIn = await isUserAuthed();
  const isAdmin = await isAdminAuthed();
  const userSiteId = await getUserSiteId();
  const adminSiteId = await getAdminSiteId();
  const siteId = userSiteId || adminSiteId;
  
  // If user is not logged in and not an admin, show login message
  if (!isLoggedIn && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
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

          {/* Login Required Message */}
          <div className="rounded-2xl border-2 border-blue-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
              Please Login First to Start Quiz
            </h3>
            <p className="text-slate-600 mb-6">
              You need to be logged in to view and take quizzes. Please log in to continue.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
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

          {/* Login Required Message */}
          <div className="rounded-2xl border-2 border-blue-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
              Please Login First to Start Quiz
            </h3>
            <p className="text-slate-600 mb-6">
              You need to be logged in to view and take quizzes. Please log in to continue.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quizzes = await prisma.quiz.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  // Get user's solved quizzes (only for logged-in users, not admins)
  let solvedQuizIds: string[] = [];
  if (isLoggedIn && !isAdmin) {
    const userId = await getUserId();
    if (userId) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        select: { quizId: true },
        distinct: ['quizId'],
      });
      solvedQuizIds = attempts.map(a => a.quizId);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <div className="mb-12 sm:mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">HSC ICT - Enhance Your Skills</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Quiz Practice Platform
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Master HSC ICT by practicing chapter-wise quizzes and track your progress to excellence.
          </p>
        </div>

        {/* Chapter View */}
        <ChapterView quizzes={quizzes} solvedQuizIds={solvedQuizIds} />
      </div>
    </div>
  );
}
