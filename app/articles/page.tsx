"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { POSTS } from "@/lib/data";

const FILTERS = ["全部", "编程", "前端", "后端", "数据库", "AI", "摄影", "音乐", "生活", "随笔"];

export default function ArticlesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");

  const q = query.trim().toLowerCase();
  const visible = POSTS.filter((p) => {
    const matchFilter = filter === "全部" || p.tags.includes(filter);
    const matchQuery =
      q === "" ||
      (p.title + " " + p.tags.join(" ")).toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  return (
    <>
      <Reveal className="pt-12 pb-8 md:pt-16">
        <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground">ARTICLES</p>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          全部文章
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          共 <span className="tabular-nums text-foreground">72</span> 篇。按时间倒序排列，支持关键词搜索与标签筛选。
        </p>
      </Reveal>

      {/* 工具栏 */}
      <Reveal className="mb-8">
        <div className="card p-4 md:p-5">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              placeholder="搜索标题或标签…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div id="tags" className="mt-4 flex flex-wrap gap-2 scroll-mt-24">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`tag cursor-pointer ${filter === f ? "tag-accent" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 列表 */}
      <section className="grid gap-5 md:grid-cols-2">
        {visible.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="card card-hover group flex flex-col p-6"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {p.pinned && <span className="tag tag-accent">置顶</span>}
              {p.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            <h2 className="font-serif text-lg font-semibold leading-snug tracking-wide text-card-foreground transition-colors group-hover:text-primary">
              {p.title}
            </h2>
            <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {p.excerpt}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="tabular-nums">{p.date}</span>
              <span className="inline-flex items-center gap-1">{p.readTime}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* 空状态 */}
      {visible.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-serif text-lg text-muted-foreground">没有找到匹配的文章</p>
          <p className="mt-2 text-sm text-muted-foreground/80">
            试试换个关键词，或点击「全部」重置筛选。
          </p>
        </div>
      )}
    </>
  );
}
