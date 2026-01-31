"use client";

import { ApproveButton, RejectButton } from "@/components/SuperAdminButtons";

type AdminRequest = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type ActionResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

export default function AdminRequestList({
  requests,
  onApprove,
  onReject,
}: {
  requests: AdminRequest[];
  onApprove: (formData: FormData) => Promise<ActionResult>;
  onReject: (formData: FormData) => Promise<ActionResult>;
}) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">{request.name}</h3>
              <p className="text-sm text-slate-600 mb-2">{request.email}</p>
              <p className="text-xs text-slate-500">
                Requested: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <ApproveButton requestId={request.id} action={onApprove} />
              <RejectButton requestId={request.id} action={onReject} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
