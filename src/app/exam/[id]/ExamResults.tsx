"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ResultsProps = {
  examTitle: string;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  examId: string;
};

export default function ExamResults({
  examTitle,
  correctCount,
  totalQuestions,
  timeTaken,
  examId,
}: ResultsProps) {
  const router = useRouter();
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const wrongCount = totalQuestions - correctCount;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  // Determine performance level
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (percentage >= 75) return { level: "Good", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (percentage >= 60) return { level: "Average", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return { level: "Needs Improvement", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Confetti-like decoration */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 75 ? "🎉" : percentage >= 60 ? "✨" : "📝"}
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              {examTitle}
            </h1>
            <p className="text-slate-600">Exam Submitted Successfully</p>
          </div>

          {/* Score Section */}
          <div className={`rounded-2xl ${performance.bg} border-2 ${performance.border} p-8 mb-8`}>
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-bold mb-4">
                <span className={performance.color}>{percentage}%</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {performance.level}
              </div>
              <p className="text-slate-600 text-lg">
                You scored {correctCount} out of {totalQuestions} questions
              </p>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{correctCount}</div>
              <p className="text-sm text-green-700 font-semibold">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{wrongCount}</div>
              <p className="text-sm text-red-700 font-semibold">Wrong</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <p className="text-sm text-blue-700 font-semibold">Time Taken</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Accuracy Rate</span>
                <span className="font-semibold text-slate-900">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-slate-600">Average per question</span>
                <span className="font-semibold text-slate-900">
                  {(timeTaken / totalQuestions).toFixed(1)} seconds
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/exam/${examId}?practice=true`}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-purple-600 text-white font-semibold py-3 hover:bg-purple-700 transition-colors"
            >
              📖 Practice Mode
            </Link>
            <Link
              href="/exam"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition-colors"
            >
              📋 Back to Exams
            </Link>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="text-center">
          {percentage >= 75 && (
            <p className="text-lg text-slate-600">
              🌟 Great job! Keep practicing to improve further.
            </p>
          )}
          {percentage < 75 && percentage >= 60 && (
            <p className="text-lg text-slate-600">
              💪 Good effort! Review your weak areas and try again.
            </p>
          )}
          {percentage < 60 && (
            <p className="text-lg text-slate-600">
              📚 Don't worry! More practice will help. Try again later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
