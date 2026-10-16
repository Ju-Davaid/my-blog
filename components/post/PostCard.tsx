import Link from "next/link";
import type { Post } from "@/lib/data";
import { Icon } from "@/components/ui";

/**
 * 文章卡片：标题、摘要、标签、日期与阅读时长。
 * 首页与文章列表页复用。
 */
export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card card-hover group flex flex-col p-6"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {post.pinned && <span className="tag tag-accent">置顶</span>}
        {post.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <h2 className="font-serif text-lg font-semibold leading-snug tracking-wide text-card-foreground transition-colors group-hover:text-primary">
        {post.title}
      </h2>
      <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="tabular-nums">{post.dateLabel}</span>
        <span className="inline-flex items-center gap-1">
          {post.readTime}
          <Icon name="clock" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
