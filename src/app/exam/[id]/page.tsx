import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import ExamClient from "./ExamClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ practice?: string }>;
};

export default async function ExamPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { practice } = await searchParams;
  const isPracticeMode = practice === "true";
  
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/login");
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          options: true,
          correctIndex: true,
        },
      },
    },
  });

  if (!exam) {
    redirect("/exam");
  }

  const now = new Date();
  const examStart = new Date(exam.scheduledAt);
  const examEnd = new Date(exam.scheduledAt.getTime() + exam.duration * 60000);
  const isExamWindowOpen = now >= examStart && now <= examEnd;
  const isExamFinished = now > examEnd;

  // Check if user already attempted this exam
  const existingAttempt = await prisma.examAttempt.findUnique({
    where: {
      examId_userId: {
        examId: id,
        userId: user.userId,
      },
    },
  });

  // Practice mode - allow only if exam window is closed
  if (isPracticeMode) {
    if (!isExamFinished) {
      redirect("/exam"); // Exam must be finished for practice mode
    }
    // Allow practice mode for all finished exams
  } else {
    // Regular exam mode - check if student can start the exam
    
    // Check if exam hasn't started yet
    if (now < examStart) {
      redirect("/exam");
    }

    // Check if exam window has closed (no new students can start)
    if (isExamFinished) {
      redirect("/exam");
    }

    // Check if user already started/submitted during the exam window
    if (existingAttempt) {
      redirect("/exam");
    }

    // Allow student to START the exam (they'll get full duration from their start time)
  }

  return (
    <ExamClient
      exam={{
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        scheduledAt: exam.scheduledAt,
        questions: exam.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options as string[],
          correctIndex: q.correctIndex,
        })),
      }}
      userId={user.userId}
      isPracticeMode={isPracticeMode}
    />
  );
}
