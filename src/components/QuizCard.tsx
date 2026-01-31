"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteQuizButton from "./DeleteQuizButton";
import EditQuizModal from "./EditQuizModal";

type Question = {
  id: string;
  text: string;
  options: string[];
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
      <div className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{quiz.title}</h3>
          <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            <span>❓</span>
            <span className="font-semibold">{quiz._count.questions}</span>
            <span>{quiz._count.questions === 1 ? 'question' : 'questions'}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 text-center transition-colors"
          >
            ✏️ Edit
          </button>
          <Link
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors"
            href={`/practice/${quiz.id}`}
          >
            👁 Open
          </Link>
          <div>
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
