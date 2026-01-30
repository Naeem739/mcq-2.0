import Link from "next/link";
import LoginForm from "./LoginForm";
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">Log In</h1>
          <Link className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline" href="/">
            Home
          </Link>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
          <LoginForm action={loginAction} />

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <p className="text-center text-xs sm:text-sm text-zinc-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-blue-700 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
