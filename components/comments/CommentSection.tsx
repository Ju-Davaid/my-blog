"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommentComposer from "./CommentComposer";
import CommentItem, { type CommentActions } from "./CommentItem";
import CommentList, { type CommentListApi } from "./CommentList";
import ReplyPanel from "./ReplyPanel";
import Icon from "@/components/Icon";
import {
  SEED_PRESETS,
  estimateTotal,
  formatCount,
  type Comment,
  type SeedConfig,
  type SortMode,
} from "@/lib/comments";
import { useComments } from "./useComments";

/* ==========================================================================
   评论区（对外唯一入口）
   --------------------------------------------------------------------------
   用法：
     <CommentSection contentId="post-xxx" preset="article" layout="flow" />
     <CommentSection contentId="moment-m1" preset="moment" maxHeight={420} />

   layout：
     box  —— 固定高度、内部滚动（信息流内的折叠区用）
     flow —— 不设高度、随已加载评论自然撑开，跟随页面滚动（文章详情页 / B 站式）
   ========================================================================== */

export type CommentSectionProps = {
  /** 内容唯一标识，决定种子数据与本地存储分片 */
  contentId: string;
  /** 预设数据量：article = 1 万条，moment = 数百条 */
  preset?: keyof typeof SEED_PRESETS;
  /** 直接指定种子配置（优先于 preset） */
  seed?: SeedConfig;
  /** 布局模式，默认 box */
  layout?: "box" | "flow";
  /** box 模式的滚动区高度（flow 模式忽略） */
  maxHeight?: number;
  /** 顶层评论行高估值 */
  estimateSize?: number;
  /** flow 模式首批展示的顶层评论数 */
  initialCount?: number;
  /** flow 模式每次「加载更多」追加的条数 */
  loadStep?: number;
  className?: string;
  /** 是否生成数据（折叠态传 false，展开后再传 true） */
  enabled?: boolean;
};

const SORTS: { key: SortMode; label: string }[] = [
  { key: "hot", label: "最热" },
  { key: "new", label: "最新" },
];

/** 内联子评论展示上限（与 CommentItem 保持一致） */
const INLINE_REPLIES = 2;

