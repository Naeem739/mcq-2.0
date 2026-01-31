"use client";

import { DeleteAdminButton } from "@/components/SuperAdminButtons";

type Admin = {
  id: string;
  name: string;
  email: string;
  site: {
    name: string;
    code: string;
  };
  createdAt: Date;
};

type ApprovedRequest = {
  id: string;
  name: string;
  email: string;
  siteCode: string | null;
  site: {
    name: string;
    code: string;
  } | null;
};

type ActionResult = { ok: false; error: string } | { ok: true; message: string } | undefined;

export default function AdminList({
  admins,
  approvedRequests,
  onDelete,
}: {
  admins: Admin[];
  approvedRequests: ApprovedRequest[];
  onDelete: (formData: FormData) => Promise<ActionResult>;
}) {
  return (
    <div className="space-y-4">
      {admins.length === 0 ? (
        <p className="text-slate-600">No approved admins yet</p>
      ) : (
        admins.map((admin) => (
          <div
            key={admin.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{admin.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{admin.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Site: {admin.site.name}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 font-mono">
                    Code: {admin.site.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Created: {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
              <DeleteAdminButton adminId={admin.id} action={onDelete} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
