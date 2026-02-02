import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const siteId = await getAdminSiteId();
  if (!siteId) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id, siteId },
    include: {
      questions: true,
      attempts: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!exam) notFound();

  const scheduledAt = new Date(exam.scheduledAt);
  const isUpcoming = scheduledAt > new Date();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-6">
          <Link
            href="/admin/exam"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </Link>
          
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-zinc-900">{exam.title}</h1>
                  {isUpcoming && (
                    <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                      🕐 Upcoming
                    </span>
                  )}
                  {!isUpcoming && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-zinc-600 flex-wrap">
                  <div>📅 {scheduledAt.toLocaleDateString()} at {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>⏱️ {exam.duration} minutes</div>
                  <div>❓ {exam.questions.length} questions</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900">{exam.attempts.length}</div>
                <p className="text-sm text-zinc-600 mt-1">Total Attempts</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900">
                  {exam.attempts.length > 0
                    ? Math.round((exam.attempts.reduce((sum, a) => sum + a.correctAnswers, 0) / (exam.attempts.length * exam.questions.length)) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-zinc-600 mt-1">Average Score</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900">
                  {exam.attempts.length > 0
                    ? Math.round(exam.attempts.reduce((sum, a) => sum + a.totalTimeSeconds, 0) / exam.attempts.length / 60)
                    : 0}
                </div>
                <p className="text-sm text-zinc-600 mt-1">Avg. Time (min)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Student Performance</h2>
          
          {exam.attempts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <div className="mb-3">📊</div>
              <p>No attempts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900">Email</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900">Score</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900">Correct</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.attempts.map((attempt) => {
                    const scorePercent = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
                    const timeMinutes = Math.round(attempt.totalTimeSeconds / 60);
                    
                    return (
                      <tr key={attempt.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="py-3 px-4 text-sm text-zinc-900">{attempt.user.name}</td>
                        <td className="py-3 px-4 text-sm text-zinc-600">{attempt.user.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-16 h-8 rounded-full text-sm font-semibold ${
                            scorePercent >= 80 ? 'bg-green-100 text-green-700' :
                            scorePercent >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scorePercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-zinc-900">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-zinc-600">{timeMinutes}m</td>
                        <td className="py-3 px-4 text-sm text-zinc-600">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
