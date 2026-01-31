"use server";

import { redirect } from "next/navigation";
import { clearSuperAdminCookie, setSuperAdminCookie, SUPER_ADMIN_PASSWORD } from "@/lib/superAdminAuth";

export async function superAdminLogin(formData: FormData) {
  const password = formData.get("password") as string;
  
  if (password !== SUPER_ADMIN_PASSWORD) {
    return { ok: false as const, error: "Invalid password" };
  }
  
  // Set authentication cookie
  await setSuperAdminCookie();
  redirect("/superadmin");
}

export async function superAdminLogout() {
  await clearSuperAdminCookie();
  redirect("/superadmin/login");
}
