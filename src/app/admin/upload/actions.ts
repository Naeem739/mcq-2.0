"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuizCsv } from "@/lib/quizCsv";
import { parseQuizJson } from "@/lib/quizJson";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import * as XLSX from "xlsx";

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
    // CSV/XLSX mode
    if (!(file instanceof File)) {
      return { ok: false as const, error: "Please select a CSV or Excel file." };
    }

    const fileName = file.name.toLowerCase();
    let csvText = "";

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      csvText = XLSX.utils.sheet_to_csv(firstSheet, { blankrows: false });
    } else {
      csvText = await file.text();
    }

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
    title || (inputType === "csv" && file instanceof File ? file.name.replace(/\.(csv|xlsx|xls)$/i, "") : "Untitled Quiz");

  let quizId: string | null = null;
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
    quizId = quiz.id;
  } catch (error) {
    return { ok: false as const, error: "Failed to create quiz. Please try again." };
  }

  redirect(`/practice/${quizId}`);
}

