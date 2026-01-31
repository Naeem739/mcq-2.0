"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, setUserCookie } from "@/lib/auth";

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const siteCode = String(formData.get("siteCode") ?? "").trim().toUpperCase();

  // Validation
  if (!name) return { ok: false as const, error: "Name is required" };
  if (!email || !email.includes("@")) return { ok: false as const, error: "Valid email is required" };
  if (!password || password.length < 6) return { ok: false as const, error: "Password must be at least 6 characters" };
  if (password !== confirmPassword) return { ok: false as const, error: "Passwords do not match" };
  if (!siteCode) return { ok: false as const, error: "Site code is required" };

  try {
    // Find site by code
    const site = await prisma.site.findUnique({
      where: { code: siteCode },
    });

    if (!site) {
      return { ok: false as const, error: "Invalid site code" };
    }

    // Check if user already exists in this site
    const existingUser = await prisma.user.findUnique({
      where: {
        siteId_email: {
          siteId: site.id,
          email: email,
        },
      },
    });

    if (existingUser) {
      return { ok: false as const, error: "Email already registered in this site" };
    }

    // Create user with hashed password
    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        siteId: site.id,
      },
    });

    // Auto-login user
    await setUserCookie(user.id, user.email, user.name, site.id);

    // Redirect to home
    redirect("/");
  } catch (error) {
    // Re-throw redirect errors (NEXT_REDIRECT is a special Next.js error)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Signup error:", error);
    return { ok: false as const, error: "Failed to create account. Please try again." };
  }
}
