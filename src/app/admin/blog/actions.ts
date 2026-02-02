"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export async function createBlogPost(formData: FormData) {
  const prismaClient = prisma as any;
  if (!(await isAdminAuthed())) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const siteId = await getAdminSiteId();
  if (!siteId) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title) {
    return { ok: false as const, error: "Please provide a title." };
  }

  if (!content) {
    return { ok: false as const, error: "Please write some content." };
  }

  try {
    await prismaClient.blogPost.create({
      data: {
        siteId,
        title,
        content,
      },
    });
  } catch (error) {
    return { ok: false as const, error: "Failed to create blog post. Please try again." };
  }

  redirect("/admin/blog");
}

export async function updateBlogPost(formData: FormData) {
  const prismaClient = prisma as any;
  if (!(await isAdminAuthed())) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const siteId = await getAdminSiteId();
  if (!siteId) {
    return { ok: false as const, error: "Not authorized. Please login to admin first." };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!postId) {
    return { ok: false as const, error: "Invalid post." };
  }

  if (!title) {
    return { ok: false as const, error: "Please provide a title." };
  }

  if (!content) {
    return { ok: false as const, error: "Please write some content." };
  }

  try {
    const result = await prismaClient.blogPost.updateMany({
      where: { id: postId, siteId },
      data: { title, content },
    });
    if (result.count === 0) {
      return { ok: false as const, error: "Blog post not found." };
    }
  } catch (error) {
    return { ok: false as const, error: "Failed to update blog post." };
  }

  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  const prismaClient = prisma as any;
  if (!(await isAdminAuthed())) {
    redirect("/admin/login?next=/admin/blog");
  }

  const siteId = await getAdminSiteId();
  if (!siteId) {
    redirect("/admin/login?next=/admin/blog");
  }

  const postId = String(formData.get("postId") ?? "").trim();
  if (!postId) {
    redirect("/admin/blog");
  }

  try {
    await prismaClient.blogPost.deleteMany({
      where: { id: postId, siteId },
    });
  } catch (error) {
    redirect("/admin/blog");
  }

  redirect("/admin/blog");
}
