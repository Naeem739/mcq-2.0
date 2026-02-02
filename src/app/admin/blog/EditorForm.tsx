"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BlogResult = { ok: false; error: string } | undefined;

export default function EditorForm({
  action,
  initialTitle = "",
  initialContent = "",
  submitLabel = "✨ Publish Blog",
}: {
  action: (formData: FormData) => Promise<BlogResult>;
  initialTitle?: string;
  initialContent?: string;
  submitLabel?: string;
}) {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [state, formAction, pending] = useActionState<BlogResult, FormData>(
    async (_prevState, formData) => {
      formData.set("content", content);
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state?.ok === false) {
      toast.error("Save Failed", {
        description: state.error,
      });
    }
  }, [state]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || "";
    }
  }, [initialContent]);

  const exec = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current.innerHTML);
  };

  const onInput = () => {
    if (!editorRef.current) return;
    setContent(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    exec("createLink", url);
  };

  const insertTable = () => {
    const rows = window.prompt("Number of rows:", "2");
    if (!rows) return;
    const cols = window.prompt("Number of columns:", "2");
    if (!cols) return;

    const rowCount = parseInt(rows);
    const colCount = parseInt(cols);

    if (rowCount < 1 || colCount < 1) {
      toast.error("Invalid dimensions");
      return;
    }

    let table = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    for (let r = 0; r < rowCount; r++) {
      table += "<tr>";
      for (let c = 0; c < colCount; c++) {
        table += '<td style="border: 1px solid #ccc; padding: 8px;">Cell</td>';
      }
      table += "</tr>";
    }
    table += "</table>";

    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("insertHTML", false, table);
    setContent(editorRef.current.innerHTML);
  };

  const clearContent = () => {
    if (!editorRef.current) return;
    if (window.confirm("Are you sure you want to delete all content?")) {
      editorRef.current.innerHTML = "";
      setContent("");
    }
  };

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok === false ? (
        <div className="whitespace-pre-wrap rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
          ⚠️ {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">Blog Title</label>
        <input
          name="title"
          placeholder="e.g. How to master HTML basics"
          defaultValue={initialTitle}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">Content</label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <button type="button" onClick={() => exec("bold")} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100">B</button>
          <button type="button" onClick={() => exec("italic")} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100">I</button>
          <button type="button" onClick={() => exec("underline")} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100">U</button>
          <button type="button" onClick={insertTable} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100">📊 Table</button>
          <button type="button" onClick={clearContent} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50">🗑️ Clear All</button>
        </div>

        <div
          ref={editorRef}
          onInput={onInput}
          contentEditable
          className="mt-3 min-h-[220px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          suppressContentEditableWarning
        />
        <p className="mt-2 text-xs text-slate-500">Start writing your blog content here.</p>

        <input type="hidden" name="content" value={content} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
      >
        {pending ? "⏳ Saving..." : submitLabel}
      </button>
    </form>
  );
}
