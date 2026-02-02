"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function getSolvedQuizIds() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true },
      distinct: ['quizId'],
    });

    return attempts.map(a => a.quizId);
  } catch (error) {
    console.error("Error fetching solved quizzes:", error);
    return [];
  }
}
