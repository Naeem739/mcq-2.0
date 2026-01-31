import Link from "next/link";
import { adminLogin } from "./actions";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = typeof sp.next === "string" ? sp.next : "/admin/upload";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">Admin Login</h1>
          <Link className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline" href="/">
            Home
          </Link>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
          <LoginForm nextPath={nextPath} action={adminLogin} />
          <div className="mt-6 border-t border-zinc-200 pt-6">
            <p className="text-center text-xs sm:text-sm text-zinc-600">
              Don't have admin access?{" "}
              <Link href="/admin/request" className="font-semibold text-blue-700 hover:underline">
                Request Admin Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

