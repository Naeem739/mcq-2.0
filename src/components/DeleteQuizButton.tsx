"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type DeleteResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

export default function DeleteQuizButton({
  quizId,
  action,
}: {
  quizId: string;
  action: (formData: FormData) => Promise<DeleteResult>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("quizId", quizId);

      const result = await action(formData);

      if (result?.ok === false) {
        toast.error("Delete Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        toast.success(result.message || "Quiz deleted successfully");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-full rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      type="button"
    >
      {isPending ? "⏳ Deleting..." : "🗑️ Delete"}
    </button>
  );
}
