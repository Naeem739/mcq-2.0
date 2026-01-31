"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuizCsv } from "@/lib/quizCsv";
import { parseQuizJson } from "@/lib/quizJson";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export async function uploadQuizAdmin(formData: FormData) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false as const, error: "Please select a CSV file." };
  }

  const csvText = await file.text();
  const { questions, errors } = parseQuizCsv(csvText);
  if (errors.length) {
    return { ok: false as const, error: errors.slice(0, 8).join("\n") };
  }

  const quizTitle = title || file.name.replace(/\.csv$/i, "");

  await prisma.quiz.create({
    data: {
      title: quizTitle,
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
        })),
      },
    },
  });

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteQuizAdmin(formData: FormData) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const quizId = String(formData.get("quizId") ?? "");
  if (!quizId) return { ok: false as const, error: "Quiz ID is required" };

  try {
    await prisma.quiz.delete({ where: { id: quizId } });
    revalidatePath("/admin");
    revalidatePath("/admin/upload");
    return { ok: true as const, message: "Quiz deleted successfully" };
  } catch (error) {
    return { ok: false as const, error: "Failed to delete quiz" };
  }
}

export async function updateQuizTitle(formData: FormData) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const quizId = String(formData.get("quizId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!quizId) {
    return { ok: false as const, error: "Quiz ID is required." };
  }

  if (!title) {
    return { ok: false as const, error: "Title cannot be empty." };
  }

  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { title },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/upload");
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: "Failed to update quiz title." };
  }
}

export async function updateQuizContent(formData: FormData) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const siteId = await getAdminSiteId();
  if (!siteId) redirect("/admin/login");

  const quizId = String(formData.get("quizId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const inputType = String(formData.get("inputType") ?? "csv");
  const file = formData.get("file");
  const jsonText = String(formData.get("jsonText") ?? "").trim();

  if (!quizId) {
    return { ok: false as const, error: "Quiz ID is required." };
  }

  if (!title) {
    return { ok: false as const, error: "Title cannot be empty." };
  }

  let questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
  }> = [];
  let errors: string[] = [];

  if (inputType === "json") {
    if (!jsonText) {
      return { ok: false as const, error: "Please provide JSON text." };
    }
    const result = parseQuizJson(jsonText);
    questions = result.questions;
    errors = result.errors;
  } else {
    // CSV mode
    if (!(file instanceof File)) {
      return { ok: false as const, error: "Please select a CSV file." };
    }
    const csvText = await file.text();
    const result = parseQuizCsv(csvText);
    questions = result.questions;
    errors = result.errors;
  }

  if (errors.length) {
    return { ok: false as const, error: errors.slice(0, 8).join("\n") };
  }

  if (questions.length === 0) {
    return { ok: false as const, error: "No valid questions found." };
  }

  try {
    // Delete existing questions and update quiz in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing questions
      await tx.question.deleteMany({
        where: { quizId },
      });

      // Update quiz with new title and questions
      await tx.quiz.update({
        where: { id: quizId },
        data: {
          title,
          questions: {
            create: questions.map((q) => ({
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
            })),
          },
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/upload");
    revalidatePath("/");
    return { ok: true as const, message: "Quiz updated successfully" };
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return { ok: false as const, error: "Failed to update quiz." };
  }
}
