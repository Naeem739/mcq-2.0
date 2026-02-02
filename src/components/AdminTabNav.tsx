"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const tabs: Tab[] = [
  { id: "quiz", label: "Quiz", icon: "📚", href: "/admin/upload" },
  { id: "exam", label: "Exam", icon: "📝", href: "/admin/exam" },
  { id: "blog", label: "Blog", icon: "📖", href: "/admin/blog" },
];

export default function AdminTabNav() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes("/admin/exam")) return "exam";
    if (pathname.includes("/admin/blog")) return "blog";
    return "quiz";
  };

  const activeTab = getActiveTab();

  return (
    <div className="mb-8 sm:mb-12">
      <div className="inline-flex rounded-full bg-slate-100 p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${
                isActive
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
