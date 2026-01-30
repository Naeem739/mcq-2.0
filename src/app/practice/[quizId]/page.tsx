import { notFound } from "next/navigation";
import PracticeClient, { type PracticeQuestion } from "./PracticeClient";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Question type from database
 */
type QuestionFromDB = {
  id: string;
  text: string;
  options: unknown;
  correctIndex: number;
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
  }));

  // If any row is malformed, fail fast.
  if (questions.some((q: PracticeQuestion) => q.options.length < 2)) notFound();

  const user = await getUserFromCookie();
  let studentName = "Anonymous";
  
  if (user?.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });
    if (dbUser?.name) {
      studentName = dbUser.name;
    }
  }

  return <PracticeClient quizId={quizId} quizTitle={quiz.title} questions={questions} studentName={studentName} />;
}
