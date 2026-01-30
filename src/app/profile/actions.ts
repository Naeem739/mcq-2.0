"use server";

import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getProfileData() {
  const user = await getUserFromCookie();
  if (!user || !user.userId) {
    redirect("/auth/login");
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      attempts: {
        include: {
          quiz: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!userData) {
    redirect("/auth/login");
  }

  return userData;
}
