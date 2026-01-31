import Link from "next/link";
import SuperAdminLoginForm from "./SuperAdminLoginForm";
import { superAdminLogin } from "./actions";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Super Admin Login
          </h1>
          <Link className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline" href="/">
            Home
          </Link>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <SuperAdminLoginForm action={superAdminLogin} />
        </div>
      </div>
    </div>
  );
}
