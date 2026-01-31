import Link from "next/link";
import AdminRequestForm from "./AdminRequestForm";
import { submitAdminRequest } from "./actions";

export default function AdminRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Request Admin Access
          </h1>
          <Link className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline" href="/">
            Home
          </Link>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-6">
            Fill out the form below to request admin access. Your request will be reviewed by the Super Admin.
          </p>
          
          <AdminRequestForm action={submitAdminRequest} />

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-center text-xs sm:text-sm text-slate-600">
              Already have admin access?{" "}
              <Link href="/admin/login" className="font-semibold text-blue-700 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
