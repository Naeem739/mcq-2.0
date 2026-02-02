import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import ExamUploadForm from "./ExamUploadForm";
import { createExam } from "./actions";

export const dynamic = "force-dynamic";

export default async function CreateExamPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
            Create Exam
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Schedule a timed exam with questions
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          <ExamUploadForm action={createExam} />
        </div>
      </div>
    </div>
  );
}
