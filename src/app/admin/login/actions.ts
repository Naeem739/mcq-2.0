"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminCredentials } from "@/lib/adminAuth";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const siteCode = String(formData.get("siteCode") ?? "").trim().toUpperCase();
  const nextPath = String(formData.get("next") ?? "/admin/upload");

  if (!email || !password || !siteCode) {
    return { ok: false as const, error: "Email, password, and site code are required." };
  }

  if (siteCode.length !== 12) {
    return { ok: false as const, error: "Site code must be 12 digits." };
  }

  const result = await verifyAdminCredentials(email, password, siteCode);

  if (!result) {
    return { ok: false as const, error: "Invalid email, password, or site code." };
  }

  const c = await cookies();
  c.set(ADMIN_COOKIE, JSON.stringify({ siteId: result.siteId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin/upload");
}

export async function adminLogout() {
  const c = await cookies();
  c.set(ADMIN_COOKIE, "0", { path: "/", maxAge: 0 });
  redirect("/admin/login");
}

