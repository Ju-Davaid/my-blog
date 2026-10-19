import Link from "next/link";

/**
 * 全局 404 页（Next.js App Router 约定文件）
 * 服务端组件，零 JS；动效均为纯 CSS，dev 不水合也能完整展示。
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* 背景装饰：两个巨大的幽灵字 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none font-serif text-[26vw] font-bold leading-none text-foreground/[0.04]"
      >
        404
      </span>

      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] tracking-[0.14em] text-muted-foreground backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
        PAGE NOT FOUND
      </p>

      {/* 大 404 */}
      <h1 className="font-serif text-6xl font-semibold tracking-wide text-foreground md:text-8xl">
        4<span className="text-primary">0</span>4
      </h1>

      <h2 className="mt-6 font-serif text-xl text-foreground md:text-2xl">
        这篇文章大概被风带走了
      </h2>

      <p className="mt-4 max-w-md text-[15px] leading-loose text-muted-foreground">
        你要找的页面不存在，或者已经搬家。
        <br />
        不过既然来了，不如回去看看别的——
        <br />
        代码、照片和道理，总有一篇还没读过。
      </p>

      {/* 操作 */}
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          replace={true}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
        >
          回到首页
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        </Link>
        <Link
          href="/articles"
          replace={true}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
        >
          浏览全部文章
        </Link>
      </div>

      {/* 底部小字 */}
      <p className="mt-12 text-xs tracking-widest text-muted-foreground/70">
        ERROR · 404 · NOT FOUND
      </p>
    </div>
  );
}
