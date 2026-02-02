"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSolvedQuizIds } from "@/app/actions";

type QuizWithCount = {
  id: string;
  title: string;
  chapter: number;
  createdAt: Date;
  _count: {
    questions: number;
  };
};

type ChapterStats = {
  chapter: number;
  name: string;
  totalQuizzes: number;
  solvedQuizzes: number;
  totalQuestions: number;
  completionPercent: number;
};

export default function ChapterView({
  quizzes,
  solvedQuizIds: initialSolvedQuizIds,
}: {
  quizzes: QuizWithCount[];
  solvedQuizIds: string[];
}) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [solvedQuizIds, setSolvedQuizIds] = useState<string[]>(initialSolvedQuizIds);
  const solvedSet = new Set(solvedQuizIds);

  // Refresh solved quizzes every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const freshSolvedIds = await getSolvedQuizIds();
      setSolvedQuizIds(freshSolvedIds);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const chapterNames: { [key: number]: string } = {
    1: "তথ্য ও যোগাযোগ প্রযুক্তি",
    2: "কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং",
    3: "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
    4: "ওয়েব ডিজাইন ও HTML",
    5: "প্রোগ্রামিং ভাষা",
    6: "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম",
  };

  // Calculate chapter statistics
  const chapterStats: ChapterStats[] = Object.keys(chapterNames)
    .map((key) => {
      const chapter = parseInt(key);
      const chapterQuizzes = quizzes.filter((q) => q.chapter === chapter);
      const solvedCount = chapterQuizzes.filter((q) => solvedSet.has(q.id)).length;
      const totalQuestions = chapterQuizzes.reduce((sum, q) => sum + q._count.questions, 0);
      const completionPercent = chapterQuizzes.length > 0 ? Math.round((solvedCount / chapterQuizzes.length) * 100) : 0;

      return {
        chapter,
        name: chapterNames[chapter],
        totalQuizzes: chapterQuizzes.length,
        solvedQuizzes: solvedCount,
        totalQuestions,
        completionPercent,
      };
    })
    .filter((stat) => stat.totalQuizzes > 0); // Only show chapters with quizzes

  // If a chapter is selected, filter quizzes
  const displayQuizzes = selectedChapter
    ? quizzes.filter((q) => q.chapter === selectedChapter)
    : [];

  if (selectedChapter !== null) {
    const currentChapterStats = chapterStats.find((s) => s.chapter === selectedChapter);
    
    return (
      <div>
        {/* Back Button and Chapter Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedChapter(null)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chapters
          </button>

          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
                    {selectedChapter}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Chapter {selectedChapter}</h2>
                    <p className="text-slate-600">{currentChapterStats?.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentChapterStats?.completionPercent}%</div>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{currentChapterStats?.solvedQuizzes}/{currentChapterStats?.totalQuizzes}</div>
                  <p className="text-sm text-slate-600">Quizzes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayQuizzes.map((q) => {
            const isSolved = solvedSet.has(q.id);

            return (
              <Link
                key={q.id}
                href={`/practice/${q.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-16 -mt-16" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors break-words">
                        {q.title}
                      </h3>
                    </div>
                    {isSolved && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Solved</span>
                        </div>
                      </div>
                    )}
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
            );
          })}
        </div>
      </div>
    );
  }

  // Show chapter cards
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Chapters</h2>
        <p className="text-slate-600 text-sm">Select a chapter to start practicing</p>
      </div>

      {chapterStats.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-slate-600 text-sm">No quizzes available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapterStats.map((stat) => (
            <button
              key={stat.chapter}
              onClick={() => setSelectedChapter(stat.chapter)}
              className="rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white font-bold text-lg flex-shrink-0">
                  {stat.chapter}
                </div>
                {stat.completionPercent === 100 && (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {stat.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Quizzes</span>
                  <span className="font-medium text-slate-900">{stat.totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Questions</span>
                  <span className="font-medium text-slate-900">{stat.totalQuestions}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">{stat.completionPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${stat.completionPercent}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
