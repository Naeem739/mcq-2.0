"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type DeleteResult = { ok: false; error: string } | { ok: true; message?: string } | undefined;

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
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      type="button"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
