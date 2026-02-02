import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isUserAuthed, getUserSiteId } from "@/lib/auth";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerpt(html: string, max = 180) {
  const text = stripHtml(html);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default async function BlogPage() {
  const isLoggedIn = await isUserAuthed();
  const isAdmin = await isAdminAuthed();

  if (!isLoggedIn && !isAdmin) {
    redirect("/auth/login?next=/blog");
  }

  const siteId = (await getUserSiteId()) || (await getAdminSiteId());
  if (!siteId) {
    redirect("/auth/login?next=/blog");
  }

  const prismaClient = prisma as any;
  const posts: Array<{ id: string; title: string; content: string; createdAt: Date }> =
    await prismaClient.blogPost.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">📖 Student Blog</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">Study Blog</h1>
          <p className="text-slate-600">Read tips, notes, and explanations from your admin</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="text-lg font-medium text-slate-900 mb-2">No Blog Posts Yet</p>
            <p className="text-slate-600">Check back later for new content</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{post.title}</h2>
                <p className="text-xs text-slate-500 mb-4">{new Date(post.createdAt).toLocaleString()}</p>
                <p className="text-slate-700 mb-4">{excerpt(post.content)}</p>
                <a
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Read full blog →
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
