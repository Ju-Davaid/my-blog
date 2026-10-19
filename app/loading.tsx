/**
 * 全局路由切换 loading（Next.js App Router 约定文件）
 * 纯 CSS 动画，不依赖 React 水合 —— dev 不水合的环境里也照常显示。
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="页面加载中"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 pt-14"
    >
      {/* 旋转环 + 内点 */}
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-border"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/60 [animation-duration:0.9s]"></div>
        <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-accent"></div>
      </div>

      {/* 三点呼吸 */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
          ></span>
        ))}
      </div>

      <p className="text-[13px] tracking-[0.3em] text-muted-foreground">
        装订中<span className="animate-pulse">…</span>
      </p>
    </div>
  );
}
