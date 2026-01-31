"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function submitAdminRequest(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // Validation
  if (!name) return { ok: false as const, error: "Name is required" };
  if (!email || !email.includes("@")) return { ok: false as const, error: "Valid email is required" };
  if (!password || password.length < 6) return { ok: false as const, error: "Password must be at least 6 characters" };
  if (password !== confirmPassword) return { ok: false as const, error: "Passwords do not match" };

  try {
    // Check if request already exists
    const existingRequest = await prisma.adminRequest.findUnique({
      where: { email },
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return { ok: false as const, error: "A request with this email is already pending" };
      }
      if (existingRequest.status === "approved") {
        return { ok: false as const, error: "This email is already approved as an admin" };
      }
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return { ok: false as const, error: "An admin with this email already exists" };
    }

    // Create admin request
    const hashedPassword = hashPassword(password);
    await prisma.adminRequest.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "pending",
      },
    });

    return { 
      ok: true as const, 
      message: "Your request has been submitted successfully. The Super Admin will review it and assign you a site code." 
    };
  } catch (error) {
    console.error("Admin request error:", error);
    return { ok: false as const, error: "Failed to submit request. Please try again." };
  }
}
