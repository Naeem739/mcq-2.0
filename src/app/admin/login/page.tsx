import Link from "next/link";
import { adminLogin } from "./actions";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = typeof sp.next === "string" ? sp.next : "/admin";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Admin Login</h1>
          <Link className="text-sm font-semibold text-blue-700 hover:underline" href="/">
            Home
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm nextPath={nextPath} action={adminLogin} />
          <p className="mt-4 text-xs text-zinc-500">
            Tip: set <span className="font-mono">ADMIN_PASSWORD</span> in your <span className="font-mono">.env</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

