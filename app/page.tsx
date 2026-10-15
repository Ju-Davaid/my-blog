import Link from "next/link";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import Icon from "@/components/Icon";
import { POSTS, ARCHIVE, ALL_TAGS, TAG_COUNTS, STATS } from "@/lib/data";

export default function HomePage() {
  const pinned = POSTS.find((p) => p.pinned);
  const latest = POSTS.filter((p) => !p.pinned).slice(0, 6);

  return (
    <>
      {/* 首屏 */}
      <Reveal className="pt-14 pb-16 md:pt-24 md:pb-20">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] tracking-[0.14em] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
          SINCE 2024 · 记录中
        </p>

        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-wide text-foreground text-balance md:text-6xl">
          森屿的个人博客
        </h1>

        <blockquote className="mt-6 max-w-2xl border-l-2 border-primary/50 pl-4 font-serif text-base leading-relaxed text-muted-foreground md:text-lg">
          死亡不属于工人阶级！<span className="text-accent">——</span>
        </blockquote>

        <p className="mt-6 max-w-2xl text-[15px] leading-loose text-muted-foreground">
          在这里存放一些写不完的代码、拍不满的照片、和偶尔想明白的道理。
          不做流量，不求更新，只求把日子留下一点痕迹。
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
          >
            开始阅读
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            看看相册
          </Link>
        </div>

        {/* 数据 */}
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 md:grid-cols-4">
          {[
            { label: "文章", value: STATS.articles },
            { label: "动态", value: STATS.moments },
            { label: "相册", value: STATS.albums },
            { label: "标签", value: STATS.tags },
          ].map((s) => (
            <div key={s.label}>
              <dt className="text-xs tracking-[0.12em] text-muted-foreground">{s.label}</dt>
              <dd className="mt-2 font-serif text-3xl font-semibold tabular-nums text-foreground">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* 置顶文章 */}
      <Reveal>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-wide text-foreground">置顶</h2>
          <span className="text-xs tracking-widest text-muted-foreground">PINNED</span>
        </div>

        {pinned && (
          <Link href={`/posts/${pinned.slug}`} className="card card-hover group block overflow-hidden">
            <div className="flex flex-col gap-0 md:flex-row">
              <div
                className="relative flex min-h-[168px] items-center justify-center overflow-hidden border-b border-border md:w-2/5 md:border-b-0 md:border-r"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 16%, transparent))",
                }}
              >
                <div className="dot-grid absolute inset-0 opacity-60"></div>
                <span className="relative font-serif text-5xl tracking-[0.2em] text-primary/45">01</span>
              </div>
              <div className="flex-1 p-6 md:p-7">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="tag tag-accent">置顶</span>
                  {pinned.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-xl font-semibold tracking-wide text-card-foreground transition-colors group-hover:text-primary md:text-2xl">
                  {pinned.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {pinned.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" className="h-3.5 w-3.5" />
                    {pinned.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    约 {pinned.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}
      </Reveal>

      {/* 最新文章 */}
      <Reveal className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-wide text-foreground">最新文章</h2>
          <Link href="/articles" className="text-xs tracking-widest text-muted-foreground transition-colors hover:text-primary">
            全部 →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </Reveal>

      {/* 标签 */}
      <Reveal className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-wide text-foreground">标签</h2>
          <Link href="/articles#tags" className="text-xs tracking-widest text-muted-foreground transition-colors hover:text-primary">
            按标签看 →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ALL_TAGS.map((t) => (
            <Link
              key={t}
              href="/articles"
              className={`tag ${t === "CSS" ? "tag-accent" : ""}`}
            >
              {t}
              <span className="opacity-60">{TAG_COUNTS[t]}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* 归档时间线 */}
      <Reveal className="mt-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-wide text-foreground">归档</h2>
          <span className="text-xs tracking-widest text-muted-foreground">ARCHIVE</span>
        </div>

        <div className="timeline space-y-9">
          {ARCHIVE.map((group) => (
            <div key={group.yearMonth} className="timeline-group">
              <div className="relative flex items-center gap-3">
                <div className="timeline-dot"></div>
                <span className="font-serif text-sm font-medium tracking-wide text-foreground">
                  {group.label}
                </span>
              </div>
              <div className="ml-[28px] mt-2 space-y-1.5">
                {group.items.map((item, i) => (
                  <Link key={i} href={`/posts/${item.slug}`} className="timeline-row">
                    <span className="tl-date">{item.dateLabel}</span>
                    <span className="tl-title line-clamp-1">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
