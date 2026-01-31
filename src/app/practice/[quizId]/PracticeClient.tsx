"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { submitQuizAttempt } from "./submitActions";

export type PracticeQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export default function PracticeClient({
  quizTitle,
  questions,
  quizId,
  studentName,
}: {
  quizTitle: string;
  questions: PracticeQuestion[];
  quizId: string;
  studentName: string;
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
  const [startTime] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);

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

  // Submit quiz attempt when showResult becomes true
  useEffect(() => {
    if (showResult && !submitted) {
      setSubmitted(true);
      const endTime = new Date();
      const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      submitQuizAttempt({
        quizId,
        studentName,
        totalQuestions: total,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        skippedQuestions: skipCount,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalTimeSeconds: timeTaken,
      }).then(result => {
        if (result.ok) {
          toast.success("Quiz submitted successfully!");
        } else {
          toast.error("Failed to save quiz", {
            description: result.error,
          });
        }
      }).catch(err => {
        console.error("Failed to submit quiz:", err);
        toast.error("Failed to save quiz");
      });
    }
  }, [showResult, submitted, quizId, studentName, total, correctCount, wrongCount, skipCount, startTime]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pb-24 sm:pb-28">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 pt-4 sm:pt-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="inline-block rounded-full bg-blue-100 px-3 py-1 mb-3">
              <span className="text-xs sm:text-sm font-semibold text-blue-700">{quizTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isReviewMode ? "Review Mode" : "Practice Quiz"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">Question {idx + 1} of {total}</p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            href="/"
          >
            ← Back
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 sm:mb-8 grid grid-cols-4 gap-2 sm:gap-4">
          <div className="rounded-xl bg-white p-3 sm:p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-600 mb-1">Progress</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{progressPct}%</div>
          </div>
          <div className="rounded-xl bg-green-50 p-3 sm:p-4 border border-green-200 shadow-sm">
            <div className="text-xs text-green-700 mb-1">Correct</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">✓ {correctCount}</div>
          </div>
          <div className="rounded-xl bg-red-50 p-3 sm:p-4 border border-red-200 shadow-sm">
            <div className="text-xs text-red-700 mb-1">Wrong</div>
            <div className="text-xl sm:text-2xl font-bold text-red-700">✕ {wrongCount}</div>
          </div>
          <div className={`rounded-xl p-3 sm:p-4 border shadow-sm ${
            timeLeft <= 60
              ? "bg-red-50 border-red-200"
              : timeLeft <= 180
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
          }`}>
            <div className={`text-xs mb-1 ${
              timeLeft <= 60
                ? "text-red-700"
                : timeLeft <= 180
                  ? "text-amber-700"
                  : "text-blue-700"
            }`}>Time Left</div>
            <div className={`text-xl sm:text-2xl font-bold tabular-nums ${
              timeLeft <= 60
                ? "text-red-700"
                : timeLeft <= 180
                  ? "text-amber-700"
                  : "text-blue-700"
            }`}>⏱ {formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 rounded-full bg-slate-200 h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {showResult ? (
          // Results Screen
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
              <p className="text-slate-600">Great job completing this quiz</p>
            </div>

            {/* Score Display */}
            <div className="mb-8 text-center">
              <div className="inline-block">
                <div className="text-6xl sm:text-7xl font-bold text-blue-600 mb-2">
                  {correctCount}<span className="text-3xl sm:text-4xl text-slate-400">/{total}</span>
                </div>
                <div className="text-sm text-slate-600">Your Score</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">✓ {correctCount}</div>
                <div className="text-xs text-green-700 font-medium">Correct</div>
              </div>
              <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-center">
                <div className="text-2xl font-bold text-red-700 mb-1">✕ {wrongCount}</div>
                <div className="text-xs text-red-700 font-medium">Wrong</div>
              </div>
              {skipCount > 0 && (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-center">
                  <div className="text-2xl font-bold text-amber-700 mb-1">⊘ {skipCount}</div>
                  <div className="text-xs text-amber-700 font-medium">Skipped</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={enterReviewMode}
                className="flex-1 rounded-xl sm:rounded-2xl border-2 border-slate-300 px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                📖 Review Answers
              </button>
              <button
                type="button"
                onClick={restart}
                className="flex-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                🔄 Practice Again
              </button>
            </div>
          </div>
        ) : (
          // Question Screen
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
            {/* Question */}
            <div className="mb-8">
              <div className="inline-block rounded-full bg-blue-100 px-3 py-1 mb-4">
                <span className="text-xs font-semibold text-blue-700">Question {idx + 1}/{total}</span>
              </div>
              <p
                className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-900"
                lang={isBangla(q.text) ? "bn" : "en"}
              >
                {q.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {q.options.map((opt, i) => {
                const optLang = isBangla(opt) ? "bn" : "en";
                const isSel = selected === i;
                const isCorrectAnswer = i === q.correctIndex;
                
                let showAsCorrect = false;
                let showAsWrong = false;
                
                if (isReviewMode) {
                  showAsCorrect = isCorrectAnswer;
                  showAsWrong = isSel && !isCorrectAnswer;
                } else {
                  if (checked) {
                    showAsCorrect = isSel && isCorrectAnswer;
                    showAsWrong = isSel && !isCorrectAnswer;
                  }
                }

                const baseBtn =
                  "w-full group rounded-xl sm:rounded-2xl border-2 px-4 sm:px-6 py-4 sm:py-5 text-left transition-all duration-200 flex items-start gap-4";
                
                const btnClass = showAsCorrect
                  ? `${baseBtn} border-green-500 bg-green-50 hover:bg-green-100`
                  : showAsWrong
                    ? `${baseBtn} border-red-500 bg-red-50 hover:bg-red-100`
                    : isSel
                      ? `${baseBtn} border-blue-500 bg-blue-50 hover:bg-blue-100`
                      : `${baseBtn} border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50`;

                return (
                  <button
                    key={`${q.id}-${i}`}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={checked || isReviewMode}
                    className={`${btnClass} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-300 disabled:hover:bg-white`}
                  >
                    <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full font-bold text-sm sm:text-base ring-2 transition-all ${
                      showAsCorrect
                        ? "bg-green-500 text-white ring-green-600"
                        : showAsWrong
                          ? "bg-red-500 text-white ring-red-600"
                          : isSel
                            ? "bg-blue-500 text-white ring-blue-600"
                            : "bg-slate-100 text-slate-600 ring-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:ring-blue-400"
                    }`}>
                      {String.fromCharCode("A".charCodeAt(0) + i)}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        lang={optLang}
                        className={`text-sm sm:text-base font-medium break-words ${
                          showAsCorrect
                            ? "text-green-900"
                            : showAsWrong
                              ? "text-red-900"
                              : isSel
                                ? "text-blue-900"
                                : "text-slate-900"
                        }`}
                      >
                        {opt}
                      </p>
                    </div>
                    {showAsCorrect && (
                      <div className="flex-shrink-0 text-green-600 font-bold">✓</div>
                    )}
                    {showAsWrong && (
                      <div className="flex-shrink-0 text-red-600 font-bold">✕</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instruction */}
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-600">
                💡 <span className="font-medium">{checked ? "Select Next to continue or Previous to review" : "Select an option to proceed"}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm z-40">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left font-medium">
              {showResult ? (
                <span>✓ Quiz completed • Score: <span className="text-blue-600 font-bold">{correctCount}/{total}</span></span>
              ) : (
                <span>{answeredCount} answered • {skipCount} skipped</span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={prev}
                disabled={idx === 0 || showResult}
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white transition-colors"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={restart}
                disabled={showResult}
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                🔄 Restart
              </button>

              <button
                type="button"
                onClick={showResult ? restart : next}
                disabled={showResult}
                className="flex-1 min-w-[100px] sm:flex-none sm:min-w-[140px] rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                {idx + 1 >= total ? "Finish" : checked ? "Next →" : "Skip →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

