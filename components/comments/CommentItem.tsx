"use client";

import { memo, useState, type ReactNode } from "react";
import Avatar from "./Avatar";
import { Icon } from "@/components/ui";
import { formatCount, formatTime, type Comment } from "@/lib/comments";

/* ==========================================================================
   单条评论 / 子评论行
   --------------------------------------------------------------------------
   抖音式结构：
   · 顶层评论：头像 + 昵称 + 内容 + 右侧点赞列 + 元信息行
   · 内联子评论：灰底容器，默认只露前 2 条，超出用「查看全部 N 条回复」开抽屉
   ========================================================================== */

export type CommentActions = {
  onLike: (id: string) => void;
  onReply: (comment: Comment) => void;
  onDelete: (id: string) => void;
};

/** 子评论行动作（内联展开后复用） */
export type ReplyActions = CommentActions;

const INLINE_REPLIES = 2;
/** 内联展开回复时每页条数 */
const REPLY_PAGE_SIZE = 5;

const MENTION_RE = /(@[^\s@，。！？、；：,.!?;:]{1,16})/g;
/**
 * 渲染评论内容中的 @提及，最多 16 个字符，支持中文、英文、数字、下划线。
 * @param text 评论内容
 * @returns 渲染后的评论内容
 */
function renderMentions(text: string) {
  const parts = text.split(MENTION_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    MENTION_RE.test(part) && part.startsWith("@") ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function CommentText({ text, clamp = 5 }: { text: string; clamp?: number }) {
  const [open, setOpen] = useState(false);
  const foldable = text.length > 90;

  return (
    <p
      className="mt-1 text-sm leading-relaxed text-card-foreground"
      style={
        foldable && !open
          ? {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: clamp,
              overflow: "hidden",
            }
          : undefined
      }
    >
      {renderMentions(text)}
      {foldable && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-1 cursor-pointer align-baseline text-xs text-primary/90 transition-colors hover:text-primary"
        >
          {open ? "收起" : "展开"}
        </button>
      )}
    </p>
  );
}

/* --------------------------------------------------------------------------
   点赞
   -------------------------------------------------------------------------- */

function LikeButton({
  active,
  count,
  onClick,
  size = "md",
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  const [tick, setTick] = useState(0);
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  return (
    <button
      type="button"
      onClick={() => {
        setTick((t) => t + 1);
        onClick();
      }}
      aria-pressed={active}
      aria-label={active ? "取消点赞" : "点赞"}
      className={`inline-flex shrink-0 cursor-pointer select-none flex-col items-center gap-0.5 px-1 transition-colors ${
        active
          ? "text-destructive"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        key={tick}
        className={tick > 0 ? "cmt-like-pop inline-flex" : "inline-flex"}
      >
        <Icon
          name="heart"
          className={icon}
          style={{ fill: active ? "currentColor" : "none" }}
        />
      </span>
      <span className="text-[11px] leading-none tabular-nums">
        {count > 0 ? formatCount(count) : ""}
      </span>
    </button>
  );
}

/* --------------------------------------------------------------------------
   子评论行（抽屉内与内联共用）
   -------------------------------------------------------------------------- */

function ReplyRow({
  comment,
  actions,
  dense = false,
}: {
  comment: Comment;
  actions: ReplyActions;
  dense?: boolean;
}) {
  return (
    <div className="group flex gap-2.5">
      <Avatar
        src={comment.author.avatar}
        alt={comment.author.name}
        size={dense ? 24 : 26}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-xs font-medium text-foreground/85">
            {comment.author.name}
          </span>
          {comment.author.badge && (
            <span className="tag shrink-0 scale-90 px-1.5 py-0">
              {comment.author.badge}
            </span>
          )}
          {comment.replyToName && !comment.content.startsWith("@") && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              回复 @{comment.replyToName}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-card-foreground">
          {renderMentions(comment.content)}
        </p>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{formatTime(comment.createdAt)}</span>
          {comment.location && <span>{comment.location}</span>}
          <button
            type="button"
            onClick={() => actions.onReply(comment)}
            className="cursor-pointer transition-colors hover:text-primary"
          >
            回复
          </button>
          {comment.mine && (
            <button
              type="button"
              onClick={() => actions.onDelete(comment.id)}
              className="cursor-pointer transition-colors hover:text-destructive"
            >
              删除
            </button>
          )}
          <span className="flex-1" />
          <LikeButton
            size="sm"
            active={comment.liked}
            count={comment.likes}
            onClick={() => actions.onLike(comment.id)}
          />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   顶层评论
   -------------------------------------------------------------------------- */

function CommentItem({
  comment,
  replies,
  actions,
  replyToId,
  composer,
}: {
  comment: Comment;
  replies: Comment[];
  actions: CommentActions;
  /** 正在回复的评论 id（顶层或其子评论），命中时在该评论下方渲染内联输入框 */
  replyToId?: string;
  /** 内联回复输入框（由父级统一构造，避免每项重复状态） */
  composer?: ReactNode;
}) {
  const total = replies.length;
  const [expanded, setExpanded] = useState(false);
  const [replyPage, setReplyPage] = useState(1);

  // 抖音式：短线程直接铺开，长线程只露前 2 条，其余内联分页展开
  const hasMore = total > INLINE_REPLIES;
  const visible = hasMore ? replies.slice(0, INLINE_REPLIES) : replies;

  // 展开后的分页窗口（从第 3 条开始，因为前 2 条已在内联预览里）
  const rest = hasMore ? replies.slice(INLINE_REPLIES) : [];
  const pageCount = Math.max(1, Math.ceil(rest.length / REPLY_PAGE_SIZE));
  const safePage = Math.min(replyPage, pageCount);
  const paged = rest.slice((safePage - 1) * REPLY_PAGE_SIZE, safePage * REPLY_PAGE_SIZE);

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30">
      <div className="flex gap-3">
        <Avatar
          src={comment.author.avatar}
          alt={comment.author.name}
          size={34}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-medium text-foreground">
                  {comment.author.name}
                </span>
                {comment.author.badge && (
                  <span className="tag scale-90 px-1.5 py-0">
                    {comment.author.badge}
                  </span>
                )}
                {comment.mine && comment.author.badge !== "我" && (
                  <span className="text-[11px] text-muted-foreground">
                    （我）
                  </span>
                )}
              </div>
              <CommentText text={comment.content} />
            </div>

            <LikeButton
              active={comment.liked}
              count={comment.likes}
              onClick={() => actions.onLike(comment.id)}
            />
          </div>

          {/* 元信息 */}
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {formatTime(comment.createdAt)}
            </span>
            {comment.location && <span>{comment.location}</span>}
            <button
              type="button"
              onClick={() => actions.onReply(comment)}
              className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-primary"
            >
              <Icon name="corner-down-right" className="h-3 w-3" />
              回复
            </button>
            {comment.mine && (
              <button
                type="button"
                onClick={() => actions.onDelete(comment.id)}
                className="cursor-pointer transition-colors hover:text-destructive"
              >
                删除
              </button>
            )}
          </div>

          {/* 回复这条顶层评论：输入框内联出现在下方 */}
          {replyToId === comment.id && composer}

          {/* 内联子评论 */}
          {total > 0 && (
            <div className="mt-2.5 rounded-lg bg-muted/70 px-3 py-2.5">
              <div className="space-y-2.5">
                {visible.map((r) => (
                  <div key={r.id}>
                    <ReplyRow comment={r} actions={actions} dense />
                    {replyToId === r.id && composer}
                  </div>
                ))}

                {/* 展开后的分页回复 */}
                {expanded &&
                  paged.map((r) => (
                    <div key={r.id}>
                      <ReplyRow comment={r} actions={actions} dense />
                      {replyToId === r.id && composer}
                    </div>
                  ))}
              </div>

              {hasMore && (
                <div className="mt-2.5">
                  {!expanded ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary transition-colors hover:opacity-80"
                    >
                      <Icon name="message-circle" className="h-3.5 w-3.5" />
                      查看全部 {total} 条回复
                      <Icon name="chevron-down" className="h-3 w-3" />
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                      {pageCount > 1 && (
                        <span className="flex items-center gap-1">
                          {safePage > 1 && (
                            <button
                              type="button"
                              onClick={() => setReplyPage((p) => Math.max(1, p - 1))}
                              className="cursor-pointer transition-colors hover:text-primary"
                            >
                              上一页
                            </button>
                          )}
                          <span className="tabular-nums">
                            {safePage} / {pageCount}
                          </span>
                          {safePage < pageCount && (
                            <button
                              type="button"
                              onClick={() => setReplyPage((p) => Math.min(pageCount, p + 1))}
                              className="cursor-pointer transition-colors hover:text-primary"
                            >
                              下一页
                            </button>
                          )}
                        </span>
                      )}
                      <span className="flex-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(false);
                          setReplyPage(1);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-primary"
                      >
                        <Icon name="chevron-up" className="h-3 w-3" />
                        收起
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CommentItem);
export { ReplyRow };
