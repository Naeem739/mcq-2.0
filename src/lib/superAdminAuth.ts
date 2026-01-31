import { cookies } from "next/headers";

export const SUPER_ADMIN_COOKIE = "mcq_super_admin";
export const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || "superadmin123";

export async function isSuperAdminAuthed() {
  const c = await cookies();
  const cookieValue = c.get(SUPER_ADMIN_COOKIE)?.value;
  return cookieValue === "1";
}

export async function setSuperAdminCookie() {
  const c = await cookies();
  c.set(SUPER_ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSuperAdminCookie() {
  const c = await cookies();
  c.set(SUPER_ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}
