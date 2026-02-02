import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import { adminLogout } from "@/app/admin/login/actions";
import AdminTabNav from "@/components/AdminTabNav";
import EditorForm from "./EditorForm";
import { createBlogPost, deleteBlogPost } from "./actions";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerpt(html: string, max = 160) {
  const text = stripHtml(html);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default async function AdminBlogPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login?next=/admin/blog");
  const siteId = await getAdminSiteId();
  if (!siteId) redirect("/admin/login?next=/admin/blog");

  const prismaClient = prisma as any;
  const posts: Array<{ id: string; title: string; content: string; createdAt: Date }> =
    await prismaClient.blogPost.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">�‍💼 Admin Dashboard</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                Content Management
              </h1>
              <p className="text-base sm:text-lg text-slate-600">Manage quizzes, exams, and blog content</p>
            </div>
            <form action={adminLogout}>
              <button
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>

          {/* Tab Navigation */}
          <AdminTabNav />
        </div>

        <div className="mb-8 sm:mb-12 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">✍️ Write Blog</h2>
            <p className="text-slate-600">Use the editor below and publish instantly</p>
          </div>
          <EditorForm action={createBlogPost} />
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">📚 Published Posts</h2>
            <p className="text-slate-600">Manage your published blogs</p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="text-lg font-medium text-slate-900 mb-2">No Blog Posts Yet</p>
              <p className="text-slate-600">Write your first blog above</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/blog/${post.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </a>
                      <form action={deleteBlogPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{excerpt(post.content)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
