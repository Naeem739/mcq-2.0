"use server";

import { prisma } from "@/lib/prisma";

type SubmitExamInput = {
  examId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
  }[];
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
};

export async function submitExam(input: SubmitExamInput) {
  try {
    const { examId, userId, answers, correctCount, totalQuestions, timeTaken } = input;

    // Check if user already attempted (race condition protection)
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_userId: {
          examId,
          userId,
        },
      },
    });

    if (existingAttempt) {
      return { success: false, error: "You have already attempted this exam" };
    }

    // Get user name for the attempt record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const correctAnswersCount = correctCount;
    const wrongAnswersCount = answers.filter(a => a.selectedIndex !== a.correctIndex && a.selectedIndex !== -1).length;
    const skippedCount = answers.filter(a => a.selectedIndex === -1).length;
    const startTime = new Date(Date.now() - timeTaken * 60 * 1000); // Calculate start time from end time

    // Create exam attempt
    await prisma.examAttempt.create({
      data: {
        examId,
        userId,
        studentName: user?.name || "Unknown",
        totalQuestions,
        correctAnswers: correctAnswersCount,
        wrongAnswers: wrongAnswersCount,
        skippedQuestions: skippedCount,
        startTime,
        endTime: new Date(),
        totalTimeSeconds: timeTaken * 60,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Submit exam error:", error);
    
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return { success: false, error: "You have already attempted this exam" };
    }

    return { success: false, error: "Failed to submit exam" };
  }
}
