"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitExam } from "./actions";
import ExamResults from "./ExamResults";

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

type ExamClientProps = {
  exam: {
    id: string;
    title: string;
    duration: number;
    scheduledAt: Date;
    questions: Question[];
  };
  userId: string;
  isPracticeMode?: boolean;
};

export default function ExamClient({ exam, userId, isPracticeMode = false }: ExamClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60); // Start with full duration in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState<{
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
  } | null>(null);

  const currentQuestion = exam.questions[currentIndex];

  // Countdown timer (only in exam mode)
  useEffect(() => {
    if (isPracticeMode || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPracticeMode]);

  // Auto-submit when time is up (only in exam mode)
  useEffect(() => {
    if (!isPracticeMode && timeLeft === 0 && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitting, isPracticeMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    
    // In practice mode, show immediate feedback
    if (isPracticeMode) {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Seconds

    const answers = exam.questions.map((q, idx) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[idx] ?? -1,
      correctIndex: q.correctIndex,
    }));

    const correctCount = answers.filter(
      (a) => a.selectedIndex === a.correctIndex
    ).length;

    // In practice mode, show results with local calculation
    if (isPracticeMode) {
      setExamResults({
        correctCount,
        totalQuestions: exam.questions.length,
        timeTaken,
      });
      setShowResults(true);
      return;
    }

    // Regular exam mode - submit to server
    const result = await submitExam({
      examId: exam.id,
      userId,
      answers,
      correctCount,
      totalQuestions: exam.questions.length,
      timeTaken: Math.floor(timeTaken / 60), // Convert to minutes for storage
    });

    if (result.success) {
      // Show results immediately
      setExamResults({
        correctCount,
        totalQuestions: exam.questions.length,
        timeTaken,
      });
      setShowResults(true);
    } else {
      // If already submitted, just redirect to exam list
      if (result.error?.includes("already attempted")) {
        router.push("/exam");
      } else {
        alert(result.error || "Failed to submit exam");
        setIsSubmitting(false);
      }
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / exam.questions.length) * 100;

  // Show results screen
  if (showResults && examResults) {
    return (
      <ExamResults
        examTitle={exam.title}
        correctCount={examResults.correctCount}
        totalQuestions={examResults.totalQuestions}
        timeTaken={examResults.timeTaken}
        examId={exam.id}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
                {isPracticeMode && (
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Practice Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Question {currentIndex + 1} of {exam.questions.length}</span>
                <span>•</span>
                <span>Answered: {answeredCount}/{exam.questions.length}</span>
              </div>
            </div>
            {!isPracticeMode && (
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 mb-1">Time Remaining</div>
                <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold mb-4">
              Question {currentIndex + 1}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              const showResult = isPracticeMode && showFeedback;
              
              let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-100 shadow-md";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-100 shadow-md";
                } else {
                  buttonClass += "border-slate-200 bg-slate-50";
                }
              } else {
                buttonClass += isSelected
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-slate-200 bg-slate-50 hover:border-green-300 hover:bg-green-50/50";
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        showResult && isCorrect
                          ? "border-green-500 bg-green-500"
                          : showResult && isSelected && !isCorrect
                          ? "border-red-500 bg-red-500"
                          : isSelected
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {((showResult && isCorrect) || (!showResult && isSelected)) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base ${isSelected || (showResult && isCorrect) ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {!isPracticeMode && (
            <div className="flex-1 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
            </div>
          )}
          {isPracticeMode && (
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => router.push("/exam")}
                className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Exit Practice
              </button>
            </div>
          )}

          {currentIndex < exam.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <div className="w-32" /> // Placeholder for layout balance
          )}
        </div>

        {/* Warning if time is low */}
        {!isPracticeMode && timeLeft < 300 && timeLeft > 0 && (
          <div className="mt-6 bg-red-100 border-2 border-red-300 rounded-xl p-4 text-center">
            <p className="text-red-800 font-semibold">
              ⚠️ Less than 5 minutes remaining! Your exam will auto-submit when time runs out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
