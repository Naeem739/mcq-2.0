"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuizCsv } from "@/lib/quizCsv";
import { parseQuizJson } from "@/lib/quizJson";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export async function uploadQuiz(formData: FormData) {
  if (!(await isAdminAuthed())) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }
  const siteId = await getAdminSiteId();
  if (!siteId) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const inputType = String(formData.get("inputType") ?? "csv");
  const file = formData.get("file");
  const jsonText = String(formData.get("jsonText") ?? "").trim();

  let questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
    hint?: string;
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

  const quizTitle =
    title || (inputType === "csv" && file instanceof File ? file.name.replace(/\.csv$/i, "") : "Untitled Quiz");

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: quizTitle,
        siteId: siteId,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            hint: q.hint,
          })),
        },
      },
      select: { id: true },
    });

    redirect(`/practice/${quiz.id}`);
  } catch (error) {
    return { ok: false as const, error: "Failed to create quiz. Please try again." };
  }
}

