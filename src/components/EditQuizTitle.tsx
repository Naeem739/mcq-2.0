"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

type UpdateResult = { ok: false; error: string } | { ok: true } | undefined;

export default function EditQuizTitle({
  quizId,
  currentTitle,
  action,
}: {
  quizId: string;
  currentTitle: string;
  action: (formData: FormData) => Promise<UpdateResult>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Sync title with prop changes
  useEffect(() => {
    if (!isEditing) {
      setTitle(currentTitle);
    }
  }, [currentTitle, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("quizId", quizId);
      formData.set("title", title.trim());

      const result = await action(formData);

      if (result?.ok === false) {
        setError(result.error);
        toast.error("Update Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        setIsEditing(false);
        setError(null);
        toast.success("Quiz title updated successfully");
      }
    });
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            autoFocus
            className="flex-1 w-full rounded-lg sm:rounded-xl border border-blue-300 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-zinc-900 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-lg sm:rounded-xl bg-blue-600 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-1 text-xs text-red-600">{error}</div>
        )}
      </form>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="truncate font-semibold text-sm sm:text-base text-zinc-900">
          {currentTitle}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-lg sm:rounded-xl border border-zinc-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
        title="Edit title"
      >
        Edit
      </button>
    </div>
  );
}
