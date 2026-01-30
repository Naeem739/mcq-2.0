import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadQuiz } from "./actions";
import UploadForm from "./UploadForm";
import { isAdminAuthed } from "@/lib/adminAuth";
import { deleteQuizAdmin, updateQuizTitle } from "../actions";
import EditQuizTitle from "@/components/EditQuizTitle";
import StudentPerformance from "@/components/StudentPerformance";

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

export default async function AdminUploadPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login?next=/admin/upload");

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  // Fetch all quiz attempts for performance analytics
  const attempts = await prisma.quizAttempt.findMany({
    include: {
      quiz: {
        select: { id: true, title: true },
      },
      user: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">👨‍💼 Admin Dashboard</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Quiz Management
          </h1>
          <p className="text-base sm:text-lg text-slate-600">Create, manage, and monitor your quizzes</p>
        </div>

        {/* Upload Section */}
        <div className="mb-8 sm:mb-12 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">📤 Upload Quiz</h2>
            <p className="text-slate-600">Import questions from CSV or JSON format</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-700 font-medium">
              <span className="font-semibold">CSV Format:</span> question, optionA, optionB, optionC, optionD, answer (A/B/C/D or 0-3)
            </p>
          </div>

          <UploadForm action={uploadQuiz} />

          <details className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              ▶ Show file format examples
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-900 mb-2">CSV Example:</p>
                <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-800 border border-slate-200">
question,optionA,optionB,optionC,optionD,answer
"What is the capital of France?","London","Berlin","Paris","Madrid","C"
"2 + 2 = ?","2","3","4","5","C"
                </pre>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-2">JSON Example:</p>
                <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-800 border border-slate-200">
{`[\\n  {\\n    "text": "What is 2+2?",\\n    "options": ["2", "3", "4", "5"],\\n    "answer": "C"\\n  },\\n  {\\n    "text": "What is the capital of France?",\\n    "options": ["London", "Berlin", "Paris", "Madrid"],\\n    "answer": 2\\n  }\\n]`}
                </pre>
              </div>
            </div>
          </details>
        </div>

        {/* Existing Quizzes Section */}
        <div className="mb-8 sm:mb-12 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">📚 Existing Quizzes</h2>
            <p className="text-slate-600">Edit, open, or delete quizzes from your library</p>
          </div>

          {quizzes.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="text-lg font-medium text-slate-900 mb-2">No Quizzes Yet</p>
              <p className="text-slate-600">Upload your first quiz using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((q: QuizWithCount) => (
                <div
                  key={q.id}
                  className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <EditQuizTitle
                      quizId={q.id}
                      currentTitle={q.title}
                      action={updateQuizTitle}
                    />
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      <span>❓</span>
                      <span className="font-semibold">{q._count.questions}</span>
                      <span>{q._count.questions === 1 ? 'question' : 'questions'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors"
                      href={`/practice/${q.id}`}
                    >
                      👁 Open
                    </Link>
                    <form action={deleteQuizAdmin} className="flex-1">
                      <input type="hidden" name="quizId" value={q.id} />
                      <button
                        className="w-full rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                        type="submit"
                      >
                        🗑️ Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Performance Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <StudentPerformance attempts={attempts} quizzes={quizzes} />
        </div>
      </div>
    </div>
  );
}
