"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setUserCookie, clearUserCookie } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false as const, error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { ok: false as const, error: "Invalid email or password" };
    }

    if (!verifyPassword(password, user.password)) {
      return { ok: false as const, error: "Invalid email or password" };
    }

    // Set user cookie
    await setUserCookie(user.id, user.email, user.name);
    redirect("/");
  } catch (error) {
    // Re-throw redirect errors (NEXT_REDIRECT is a special Next.js error)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Login error:", error);
    return { ok: false as const, error: "Login failed. Please try again." };
  }
}

export async function logoutAction() {
  await clearUserCookie();
  redirect("/");
}
