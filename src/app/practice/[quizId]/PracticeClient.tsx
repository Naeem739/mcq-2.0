"use client";

import { useMemo, useState } from "react";
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
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [showResult, setShowResult] = useState(false);

  const q = questions[idx];
  const selected = answers[idx];
  const checked = selected !== null;

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
    if (!checked) return;
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
  }

  const isFinished = showResult || answeredCount === total;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        {/* Top progress */}
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex w-full items-center gap-3">
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="min-w-[64px] text-right text-sm font-semibold tabular-nums text-zinc-700">
              {idx + 1} / {total}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold tabular-nums text-red-700 ring-1 ring-red-200">
              ✕ {wrongCount}
            </span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold tabular-nums text-green-700 ring-1 ring-green-200">
              ✓ {correctCount}
            </span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-blue-700">{quizTitle}</div>
            <div className="text-xs text-zinc-500">Question {idx + 1}</div>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            href="/"
          >
            Exit
          </Link>
        </div>

        {showResult ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-semibold text-blue-600">{quizTitle}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              Completed
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              Score: <span className="font-semibold text-zinc-900">{correctCount}</span> / {total}
            </div>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResult(false);
                  setIdx(0);
                }}
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Review
              </button>
              <button
                type="button"
                onClick={restart}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Practice again
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
            <div
              className="mb-5 text-lg font-semibold leading-8 text-zinc-900"
              lang={isBangla(q.text) ? "bn" : "en"}
            >
              {q.text}
            </div>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const optLang = isBangla(opt) ? "bn" : "en";
                const isSel = selected === i;
                const isCorrect = checked && i === q.correctIndex;
                const isWrong = checked && isSel && i !== q.correctIndex;

                const base =
                  "group w-full rounded-2xl border px-4 py-4 text-left text-base font-medium shadow-sm transition-colors";
                const cls = isCorrect
                  ? `${base} border-green-300 bg-green-50 text-zinc-900`
                  : isWrong
                    ? `${base} border-red-300 bg-red-50 text-zinc-900`
                    : isSel
                      ? `${base} border-blue-300 bg-blue-50 text-zinc-900`
                      : `${base} border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900`;

                return (
                  <button
                    key={`${q.id}-${i}`}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={checked}
                    className={`${cls} disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-50 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 group-hover:bg-white">
                      {String.fromCharCode("A".charCodeAt(0) + i)}
                    </span>
                    <span lang={optLang}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <details className="mt-6">
              <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-700 hover:text-zinc-900">
                Show hint
              </summary>
              <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                {q.hint?.trim() ? q.hint : "No hint for this question."}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          {showResult ? (
            <div className="text-sm font-medium text-zinc-700">
              Completed. Score:{" "}
              <span className="font-semibold text-zinc-900">
                {correctCount}/{total}
              </span>
            </div>
          ) : (
            <div className="text-sm text-zinc-500">
              {checked ? "Tap Next (or Previous)" : "Select an option"}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restart}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Restart
            </button>

            <button
              type="button"
              onClick={prev}
              disabled={idx === 0 || showResult}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={showResult ? restart : next}
              disabled={!checked || showResult}
              className="min-w-[180px] rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {idx + 1 >= total ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

