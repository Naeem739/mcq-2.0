import { getProfileData } from "./actions";
import Link from "next/link";

export const metadata = {
  title: "Student Profile",
};

export default async function ProfilePage() {
  const userData = await getProfileData();

  const stats = {
    totalAttempts: userData.attempts.length,
    totalCorrect: userData.attempts.reduce((sum: number, a: any) => sum + a.correctAnswers, 0),
    totalWrong: userData.attempts.reduce((sum: number, a: any) => sum + a.wrongAnswers, 0),
    totalSkipped: userData.attempts.reduce((sum: number, a: any) => sum + a.skippedQuestions, 0),
    totalQuestions: userData.attempts.reduce((sum: number, a: any) => sum + a.totalQuestions, 0),
    avgScore:
      userData.attempts.length > 0
        ? Math.round(
            (userData.attempts.reduce((sum: number, a: any) => sum + a.correctAnswers, 0) /
              userData.attempts.reduce((sum: number, a: any) => sum + a.totalQuestions, 0)) *
              100,
          )
        : 0,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg p-8 text-white">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-block rounded-full bg-white/20 px-3 py-1 mb-3 text-sm font-semibold">👤 Student Profile</div>
              <h1 className="text-4xl font-bold mb-2">{userData.name}</h1>
              <p className="text-blue-100 mb-1">{userData.email}</p>
              <p className="text-blue-100 text-sm">
                📅 Member since {new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex-shrink-0 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-blue-600 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalAttempts}</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Quizzes</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-green-500 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-1">✓ {stats.totalCorrect}</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Correct</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-red-500 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-red-600 mb-1">✕ {stats.totalWrong}</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Wrong</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-amber-500 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-amber-600 mb-1">⊘ {stats.totalSkipped}</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Skipped</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-purple-500 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.avgScore}%</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Avg Score</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md border-l-4 border-indigo-500 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-indigo-600 mb-1">❓ {stats.totalQuestions}</div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Questions</p>
          </div>
        </div>

        {/* Quiz Attempts */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-slate-200">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-900">📊 Quiz History</h2>
          </div>

          {userData.attempts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-lg font-medium text-slate-900 mb-2">No Quizzes Attempted Yet</p>
              <p className="text-slate-600 mb-6">Start taking quizzes to track your progress</p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all"
              >
                🏃 Take a Quiz Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Quiz</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">✓ Correct</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">✕ Wrong</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">⊘ Skipped</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Score</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.attempts.map((attempt: any, idx: number) => {
                    const score = Math.round(
                      (attempt.correctAnswers / attempt.totalQuestions) * 100,
                    );
                    const scoreColor = score >= 75 
                      ? "bg-green-50 text-green-700 border-l-4 border-green-500" 
                      : score >= 50 
                        ? "bg-amber-50 text-amber-700 border-l-4 border-amber-500" 
                        : "bg-red-50 text-red-700 border-l-4 border-red-500";
                    const scoreEmoji = score >= 75 ? "⭐" : score >= 50 ? "📈" : "📉";

                    return (
                      <tr
                        key={attempt.id}
                        className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {attempt.quiz.title}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-green-600">
                          {attempt.correctAnswers}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                          {attempt.wrongAnswers}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-amber-600">
                          {attempt.skippedQuestions}
                        </td>
                        <td className={`px-6 py-4 text-center text-sm font-bold ${scoreColor}`}>
                          {scoreEmoji} {score}%
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          {new Date(attempt.createdAt).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}
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
    </main>
  );
}
