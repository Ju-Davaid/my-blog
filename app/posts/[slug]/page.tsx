import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { ReadingProgress } from "@/components/post";
import { CommentSection, LazyMount } from "@/components/comments";
import { getPostBySlug, POSTS } from "@/lib/data";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return { title: post ? post.title : "文章" };
}

const TOC = [
  { id: "s1", label: "一、先判断性质，再动手" },
  { id: "s2", label: "二、四层止血" },
  { id: "s3", label: "三、沉淀成清单" },
];

// 纯静态路由（generateStaticParams 已枚举全部 slug），允许阻塞式渲染以读取 params
export const instant = false;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // 上一篇 / 下一篇
  const idx = POSTS.findIndex((p) => p.slug === slug);
  const prev = POSTS[idx - 1];
  const next = POSTS[idx + 1];

  const isFullArticle = slug === "blog-attacked";

  return (
    <>
      {/* <ReadingProgress /> */}

      {/* 面包屑 */}
      <nav className="flex items-center gap-2 pt-8 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          首页
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/articles" className="transition-colors hover:text-primary">
          文章
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground/70">正文</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_200px]">
        {/* 正文 */}
        <article className="min-w-0">
          <header className="border-b border-border pb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.pinned && <span className="tag tag-accent">置顶</span>}
              {post.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-snug tracking-wide text-foreground text-balance md:text-4xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" className="h-3.5 w-3.5" />
                {post.date.replace(/-/g, " 年 ").replace(/^(\d{4} 年 \d{2} 月 )/, "$1")} 日
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" className="h-3.5 w-3.5" />
                约 {post.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="user-round" className="h-3.5 w-3.5" />
                森屿
              </span>
            </div>
          </header>

          {isFullArticle ? (
            <div className="prose-mori mt-8">
              <p>
                凌晨三点十七分，手机在床头震了一下。是监控群机器人的告警：站点 QPS 从个位数跳到了四百多，
                出网带宽打满。我第一反应是某篇文章被转发了，点开一看——请求路径全是不存在的随机字符串。
              </p>

              <p>
                这不是流量，这是有人在扫。下面把这五个小时的过程完整记下来，包括我踩的坑和最后沉淀出的排查清单。
              </p>

              <h2 id="s1">一、先判断性质，再动手</h2>
              <p>
                被打了之后最容易犯的错，是立刻上手封 IP。但如果攻击是分布在大量不同来源上的，
                封 IP 只是在跟攻击者赛跑，而且很容易误伤正常用户。所以第一步永远是判断性质，我看了三个指标：
              </p>
              <ul>
                <li>
                  <strong>请求特征</strong>：UA 全部相同，路径无规律，但都命中了一个不存在的动态路由。
                </li>
                <li>
                  <strong>来源分布</strong>：独立 IP 约 2000 个，集中在两个 C 段，不是肉鸡网络，更像单机多线程。
                </li>
                <li>
                  <strong>目标接口</strong>：全部打向那个动态路由，而这个路由会触发一次数据库查询。
                </li>
              </ul>
              <p>结论很明确：这是一次针对性的 CC 攻击，目标是打穿数据库连接池，而不是消耗带宽。</p>

              <blockquote>
                判断性质的本质，是回答「他想让我死在哪里」。防守只有知道了这个，才能把资源放在正确的点上。
              </blockquote>

              <h2 id="s2">二、四层止血</h2>
              <p>确认性质之后，我按「见效速度」从快到慢做了四件事。</p>

              <h3>1. 边缘层封禁</h3>
              <p>在 CDN 上按 UA 特征 + 路径正则直接拦截，这一步十秒钟完成，立刻把流量削掉了九成。</p>

              <h3>2. 给动态路由加缓存</h3>
              <p>那个动态路由其实是内容型页面，本身就适合缓存。加了一层边缘缓存之后，请求根本到不了源站。</p>

              <pre>
                <code>{`// next.config.js
async headers() {
  return [
    {
      source: "/posts/:id*",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
  ];
}`}</code>
              </pre>

              <h3>3. 数据库连接池加护栏</h3>
              <p>设置连接获取超时，并给这个路由单独限流。即便前面的防线被绕过，也不会把连接池拖垮。</p>

              <h3>4. 补齐监控盲区</h3>
              <p>
                这次之所以反应慢了十分钟，是因为告警阈值设得过宽。改成「按路径维度的 QPS 同比增幅」之后，
                灵敏度提升了一个数量级。
              </p>

              <h2 id="s3">三、沉淀成清单</h2>
              <p>下次再遇到，我希望能在三分钟内走完判断流程。所以整理成了这张单子：</p>
              <ol>
                <li>看总 QPS 与带宽的比值 —— 判断是 CC 还是 DDoS。</li>
                <li>看 UA / 路径 / IP 三个维度的集中度 —— 判断来源是否单一。</li>
                <li>看被打的接口是否触达数据库 —— 判断真实目标。</li>
                <li>边缘先拦，再考虑源站加固 —— 永远从最外层开始。</li>
                <li>事后必做：把这次的判据写进告警规则。</li>
              </ol>

              <hr />

              <p>
                天亮的时候，站点恢复了正常。攻击者没有攻破任何东西，但它确实拿走了一个东西——我的睡眠。
                不过换来的这份清单，我觉得挺值。
              </p>
            </div>
          ) : (
            <div className="prose-mori mt-8">
              <p>{post.excerpt}</p>
              <p>
                这篇文章的正文还在整理中。它被收录在这里，是因为它承载了某个阶段的想法，
                而想法值得被先记下来，再慢慢写完整。
              </p>
            </div>
          )}

          {/* 页脚导航 */}
          <footer className="mt-14 border-t border-border pt-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link href={`/posts/${prev.slug}`} className="card card-hover group p-5">
                  <p className="text-xs text-muted-foreground">← 上一篇</p>
                  <p className="mt-2 font-serif text-sm font-medium text-card-foreground transition-colors group-hover:text-primary">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link href={`/posts/${next.slug}`} className="card card-hover group p-5 sm:text-right">
                  <p className="text-xs text-muted-foreground">下一篇 →</p>
                  <p className="mt-2 font-serif text-sm font-medium text-card-foreground transition-colors group-hover:text-primary">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </footer>

          {/* 评论区：滚动到视口再挂载（首屏要生成上万条数据）
              layout="flow" —— 不设固定高度，高度随评论数增长，跟随页面滚动 */}
          <LazyMount className="mt-14 block border-t border-border pt-10">
            <CommentSection
              key={post.slug}
              contentId={`post-${post.slug}`}
              preset="article"
              layout="flow"
              initialCount={20}
              loadStep={20}
            />
          </LazyMount>
        </article>

        {/* 侧栏 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {isFullArticle && (
              <div className="card p-4">
                <p className="mb-3 font-serif text-xs tracking-[0.14em] text-muted-foreground">目录</p>
                <nav className="space-y-1">
                  {TOC.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      {t.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="card p-4">
              <p className="mb-3 font-serif text-xs tracking-[0.14em] text-muted-foreground">关于作者</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 font-serif text-sm text-primary">
                  森
                </div>
                <div>
                  <p className="text-sm text-foreground">森屿</p>
                  <p className="text-xs text-muted-foreground">写代码，也拍照</p>
                </div>
              </div>
            </div>

            <Link
              href="/articles"
              className="block rounded-xl border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              返回文章列表
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
