"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type ActionResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

export function ApproveButton({
  requestId,
  action,
}: {
  requestId: string;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("requestId", requestId);

      const result = await action(formData);

      if (result?.ok === false) {
        toast.error("Approval Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Approving..." : "✓ Approve"}
    </button>
  );
}

export function RejectButton({
  requestId,
  action,
}: {
  requestId: string;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this admin request?")) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("requestId", requestId);

      const result = await action(formData);

      if (result?.ok === false) {
        toast.error("Rejection Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleReject}
      disabled={isPending}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Rejecting..." : "✗ Reject"}
    </button>
  );
}

export function DeleteAdminButton({
  adminId,
  action,
}: {
  adminId: string;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this admin? This will also delete their site and all associated data.")) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("adminId", adminId);

      const result = await action(formData);

      if (result?.ok === false) {
        toast.error("Delete Failed", {
          description: result.error,
        });
      } else if (result?.ok === true) {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Deleting..." : "🗑 Delete"}
    </button>
  );
}
