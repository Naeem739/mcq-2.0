import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyPassword } from "./auth";

export const ADMIN_COOKIE = "mcq_admin";

export async function isAdminAuthed() {
  const c = await cookies();
  const cookieValue = c.get(ADMIN_COOKIE)?.value;
  if (!cookieValue) return false;
  
  try {
    const { siteId } = JSON.parse(cookieValue);
    if (!siteId) return false;
    
    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });
    return !!site;
  } catch {
    return false;
  }
}

export async function getAdminSiteId() {
  const c = await cookies();
  const cookieValue = c.get(ADMIN_COOKIE)?.value;
  if (!cookieValue) return null;
  
  try {
    const { siteId } = JSON.parse(cookieValue);
    return siteId || null;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string, siteCode: string) {
  // Find site by code
  const site = await prisma.site.findUnique({
    where: { code: siteCode },
  });
  
  if (!site) return null;
  
  // Find admin by email and site
  const admin = await prisma.admin.findFirst({
    where: {
      email,
      siteId: site.id,
    },
  });
  
  if (!admin) return null;
  
  if (verifyPassword(password, admin.password)) {
    return { siteId: admin.siteId, adminId: admin.id };
  }
  return null;
}

