import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/data";
import { postCover } from "@/lib/data";

/**
 * 文章卡片：无卡片底壳的「封面 + 文字」样式。
 * 圆角封面悬浮于页面背景上，标题/摘要各占一行截断，
 * 底部元信息：左侧「日期 · 首个标签」，右侧其余标签。
 * 首页与文章列表页复用。
 */
export default function PostCard({ post }: { post: Post }) {
  const [firstTag, ...restTags] = post.tags;

  return (
    <Link href={`/posts/${post.slug}`} className="group flex min-w-0 flex-col">
      {/* 封面 */}
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-muted shadow-sm">
        <Image
          src={postCover(post)}
          alt={post.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {post.pinned && (
          <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] text-primary backdrop-blur">
            置顶
          </span>
        )}
      </div>

      {/* 文字区：直接落在背景上，无底壳 */}
      <h2 className="mt-3.5 truncate font-serif text-[15px] font-semibold tracking-wide text-foreground transition-colors group-hover:text-primary">
        {post.title}
      </h2>
      <p className="mt-1.5 truncate text-xs leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      {/* 元信息：日期·主标签 | 其余标签 */}
      <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span className="shrink-0 tabular-nums">
          {post.date.replaceAll("-", "/")}
          {firstTag && <span className="mx-1.5">·</span>}
          {firstTag}
        </span>
        {restTags.length > 0 && (
          <span className="truncate text-right">{restTags.join(" · ")}</span>
        )}
      </div>
    </Link>
  );
}
