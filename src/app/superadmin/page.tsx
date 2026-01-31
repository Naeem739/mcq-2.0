import { redirect } from "next/navigation";
import { isSuperAdminAuthed } from "@/lib/superAdminAuth";
import { prisma } from "@/lib/prisma";
import AdminRequestList from "./AdminRequestList";
import AdminList from "./AdminList";
import { approveAdminRequest, rejectAdminRequest, deleteAdmin } from "./actions";
import { superAdminLogout } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  if (!(await isSuperAdminAuthed())) {
    redirect("/superadmin/login");
  }

  const requests = await prisma.adminRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  const approvedRequests = await prisma.adminRequest.findMany({
    where: { 
      status: "approved",
      siteId: { not: null },
    },
    include: {
      site: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const admins = await prisma.admin.findMany({
    include: {
      site: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              Super Admin Panel
            </h1>
            <p className="text-base sm:text-lg text-slate-600">
              Manage admin requests and existing admins
            </p>
          </div>
          <form action={superAdminLogout}>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Pending Requests */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📋 Pending Admin Requests</h2>
          {requests.length === 0 ? (
            <p className="text-slate-600">No pending requests</p>
          ) : (
            <AdminRequestList 
              requests={requests} 
              onApprove={approveAdminRequest}
              onReject={rejectAdminRequest}
            />
          )}
        </div>

        {/* Approved Admins */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">✅ Approved Admins</h2>
          <AdminList 
            admins={admins}
            approvedRequests={approvedRequests}
            onDelete={deleteAdmin}
          />
        </div>
      </div>
    </div>
  );
}
