import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed, getAdminSiteId } from "@/lib/adminAuth";
import EditorForm from "../EditorForm";
import { updateBlogPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login?next=/admin/blog");
  const siteId = await getAdminSiteId();
  if (!siteId) redirect("/admin/login?next=/admin/blog");

  const { id } = await params;
  const prismaClient = prisma as any;
  const post = await prismaClient.blogPost.findFirst({
    where: { id, siteId },
  });

  if (!post) {
    redirect("/admin/blog");
  }

  // Bind the postId to the updateBlogPost action
  const updateWithId = async (formData: FormData) => {
    "use server";
    formData.set("postId", post.id);
    return updateBlogPost(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            ✏️ Edit Blog
          </h1>
          <p className="text-slate-600">Update your post and save changes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <EditorForm
            action={updateWithId}
            initialTitle={post.title}
            initialContent={post.content}
            submitLabel="💾 Update Blog"
          />
        </div>
      </div>
    </div>
  );
}
