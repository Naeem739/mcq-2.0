import { notFound } from "next/navigation";
import Link from "next/link";
import PracticeClient, { type PracticeQuestion } from "./PracticeClient";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie, isUserAuthed, getUserSiteId } from "@/lib/auth";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Question type from database
 */
type QuestionFromDB = {
  id: string;
  text: string;
  options: unknown;
  correctIndex: number;
  createdAt: Date;
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  
  // Check if user is logged in or admin is logged in
  const isLoggedIn = await isUserAuthed();
  const isAdmin = await isAdminAuthed();
  const userSiteId = await getUserSiteId();
  const adminSiteId = await getAdminSiteId();
  const siteId = userSiteId || adminSiteId;
  
  if (!isLoggedIn && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4">
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
              You need to be logged in to take this quiz. Please log in to continue.
            </p>
            <Link
              href={`/auth/login?next=/practice/${quizId}`}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4">
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
              You need to be logged in to take this quiz. Please log in to continue.
            </p>
            <Link
              href={`/auth/login?next=/practice/${quizId}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quiz = await prisma.quiz.findUnique({
    where: { 
      id: quizId,
      siteId: siteId,
    },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!quiz) notFound();
  if (quiz.questions.length === 0) notFound();

  const questions: PracticeQuestion[] = quiz.questions.map((q: QuestionFromDB) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    correctIndex: q.correctIndex,
  }));

  // If any row is malformed, fail fast.
  if (questions.some((q: PracticeQuestion) => q.options.length < 2)) notFound();

  const user = await getUserFromCookie();
  let studentName = "Anonymous";
  
  if (user?.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });
    if (dbUser?.name) {
      studentName = dbUser.name;
    }
  }

  return <PracticeClient quizId={quizId} quizTitle={quiz.title} chapter={quiz.chapter} questions={questions} studentName={studentName} />;
}
