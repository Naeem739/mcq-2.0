"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export async function deleteExam(examId: string) {
  try {
    if (!(await isAdminAuthed())) {
      return { ok: false as const, error: "Not authorized" };
    }

    const siteId = await getAdminSiteId();
    if (!siteId) {
      return { ok: false as const, error: "Not authorized" };
    }

    // Verify exam belongs to this admin's site
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        siteId,
      },
    });

    if (!exam) {
      return { ok: false as const, error: "Exam not found" };
    }

    // Delete exam (cascade will delete questions and attempts)
    await prisma.exam.delete({
      where: { id: examId },
    });

    revalidatePath("/admin/exam");
    return { ok: true as const };
  } catch (error) {
    console.error("Delete exam error:", error);
    return { ok: false as const, error: "Failed to delete exam" };
  }
}
