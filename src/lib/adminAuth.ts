import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mcq_admin";

// Hardcoded fallback (you can change it). Prefer setting ADMIN_PASSWORD in `.env`.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || "admin123";

export async function isAdminAuthed() {
  const c = await cookies();
  const v = c.get(ADMIN_COOKIE)?.value;
  return v === "1";
}

