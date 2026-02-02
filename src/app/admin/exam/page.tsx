import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import { adminLogout } from "../login/actions";
import AdminTabNav from "@/components/AdminTabNav";
import DeleteExamButton from "./DeleteExamButton";

export const dynamic = "force-dynamic";

export default async function AdminExamsPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const siteId = await getAdminSiteId();
  if (!siteId) {
    redirect("/admin/login");
  }

  const exams = await prisma.exam.findMany({
    where: { siteId },
    orderBy: { scheduledAt: "desc" },
    include: {
      _count: {
        select: { questions: true, attempts: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">👨‍💼 Admin Dashboard</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                Content Management
              </h1>
              <p className="text-base sm:text-lg text-slate-600">Manage quizzes, exams, and blog content</p>
            </div>
            <form action={adminLogout}>
              <button
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>

          {/* Tab Navigation */}
          <AdminTabNav />
        </div>

        {/* Exams Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">📋 Manage Exams</h2>
              <p className="text-slate-600">Create, schedule, and monitor your exams</p>
            </div>
            <Link
              href="/admin/exam/create"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              + Create Exam
            </Link>
          </div>

          <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Exams Yet</h3>
              <p className="text-zinc-600 mb-6">
                Create your first scheduled exam to get started.
              </p>
              <Link
                href="/admin/exam/create"
                className="inline-block rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Create Exam
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam) => {
                const now = new Date();
                const scheduledAt = new Date(exam.scheduledAt);
                const isUpcoming = scheduledAt > now;
                const isActive = scheduledAt <= now;

                return (
                  <div
                    key={exam.id}
                    className="group rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <Link
                        href={`/admin/exam/${exam.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-green-600 transition-colors">
                            {exam.title}
                          </h3>
                          {isUpcoming && (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                              🕐 Upcoming
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                              ✅ Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-600 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{scheduledAt.toLocaleDateString()} at {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>⏱️</span>
                            <span>{exam.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>❓</span>
                            <span>{exam._count.questions} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>👥</span>
                            <span>{exam._count.attempts} attempts</span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3">
                        <DeleteExamButton examId={exam.id} examTitle={exam.title} />
                        <Link
                          href={`/admin/exam/${exam.id}`}
                          className="text-zinc-400 group-hover:text-zinc-600 transition-colors"
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
