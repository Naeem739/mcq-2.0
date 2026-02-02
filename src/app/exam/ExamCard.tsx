"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ExamCardProps = {
  exam: {
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    questionCount: number;
    hasAttempted: boolean;
  };
  isUpcoming: boolean;
  isFinished: boolean;
  isAdmin?: boolean;
};

export default function ExamCard({ exam, isUpcoming, isFinished, isAdmin }: ExamCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [examTimeRemaining, setExamTimeRemaining] = useState<string>("");
  const [isNowActive, setIsNowActive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const examTime = new Date(exam.scheduledAt).getTime();
      const examEnd = examTime + (exam.duration * 60 * 1000);
      const diff = examTime - now;
      const examDiff = examEnd - now;

      // Calculate countdown to exam start
      if (diff <= 0) {
        setIsNowActive(true);
        setTimeLeft("");
        
        // Calculate remaining time in the exam
        if (examDiff > 0) {
          const remainingMins = Math.floor(examDiff / (1000 * 60));
          const remainingSecs = Math.floor((examDiff % (1000 * 60)) / 1000);
          setExamTimeRemaining(`${remainingMins}m ${remainingSecs}s`);
        } else {
          setExamTimeRemaining("");
        }
        return;
      }

      setIsNowActive(false);
      setExamTimeRemaining("");
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [exam.scheduledAt, exam.duration]);

  const scheduledDate = new Date(exam.scheduledAt);

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-20 -mt-20" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                {exam.title}
              </h3>
              {exam.hasAttempted && (
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600 flex-wrap">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❓</span>
                <span>{exam.questionCount} questions</span>
              </div>
            </div>
          </div>

          {!isNowActive && timeLeft && (
            <div className="rounded-xl bg-yellow-100 px-4 py-3 text-center min-w-[140px]">
              <div className="text-xs font-semibold text-yellow-700 mb-1">Starts in</div>
              <div className="text-lg font-bold text-yellow-900">{timeLeft}</div>
            </div>
          )}

          {isNowActive && !isFinished && !exam.hasAttempted && (
            <div className="flex flex-col gap-2">
              <Link
                href={`/exam/${exam.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Start Exam
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {examTimeRemaining && (
                <div className="rounded-xl bg-blue-100 px-4 py-2 text-center">
                  <div className="text-xs font-semibold text-blue-700 mb-1">Window Closes In</div>
                  <div className="text-sm font-bold text-blue-900">{examTimeRemaining}</div>
                </div>
              )}
            </div>
          )}

          {isNowActive && !isFinished && exam.hasAttempted && (
            <div className="rounded-xl bg-blue-100 px-4 py-3 text-center min-w-[140px]">
              <div className="text-xs font-semibold text-blue-700 mb-1">Already Completed</div>
              {examTimeRemaining && (
                <div className="text-sm font-bold text-blue-900">{examTimeRemaining} left</div>
              )}
            </div>
          )}

          {isFinished && !isAdmin && (
            <div className="flex flex-col gap-2">
              <Link
                href={`/exam/${exam.id}?practice=true`}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                Practice
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {exam.hasAttempted && (
                <span className="inline-flex items-center justify-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
          )}
        </div>

        {!isNowActive && timeLeft && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              This exam will be available after the scheduled time. You cannot take it before then.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
