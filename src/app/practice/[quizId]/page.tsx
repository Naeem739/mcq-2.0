import { notFound } from "next/navigation";
import PracticeClient, { type PracticeQuestion } from "./PracticeClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Question type from database
 */
type QuestionFromDB = {
  id: string;
  text: string;
  options: unknown;
  correctIndex: number;
  hint: string | null;
  createdAt: Date;
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!quiz) notFound();
  if (quiz.questions.length === 0) notFound();

  const questions: PracticeQuestion[] = quiz.questions.map((q: QuestionFromDB) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    correctIndex: q.correctIndex,
    hint: q.hint,
  }));

  // If any row is malformed, fail fast.
  if (questions.some((q: PracticeQuestion) => q.options.length < 2)) notFound();

  return <PracticeClient quizTitle={quiz.title} questions={questions} />;
}
