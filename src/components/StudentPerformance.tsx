"use client";

import { useState, useMemo } from "react";

type QuizAttempt = {
  id: string;
  studentName: string;
  quiz: {
    id: string;
    title: string;
  };
  user?: {
    email: string;
  };
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  startTime: Date;
  endTime: Date;
  totalTimeSeconds: number;
  createdAt: Date;
};

type AttemptWithRank = QuizAttempt & {
  totalMarks: number;
  rank: number;
};

export default function StudentPerformance({
  attempts,
  quizzes,
}: {
  attempts: QuizAttempt[];
  quizzes: Array<{ id: string; title: string }>;
}) {
  const [selectedQuizId, setSelectedQuizId] = useState<string>("all");

  const filteredAttempts = useMemo(() => {
    if (selectedQuizId === "all") return attempts;
    return attempts.filter((a) => a.quiz?.id === selectedQuizId);
  }, [attempts, selectedQuizId]);

  const attemptsWithRank = useMemo(() => {
    // Calculate total marks (correct answers) for ranking
    const sortedByMarks = [...filteredAttempts].sort(
      (a, b) => b.correctAnswers - a.correctAnswers
    );

    return filteredAttempts.map((attempt) => {
      const rank =
        sortedByMarks.findIndex(
          (a) =>
            a.id === attempt.id ||
            (a.studentName === attempt.studentName &&
              a.quiz?.id === attempt.quiz?.id &&
              a.correctAnswers === attempt.correctAnswers)
        ) + 1;

      return {
        ...attempt,
        totalMarks: attempt.correctAnswers,
        rank,
      };
    });
  }, [filteredAttempts]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Student Performance</h2>

        {/* Quiz Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Filter by Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          >
            <option value="all">All Quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-zinc-200 bg-blue-50 p-4">
            <div className="text-xs sm:text-sm text-zinc-600">Total Attempts</div>
            <div className="text-2xl font-bold text-blue-700">{attemptsWithRank.length}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-green-50 p-4">
            <div className="text-xs sm:text-sm text-zinc-600">Avg Score</div>
            <div className="text-2xl font-bold text-green-700">
              {attemptsWithRank.length > 0
                ? (
                    attemptsWithRank.reduce((sum, a) => sum + a.correctAnswers, 0) /
                    attemptsWithRank.length
                  ).toFixed(1)
                : "0"}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-purple-50 p-4">
            <div className="text-xs sm:text-sm text-zinc-600">Highest Score</div>
            <div className="text-2xl font-bold text-purple-700">
              {attemptsWithRank.length > 0
                ? Math.max(...attemptsWithRank.map((a) => a.correctAnswers))
                : "0"}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-orange-50 p-4">
            <div className="text-xs sm:text-sm text-zinc-600">Unique Students</div>
            <div className="text-2xl font-bold text-orange-700">
              {new Set(attemptsWithRank.map((a) => a.studentName)).size}
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="rounded-lg border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">MCQ Title</th>
                <th className="px-4 py-3 text-center font-semibold text-zinc-700">
                  Correct
                </th>
                <th className="px-4 py-3 text-center font-semibold text-zinc-700">Wrong</th>
                <th className="px-4 py-3 text-center font-semibold text-zinc-700">Skipped</th>
                <th className="px-4 py-3 text-center font-semibold text-zinc-700">
                  Time Taken
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                  Test Time
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {attemptsWithRank.length > 0 ? (
                attemptsWithRank.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                        {attempt.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {attempt.studentName}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{attempt.quiz?.title || "N/A"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        {attempt.correctAnswers}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        {attempt.wrongAnswers}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs">
                        {attempt.skippedQuestions}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-700">
                      {formatTime(attempt.totalTimeSeconds)}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {formatDateTime(attempt.startTime)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-sm">
                      {attempt.user?.email || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    No quiz attempts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
