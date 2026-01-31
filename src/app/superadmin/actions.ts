"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isSuperAdminAuthed } from "@/lib/superAdminAuth";
import { generateSiteCode } from "@/lib/siteCodeGenerator";

export async function approveAdminRequest(formData: FormData) {
  if (!(await isSuperAdminAuthed())) redirect("/superadmin/login");

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return;

  try {
    const request = await prisma.adminRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "pending") {
      return;
    }

    // Generate unique 12-digit site code
    let siteCode: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      siteCode = generateSiteCode();
      const existing = await prisma.site.findUnique({
        where: { code: siteCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique site code");
    }

    // Create site
    const site = await prisma.site.create({
      data: {
        name: `${request.name}'s Site`,
        code: siteCode!,
      },
    });

    // Create admin
    await prisma.admin.create({
      data: {
        name: request.name,
        email: request.email,
        password: request.password,
        siteId: site.id,
      },
    });

    // Update request status
    await prisma.adminRequest.update({
      where: { id: requestId },
      data: {
        status: "approved",
        siteCode: siteCode!,
        siteId: site.id,
      },
    });

    revalidatePath("/superadmin");
    return { ok: true as const, message: "Admin request approved successfully" };
  } catch (error) {
    console.error("Error approving admin request:", error);
    return { ok: false as const, error: "Failed to approve admin request" };
  }
}

export async function rejectAdminRequest(formData: FormData) {
  if (!(await isSuperAdminAuthed())) redirect("/superadmin/login");

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return;

  try {
    await prisma.adminRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    revalidatePath("/superadmin");
    return { ok: true as const, message: "Admin request rejected" };
  } catch (error) {
    console.error("Error rejecting admin request:", error);
    return { ok: false as const, error: "Failed to reject admin request" };
  }
}

export async function deleteAdmin(formData: FormData) {
  if (!(await isSuperAdminAuthed())) redirect("/superadmin/login");

  const adminId = String(formData.get("adminId") ?? "");
  if (!adminId) return;

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { siteId: true },
    });

    if (admin) {
      // Delete the admin's site so all related data is cascade deleted
      await prisma.site.delete({
        where: { id: admin.siteId },
      });
    }

    revalidatePath("/superadmin");
    return { ok: true as const, message: "Admin and associated site deleted successfully" };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { ok: false as const, error: "Failed to delete admin" };
  }
}
