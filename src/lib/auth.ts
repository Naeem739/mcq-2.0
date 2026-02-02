import { cookies } from "next/headers";
import crypto from "crypto";

export const USER_COOKIE = "mcq_user";

export async function isUserAuthed() {
  const c = await cookies();
  const v = c.get(USER_COOKIE)?.value;
  return !!v;
}

export async function getUserFromCookie() {
  const c = await cookies();
  const v = c.get(USER_COOKIE)?.value;
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

export async function setUserCookie(userId: string, email: string, name?: string, siteId?: string) {
  const c = await cookies();
  c.set(USER_COOKIE, JSON.stringify({ userId, email, name, siteId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getUserSiteId() {
  const user = await getUserFromCookie();
  return user?.siteId || null;
}

export async function getUserId() {
  const user = await getUserFromCookie();
  return user?.userId || null;
}

export async function clearUserCookie() {
  const c = await cookies();
  c.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
}

// Password hashing using built-in crypto
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512").toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const newHash = hashPassword(password);
  return newHash === hash;
}
