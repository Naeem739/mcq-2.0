"use server";

import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function submitQuizAttempt(data: {
  quizId: string;
  studentName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  startTime: string;
  endTime: string;
  totalTimeSeconds: number;
}) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return { ok: false as const, error: "Not authenticated" };
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        userId: user.userId,
        studentName: data.studentName,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        wrongAnswers: data.wrongAnswers,
        skippedQuestions: data.skippedQuestions,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        totalTimeSeconds: data.totalTimeSeconds,
      },
    });

    return { ok: true as const, attemptId: attempt.id };
  } catch (error) {
    console.error("Failed to submit quiz attempt:", error);
    return { ok: false as const, error: "Failed to save attempt" };
  }
}
