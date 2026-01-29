"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_PASSWORD } from "@/lib/adminAuth";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (password.trim() !== ADMIN_PASSWORD) {
    return { ok: false as const, error: "Wrong password." };
  }

  const c = await cookies();
  c.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export async function adminLogout() {
  const c = await cookies();
  c.set(ADMIN_COOKIE, "0", { path: "/", maxAge: 0 });
  redirect("/admin/login");
}

