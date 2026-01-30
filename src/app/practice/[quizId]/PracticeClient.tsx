"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";

export type PracticeQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  hint?: string | null;
};

export default function PracticeClient({
  quizTitle,
  questions,
}: {
  quizTitle: string;
  questions: PracticeQuestion[];
}) {
  const isBangla = (s: string) => /[\u0980-\u09FF]/.test(s);
  const total = questions.length;
  const totalTimeInMinutes = total; // Total time in minutes = number of questions
  const totalTimeInSeconds = totalTimeInMinutes * 60; // Convert to seconds
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeInSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[idx];
  const selected = answers[idx];
  const checked = selected !== null;

  // Overall quiz timer effect
  useEffect(() => {
    if (showResult || isReviewMode) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start overall countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - go to results immediately
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showResult, isReviewMode]);

  const correctCount = useMemo(
    () =>
      answers.reduce<number>(
        (acc, a, i) => acc + (a !== null && a === questions[i]!.correctIndex ? 1 : 0),
        0,
      ),
    [answers, questions],
  );
  const wrongCount = useMemo(
    () =>
      answers.reduce<number>(
        (acc, a, i) => acc + (a !== null && a !== questions[i]!.correctIndex ? 1 : 0),
        0,
      ),
    [answers, questions],
  );
  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const skipCount = useMemo(() => answers.filter((a) => a === null).length, [answers]);

  const progressPct = useMemo(() => {
    if (!total) return 0;
    return Math.round(((idx + 1) / total) * 100);
  }, [idx, total]);

  function choose(i: number) {
    // Only allow selecting once per question
    if (answers[idx] !== null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = i;
      return next;
    });
  }

  function next() {
    if (idx + 1 >= total) {
      setShowResult(true);
      return;
    }
    setIdx((x) => x + 1);
  }

  function prev() {
    if (idx <= 0) return;
    setIdx((x) => Math.max(0, x - 1));
  }

  function restart() {
    setIdx(0);
    setAnswers(Array(total).fill(null));
    setShowResult(false);
    setIsReviewMode(false);
    setTimeLeft(totalTimeInSeconds);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function enterReviewMode() {
    setIsReviewMode(true);
    setShowResult(false);
    setIdx(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const isFinished = showResult || answeredCount === total;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 sm:pb-28">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 pt-4 sm:pt-8">
        {/* Top progress */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-sm">
          <div className="flex w-full items-center gap-2 sm:gap-3">
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="min-w-[48px] sm:min-w-[64px] text-right text-xs sm:text-sm font-semibold tabular-nums text-zinc-700">
              {idx + 1} / {total}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!showResult && !isReviewMode && (
              <span className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold tabular-nums ring-2 ${
                timeLeft <= 60
                  ? "bg-red-100 text-red-700 ring-red-300"
                  : timeLeft <= 180
                    ? "bg-orange-100 text-orange-700 ring-orange-300"
                    : "bg-blue-100 text-blue-700 ring-blue-300"
              }`}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
            <span className="rounded-full bg-red-50 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold tabular-nums text-red-700 ring-1 ring-red-200">
              ✕ {wrongCount}
            </span>
            <span className="rounded-full bg-green-50 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold tabular-nums text-green-700 ring-1 ring-green-200">
              ✓ {correctCount}
            </span>
          </div>
        </div>

        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs sm:text-sm font-semibold text-blue-700">{quizTitle}</div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-500">Question {idx + 1}</div>
              {isReviewMode && (
                <div className="text-xs text-blue-600 font-semibold">Review Mode</div>
              )}
            </div>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 transition-colors"
            href="/"
          >
            Exit
          </Link>
        </div>

        {showResult ? (
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-sm">
            <div className="text-xs sm:text-sm font-semibold text-blue-600">{quizTitle}</div>
            <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Completed
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-zinc-600">
                Score: <span className="font-semibold text-zinc-900">{correctCount}</span> / {total}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-semibold text-green-700 ring-1 ring-green-200">
                  <span>✓</span>
                  <span>Correct: {correctCount}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700 ring-1 ring-red-200">
                  <span>✕</span>
                  <span>Wrong: {wrongCount}</span>
                </span>
                {skipCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 font-semibold text-yellow-700 ring-1 ring-yellow-200">
                    <span>⊘</span>
                    <span>Skipped: {skipCount}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
              <button
                type="button"
                onClick={enterReviewMode}
                className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl border border-zinc-200 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Review
              </button>
              <button
                type="button"
                onClick={restart}
                className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl bg-blue-600 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Practice again
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-7 shadow-sm">
            <div
              className="mb-4 sm:mb-5 text-base sm:text-lg font-semibold leading-7 sm:leading-8 text-zinc-900"
              lang={isBangla(q.text) ? "bn" : "en"}
            >
              {q.text}
            </div>

            <div className="space-y-2 sm:space-y-3">
              {q.options.map((opt, i) => {
                const optLang = isBangla(opt) ? "bn" : "en";
                const isSel = selected === i;
                const isCorrectAnswer = i === q.correctIndex;
                
                // In review mode, show all correct answers
                // In practice mode, only show verdict (correct/wrong) for selected answer
                let showAsCorrect = false;
                let showAsWrong = false;
                
                if (isReviewMode) {
                  // Review mode: show correct answer always
                  showAsCorrect = isCorrectAnswer;
                  showAsWrong = isSel && !isCorrectAnswer;
                } else {
                  // Practice mode: only show verdict for selected answer
                  if (checked) {
                    showAsCorrect = isSel && isCorrectAnswer;
                    showAsWrong = isSel && !isCorrectAnswer;
                  }
                }

                const base =
                  "group w-full rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-3 sm:py-4 text-left text-sm sm:text-base font-medium shadow-sm transition-all duration-200";
                const cls = showAsCorrect
                  ? `${base} border-green-600 bg-green-100 text-zinc-900 shadow-green-200`
                  : showAsWrong
                    ? `${base} border-red-600 bg-red-100 text-zinc-900 shadow-red-200`
                    : isSel
                      ? `${base} border-blue-400 bg-blue-100 text-zinc-900`
                      : `${base} border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-900`;

                return (
                  <button
                    key={`${q.id}-${i}`}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={checked || isReviewMode}
                    className={`${cls} disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <span className={`mr-2 sm:mr-3 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-semibold ring-1 transition-colors ${
                      showAsCorrect
                        ? "bg-green-600 text-white ring-green-700"
                        : showAsWrong
                          ? "bg-red-600 text-white ring-red-700"
                          : isSel
                            ? "bg-blue-500 text-white ring-blue-600"
                            : "bg-zinc-50 text-zinc-700 ring-zinc-200 group-hover:bg-white"
                    }`}>
                      {String.fromCharCode("A".charCodeAt(0) + i)}
                    </span>
                    <span lang={optLang} className="break-words">{opt}</span>
                    {isReviewMode && isCorrectAnswer && (
                      <span className="ml-2 text-xs font-semibold text-green-700">✓ Correct</span>
                    )}
                  </button>
                );
              })}
            </div>

            <details className="mt-4 sm:mt-6">
              <summary className="cursor-pointer select-none text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-900">
                Show hint
              </summary>
              <div className="mt-2 sm:mt-3 rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-zinc-700">
                {q.hint?.trim() ? q.hint : "No hint for this question."}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur z-40">
        <div className="mx-auto flex max-w-3xl flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
          {showResult ? (
            <div className="text-xs sm:text-sm font-medium text-zinc-700 text-center sm:text-left">
              Completed. Score:{" "}
              <span className="font-semibold text-zinc-900">
                {correctCount}/{total}
              </span>
              {skipCount > 0 && (
                <span className="ml-2 text-zinc-500">
                  (Skipped: {skipCount})
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-zinc-500 text-center sm:text-left">
              {checked ? "Tap Next (or Previous)" : "Select an option or skip"}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restart}
              className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
            >
              Restart
            </button>

            <button
              type="button"
              onClick={prev}
              disabled={idx === 0 || showResult}
              className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={showResult ? restart : next}
              disabled={showResult}
              className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[180px] rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {idx + 1 >= total ? "Finish" : checked ? "Next" : "Skip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