export default function CommentSection({
  contentId,
  preset = "article",
  seed,
  layout = "box",
  maxHeight = 560,
  estimateSize = 108,
  initialCount = 20,
  loadStep = 20,
  className = "",
  enabled = true,
}: CommentSectionProps) {
  const isFlow = layout === "flow";
  const cfg = useMemo<SeedConfig>(() => seed ?? SEED_PRESETS[preset], [seed, preset]);
  const comments = useComments(contentId, cfg, enabled);
  const {
    ready,
    sort,
    setSort,
    byId,
    orderedRoots,
    repliesByRoot,
    total,
    rootCount,
    addComment,
    toggleLike,
    removeComment,
    replyCountOf,
    userName,
    updateUserName,
  } = comments;

  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [thread, setThread] = useState<{ rootId: string; focusId?: string } | null>(null);
  const apiRef = useRef<CommentListApi | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /* ---------- flow：分步展示，页面高度随已加载条数增长 ---------- */
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const shownRoots = useMemo(
    () => (isFlow ? orderedRoots.slice(0, visibleCount) : orderedRoots),
    [isFlow, orderedRoots, visibleCount],
  );
  const remaining = isFlow ? orderedRoots.length - shownRoots.length : 0;

  const loadMore = useCallback(() => {
    setVisibleCount((v) => Math.min(v + loadStep, orderedRoots.length));
  }, [loadStep, orderedRoots.length]);

  /* 触底自动续加载：每次只放一批，remaining 变化后重新观察 */
  useEffect(() => {
    if (!isFlow || remaining <= 0) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          loadMore();
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isFlow, remaining, loadMore]);

  /* ---------- 动作 ---------- */
  const actions = useMemo<CommentActions>(
    () => ({
      onLike: toggleLike,
      onReply: (comment) => {
        setReplyTo({ id: comment.id, name: comment.author.name });
        // flow 模式输入框固定挂在评论区顶部，滚回去才看得到「回复 @某人」
        if (isFlow) {
          const el = composerRef.current;
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          }
        }
      },
      onDelete: removeComment,
      onOpenThread: (rootId, focusId) => setThread({ rootId, focusId }),
    }),
    [toggleLike, removeComment, isFlow],
  );

  const handleSubmit = useCallback(
    (content: string) => {
      if (replyTo) {
        addComment({ content, parentId: replyTo.id, replyToName: replyTo.name });
      } else {
        addComment({ content, parentId: null });
      }
      setReplyTo(null);
      apiRef.current?.scrollToTop();
    },
    [addComment, replyTo],
  );

  const handleSort = useCallback(
    (next: SortMode) => {
      if (next === sort) return;
      setSort(next);
      // 换排序后回到首批，避免页面高度断崖式变化
      setVisibleCount(initialCount);
      apiRef.current?.scrollToTop();
    },
    [sort, setSort, initialCount],
  );

  const threadRoot = thread ? byId.get(thread.rootId) ?? null : null;
  const threadReplies = thread ? repliesByRoot.get(thread.rootId) ?? [] : [];

  /**
   * 按内容估高：折叠的子评论数 + 正文行数。
   * 估值越准，虚拟滚动首帧布局越接近真实，测量回填越少。
   */
  const estimateOf = useCallback(
    (c: Comment) => {
      const lines = Math.min(5, Math.max(1, Math.ceil(c.content.length / 40)));
      const inlineReplies = Math.min(replyCountOf(c.id), INLINE_REPLIES);
      return 64 + lines * 22 + inlineReplies * 60;
    },
    [replyCountOf],
  );

  const displayTotal = ready ? total : estimateTotal(cfg);

  return (
    <section id={`comments-${contentId}`} className={`scroll-mt-24 ${className}`}>
      {/* 标题 + 排序 */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-wide text-foreground">
            评论
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            共 <span className="tabular-nums text-foreground/80">{formatCount(displayTotal)}</span> 条
            {ready && (
              <>
                <span className="mx-1.5 opacity-40">·</span>
                顶层 <span className="tabular-nums text-foreground/80">{rootCount}</span> 条
                <span className="mx-1.5 opacity-40">·</span>
                {isFlow ? (
                  <>
                    已加载{" "}
                    <span className="tabular-nums text-foreground/80">
                      {shownRoots.length}
                    </span>{" "}
                    条
                  </>
                ) : (
                  "虚拟滚动中"
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => handleSort(s.key)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs transition-colors ${
                sort === s.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div ref={composerRef}>
        <CommentComposer
          onSubmit={handleSubmit}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          userName={userName}
          onUserNameChange={updateUserName}
          placeholder="写下你的想法…"
        />
      </div>

      {/* 列表 */}
      <div className="mt-4">
        {!ready ? (
          <CommentSkeleton count={3} />
        ) : (
          <CommentList
            items={shownRoots}
            estimateSize={estimateSize}
            estimateOf={estimateOf}
            gap={10}
            mode={isFlow ? "window" : "container"}
            maxHeight={maxHeight}
            className="rounded-xl"
            apiRef={apiRef}
            renderItem={(c) => (
              <CommentItem
                comment={c}
                replies={repliesByRoot.get(c.id) ?? EMPTY_REPLIES}
                actions={actions}
              />
            )}
          />
        )}
      </div>

      {/* flow：分页续加载（页面高度随评论数一起长） */}
      {isFlow && ready && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {remaining > 0 ? (
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Icon name="chevron-down" className="h-3.5 w-3.5" />
              加载更多评论（还剩 <span className="tabular-nums">{formatCount(remaining)}</span> 条）
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              已显示全部 <span className="tabular-nums">{formatCount(orderedRoots.length)}</span> 条评论
            </p>
          )}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
        </div>
      )}

      {/* 底部说明 */}
      <p className="mt-3 text-[11px] text-muted-foreground/80">
        {isFlow
          ? "评论随页面滚动、分批加载；点赞与新增评论保存在本机浏览器中。"
          : "仅渲染可视区行，滚动时复用节点；点赞与新增评论保存在本机浏览器中。"}
      </p>

      {/* 子评论抽屉 */}
      <ReplyPanel
        key={thread?.rootId ?? "closed"}
        root={threadRoot}
        replies={threadReplies}
        focusId={thread?.focusId}
        actions={actions}
        onClose={() => setThread(null)}
        onSubmit={(content, replyToName) => {
          if (!thread) return;
          addComment({ content, parentId: thread.rootId, replyToName });
        }}
        userName={userName}
        onUserNameChange={updateUserName}
      />
    </section>
  );
}

/** 共享空数组引用，避免每次渲染都新建 */
const EMPTY_REPLIES: never[] = [];

/* --------------------------------------------------------------------------
   骨架屏
   -------------------------------------------------------------------------- */

function CommentSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-live="polite">
      <span className="sr-only">评论加载中</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
          <div className="cmt-skel h-8.5 w-8.5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="cmt-skel h-3 w-24 rounded" />
            <div className="cmt-skel h-3 w-full rounded" />
            <div className="cmt-skel h-3 w-3/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
