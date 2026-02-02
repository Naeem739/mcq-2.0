"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuizCsv } from "@/lib/quizCsv";
import { parseQuizJson } from "@/lib/quizJson";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import * as XLSX from "xlsx";

export async function createExam(formData: FormData) {
  if (!(await isAdminAuthed())) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }
  const siteId = await getAdminSiteId();
  if (!siteId) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const duration = parseInt(String(formData.get("duration") ?? "60"), 10);
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const inputType = String(formData.get("inputType") ?? "manual");
  const file = formData.get("file");
  const jsonText = String(formData.get("jsonText") ?? "").trim();
  const contentText = String(formData.get("contentText") ?? "").trim();
  const questionsData = String(formData.get("questionsData") ?? "").trim();

  if (!title) {
    return { ok: false as const, error: "Exam title is required." };
  }

  if (!scheduledAt) {
    return { ok: false as const, error: "Schedule date and time is required." };
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return { ok: false as const, error: "Invalid schedule date." };
  }

  if (scheduledDate < new Date()) {
    return { ok: false as const, error: "Schedule date must be in the future." };
  }

  if (duration < 1) {
    return { ok: false as const, error: "Duration must be at least 1 minute." };
  }

  let questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
  }> = [];
  let errors: string[] = [];

  // Parse questions based on input type (same logic as quiz upload)
  if (inputType === "manual") {
    if (!questionsData) {
      return { ok: false as const, error: "Please add at least one question." };
    }

    try {
      const manualQuestions = JSON.parse(questionsData);
      
      for (let i = 0; i < manualQuestions.length; i++) {
        const q = manualQuestions[i];
        
        if (!q.text?.trim()) {
          errors.push(`Question ${i + 1}: Question text is required`);
          continue;
        }
        if (!q.optionA?.trim() || !q.optionB?.trim() || !q.optionC?.trim() || !q.optionD?.trim()) {
          errors.push(`Question ${i + 1}: All four options are required`);
          continue;
        }
        
        const answerMap: { [key: string]: number } = { A: 0, B: 1, C: 2, D: 3 };
        const correctIndex = answerMap[q.answer];
        
        if (correctIndex === undefined) {
          errors.push(`Question ${i + 1}: Invalid answer selection`);
          continue;
        }

        questions.push({
          text: q.text.trim(),
          options: [q.optionA.trim(), q.optionB.trim(), q.optionC.trim(), q.optionD.trim()],
          correctIndex,
        });
      }
    } catch (error) {
      return { ok: false as const, error: "Failed to process manual questions." };
    }
  } else if (inputType === "content") {
    if (!contentText) {
      return { ok: false as const, error: "Please provide content text." };
    }

    try {
      const lines = contentText.split('\n').map(line => line.trim()).filter(line => line);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length < 6) {
          errors.push(`Line ${i + 1}: Not enough parts. Expected at least 6 (question, 4 options, answer)`);
          continue;
        }

        const questionText = parts.slice(0, -5).join(', ');
        const optionA = parts[parts.length - 5];
        const optionB = parts[parts.length - 4];
        const optionC = parts[parts.length - 3];
        const optionD = parts[parts.length - 2];
        const answer = parts[parts.length - 1].toUpperCase();

        if (!questionText) {
          errors.push(`Line ${i + 1}: Question text is required`);
          continue;
        }

        const answerMap: { [key: string]: number } = { A: 0, B: 1, C: 2, D: 3 };
        const correctIndex = answerMap[answer];

        if (correctIndex === undefined) {
          errors.push(`Line ${i + 1}: Invalid answer "${answer}". Must be A, B, C, or D`);
          continue;
        }

        questions.push({
          text: questionText,
          options: [optionA, optionB, optionC, optionD],
          correctIndex,
        });
      }
    } catch (error) {
      return { ok: false as const, error: "Failed to parse content text." };
    }
  } else if (inputType === "json") {
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

  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        duration,
        scheduledAt: scheduledDate,
        siteId,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        },
      },
      select: { id: true },
    });

    redirect(`/admin/exam/${exam.id}`);
  } catch (error: any) {
    // Don't catch redirect errors - they're intentional
    if (error?.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Create exam error:", error);
    return { ok: false as const, error: "Failed to create exam. Please try again." };
  }
}
