"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteQuizButton from "./DeleteQuizButton";
import EditQuizModal from "./EditQuizModal";

type Question = {
  id: string;
  text: string;
  options: string[] | any; // Prisma Json type
  correctIndex: number;
};

type QuizWithCount = {
  id: string;
  title: string;
  createdAt: Date;
  questions: Question[];
  _count: {
    questions: number;
  };
};

type ActionResult = { ok: false; error: string } | { ok: true; message?: string } | undefined;

export default function QuizCard({
  quiz,
  updateContentAction,
  deleteAction,
}: {
  quiz: QuizWithCount;
  updateContentAction: (formData: FormData) => Promise<{ ok: false; error: string } | { ok: true; message: string } | undefined>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="group rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">{quiz.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {quiz._count.questions} {quiz._count.questions === 1 ? 'question' : 'questions'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
            <Link
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              href={`/practice/${quiz.id}`}
            >
              Open
            </Link>
            <DeleteQuizButton quizId={quiz.id} action={deleteAction} />
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditQuizModal
          quizId={quiz.id}
          currentTitle={quiz.title}
          existingQuestions={quiz.questions}
          questionCount={quiz._count.questions}
          action={updateContentAction}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
