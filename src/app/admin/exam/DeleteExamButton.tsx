"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteExam } from "./actions";

export default function DeleteExamButton({ examId, examTitle }: { examId: string; examTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${examTitle}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteExam(examId);

    if (result.ok) {
      toast.success("Exam deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete exam");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete exam"
    >
      {isDeleting ? "Deleting..." : "🗑️"}
    </button>
  );
}
