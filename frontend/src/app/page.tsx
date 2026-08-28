"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ToolSearch from "@/components/ToolSearch";
import { TOOLS, CATEGORY_ORDER, getTool } from "@/lib/tools";
import { useToolAnalytics } from "@/lib/useToolAnalytics";
import { recordToolClick } from "@/lib/api";

function ToolIcon({ category, id }: { category: string; id: string }) {
  const color =
    category === "PDF"
      ? "bg-red-50 text-red-500"
      : category === "Presentation"
        ? "bg-orange-50 text-orange-500"
        : category === "Watermark"
          ? "bg-sky-50 text-sky-600"
          : category === "Image"
            ? "bg-violet-50 text-violet-600"
            : category === "Make It Smaller"
              ? "bg-indigo-50 text-indigo-600"
              : "bg-emerald-50 text-emerald-600";

  const paths: Record<string, React.ReactNode> = {
    pdf: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
    presentation: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    watermark: (
      <>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </>
    ),
    quick: (
      <>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    smaller: (
      <>
        <path d="M12 3v18m0-18 5 5m-5-5-5 5" />
      </>
    ),
  };

  const key =
    category === "PDF"
      ? "pdf"
      : category === "Presentation"
        ? "presentation"
        : category === "Watermark"
          ? "watermark"
          : category === "Image"
            ? "image"
            : category === "Make It Smaller"
              ? "smaller"
              : "quick";

  return (
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {paths[key]}
      </svg>
    </span>
  );
}

export default function HomePage() {
  const [recent, setRecent] = useState<string[]>([]);
  const { counts } = useToolAnalytics();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("quikdrop_recent") || "[]");
      setRecent(Array.isArray(stored) ? stored : []);
    } catch {
      setRecent([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <section className="flex flex-col items-center gap-6 pb-12 pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Quick tools for <span className="text-primary">everyday files</span>.
        </h1>
        <p className="max-w-xl text-neutral-500">
          Compress, convert, watermark, and generate — without opening a heavy app.
          Your files are processed temporarily and automatically deleted.
        </p>
        <div className="flex w-full justify-center">
          <ToolSearch large placeholder="What do you want to do?" autoFocus={false} />
        </div>
        {recent.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-400">Recently used:</span>
            {recent.map((id) => {
              const t = getTool(id);
              if (!t) return null;
              return (
                <Link
                  key={id}
                  href={t.path}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat);
          if (tools.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {cat}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    onClick={() => recordToolClick(tool.id)}
                    className="group flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <ToolIcon category={tool.category} id={tool.id} />
                      {counts[tool.id] !== undefined && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                          {counts[tool.id].toLocaleString()} uses
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-neutral-900">
                        {tool.name}
                      </div>
                      <div className="mt-1 text-sm text-neutral-500">{tool.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}