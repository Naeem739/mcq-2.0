import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isUserAuthed, getUserSiteId } from "@/lib/auth";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isLoggedIn = await isUserAuthed();
  const isAdmin = await isAdminAuthed();

  if (!isLoggedIn && !isAdmin) {
    redirect("/auth/login?next=/blog");
  }

  const siteId = (await getUserSiteId()) || (await getAdminSiteId());
  if (!siteId) {
    redirect("/auth/login?next=/blog");
  }

  const { id } = await params;
  const prismaClient = prisma as any;
  const post = await prismaClient.blogPost.findFirst({
    where: { id, siteId },
  });

  if (!post) {
    redirect("/blog");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{post.title}</h1>
          <p className="text-xs text-slate-500 mb-6">{new Date(post.createdAt).toLocaleString()}</p>
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </div>
  );
}
