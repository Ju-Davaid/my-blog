import { Reveal, Icon } from "@/components/ui";
import { STATS } from "@/lib/data";
import Image from "next/image";

const TOOLBOX = [
  {
    title: "语言与框架",
    tags: ["TypeScript", "Go", "Java", "Python", "React", "Next.js"],
  },
  { title: "数据与中间件", tags: ["MySQL", "Redis", "Kafka", "Elasticsearch"] },
  { title: "工程与运维", tags: ["Docker", "Kubernetes", "Nginx", "CI/CD"] },
  { title: "除此之外", tags: ["摄影", "钢琴", "乐理", "阅读"], accent: true },
];

const LINKS = [
  { name: "拾玖的博客", desc: "用镜头和文字记录生活", initial: "拾" },
  { name: "木子笔记", desc: "前端 / 设计 / 折腾", initial: "木" },
  { name: "北路", desc: "记录一些无用的思考", initial: "北" },
];

export default function AboutPage() {
  return (
    <>
      <Reveal className="pt-12 pb-12 md:pt-16">
        <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground">
          ABOUT
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          关于
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-10">
          {/* 自我介绍 */}
          <Reveal className="card p-6 md:p-8">
            <h2 className="font-serif text-xl tracking-wide text-card-foreground">
              你好，我是森屿
            </h2>
            <div className="prose-mori mt-5">
              <p>
                一名后端工程师，业余时间拍照、弹琴、写点东西。
                白天跟数据库和并发打交道，晚上跟光圈和快门打交道，本质上都是在处理同一件事：
                <strong>如何在有限的资源里，把重要的东西留住。</strong>
              </p>
              <p>
                这个博客建了很久，删过三次，重写过两次。以前总想写成「技术专栏」，后来发现
                真正想留下来的，是那些还没想明白的时刻。所以这里什么都没有，只有记录。
              </p>
              <blockquote>死亡不属于工人阶级！</blockquote>
            </div>
          </Reveal>

          {/* 技术栈 */}
          <Reveal>
            <h2 className="mb-5 font-serif text-xl tracking-wide text-foreground">
              常用工具箱
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {TOOLBOX.map((box) => (
                <div key={box.title} className="card card-hover p-5">
                  <p className="mb-3 font-serif text-sm tracking-wide text-card-foreground">
                    {box.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {box.tags.map((t) => (
                      <span
                        key={t}
                        className={`tag ${box.accent ? "tag-accent" : ""}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* 站点说明 */}
          <Reveal>
            <h2 className="mb-5 font-serif text-xl tracking-wide text-foreground">
              关于本站
            </h2>
            <div className="card divide-y divide-border overflow-hidden">
              {[
                { k: "技术方案", v: "Next.js + Tailwind CSS" },
                { k: "字体", v: "Noto Sans SC / Noto Serif SC" },
                {
                  k: "主题色",
                  v: (
                    <span className="inline-flex items-center gap-2 text-card-foreground">
                      <span className="inline-flex gap-1">
                        <span
                          className="h-4 w-4 rounded-full border border-border"
                          style={{ background: "#6b8fba" }}
                        ></span>
                        <span
                          className="h-4 w-4 rounded-full border border-border"
                          style={{ background: "#c4a882" }}
                        ></span>
                      </span>
                      雾霾蓝 / 暖棕金
                    </span>
                  ),
                },
                {
                  k: "上线时间",
                  v: (
                    <span className="tabular-nums text-card-foreground">
                      2024-03-16
                    </span>
                  ),
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between px-6 py-4 text-sm"
                >
                  <span className="text-muted-foreground">{row.k}</span>
                  {typeof row.v === "string" ? (
                    <span className="text-card-foreground">{row.v}</span>
                  ) : (
                    row.v
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          {/* 友链 */}
          <Reveal>
            <h2 className="mb-5 font-serif text-xl tracking-wide text-foreground">
              友链
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LINKS.map((l) => (
                <a
                  key={l.name}
                  href="#"
                  className="card card-hover group flex items-center gap-3 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 font-serif text-sm text-primary">
                    {l.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-card-foreground transition-colors group-hover:text-primary">
                      {l.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </Reveal>

          {/* 联系 */}
          <Reveal>
            <h2 className="mb-5 font-serif text-xl tracking-wide text-foreground">
              找我
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "github" as const, label: "GitHub" },
                { icon: "mail" as const, label: "hello@example.com" },
                { icon: "rss" as const, label: "RSS 订阅" },
              ].map((c) => (
                <a
                  key={c.label}
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <Icon name={c.icon} className="h-4 w-4" />
                  {c.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-6">
          <div className="sticky top-20 space-y-6">
            <div className="card p-6 text-center">
              <Image
                alt="网络头像"
                width={80}
                height={80}
                src="https://picsum.photos/seed/mori-avatar/96/96"
                className="mx-auto rounded-full"
              />
              <p className="mt-4 font-serif text-lg tracking-wide text-card-foreground">
                森屿
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                后端工程师 / 摄影爱好者
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-5 text-center">
                {[
                  { label: "文章", value: STATS.articles },
                  { label: "动态", value: STATS.moments },
                  { label: "相册", value: STATS.albums },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-lg tabular-nums text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="mb-3 font-serif text-xs tracking-[0.14em] text-muted-foreground">
                本站使用
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Next.js",
                  "Tailwind CSS v4",
                  "CSS 变量换肤",
                  "无外部 UI 依赖",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
