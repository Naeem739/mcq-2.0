import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isUserAuthed, getUserSiteId, getUserId } from "@/lib/auth";
import ExamCard from "./ExamCard";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  if (!(await isUserAuthed())) {
    redirect("/auth/login?next=/exam");
  }

  const siteId = await getUserSiteId();
  const userId = await getUserId();

  if (!siteId || !userId) {
    redirect("/auth/login?next=/exam");
  }

  const exams = await prisma.exam.findMany({
    where: { siteId },
    orderBy: { scheduledAt: "asc" },
    include: {
      _count: {
        select: { questions: true },
      },
      attempts: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const now = new Date();
  const upcomingExams = exams.filter((e) => new Date(e.scheduledAt) > now);
  const activeExams = exams.filter((e) => {
    const examEnd = new Date(e.scheduledAt.getTime() + e.duration * 60000);
    return new Date(e.scheduledAt) <= now && now <= examEnd;
  });
  const finishedExams = exams.filter((e) => {
    const examEnd = new Date(e.scheduledAt.getTime() + e.duration * 60000);
    return now > examEnd;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1.5">
            <p className="text-xs sm:text-sm font-semibold text-green-700">Scheduled Exams</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Examination Center
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Take your scheduled exams and track your performance
          </p>
        </div>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span>🕐</span>
              <span>Upcoming Exams</span>
            </h2>
            <div className="grid gap-6">
              {upcomingExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={{
                    id: exam.id,
                    title: exam.title,
                    scheduledAt: exam.scheduledAt,
                    duration: exam.duration,
                    questionCount: exam._count.questions,
                    hasAttempted: exam.attempts.length > 0,
                  }}
                  isUpcoming={true}
                  isFinished={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Exams */}
        {activeExams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span>⏳</span>
              <span>Ongoing Exams</span>
            </h2>
            <div className="grid gap-6">
              {activeExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={{
                    id: exam.id,
                    title: exam.title,
                    scheduledAt: exam.scheduledAt,
                    duration: exam.duration,
                    questionCount: exam._count.questions,
                    hasAttempted: exam.attempts.length > 0,
                  }}
                  isUpcoming={false}
                  isFinished={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Finished Exams */}
        {finishedExams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span>✅</span>
              <span>Finished Exams</span>
            </h2>
            <div className="grid gap-6">
              {finishedExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={{
                    id: exam.id,
                    title: exam.title,
                    scheduledAt: exam.scheduledAt,
                    duration: exam.duration,
                    questionCount: exam._count.questions,
                    hasAttempted: exam.attempts.length > 0,
                  }}
                  isUpcoming={false}
                  isFinished={true}
                />
              ))}
            </div>
          </div>
        )}

        {exams.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Exams Scheduled</h3>
            <p className="text-slate-600">
              There are no exams scheduled at this time. Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
