"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuizCsv } from "@/lib/quizCsv";
import { isAdminAuthed } from "@/lib/adminAuth";

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
          hint: q.hint,
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
  if (!quizId) return;

  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath("/admin");
}

