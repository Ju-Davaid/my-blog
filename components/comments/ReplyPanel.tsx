"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Avatar from "./Avatar";
import CommentComposer from "./CommentComposer";
import CommentList, { type CommentListApi } from "./CommentList";
import { ReplyRow, type ReplyActions } from "./CommentItem";
import Icon from "@/components/Icon";
import { formatCount, formatTime, type Comment } from "@/lib/comments";

/* ==========================================================================
   子评论抽屉
   --------------------------------------------------------------------------
   抖音式「查看全部 N 条回复」：原评论固定在顶部，回复列表独立虚拟滚动，
   底部常驻输入框，点击某条回复即进入「回复 @某人」状态。
   由父级用 key={rootId} 挂载，切换线程时内部状态自动重置。
   ========================================================================== */

type ReplyPanelProps = {
  root: Comment | null;
  replies: Comment[];
  focusId?: string;
  actions: ReplyActions;
  onClose: () => void;
  onSubmit: (content: string, replyToName?: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
};

export default function ReplyPanel({
  root,
  replies,
  focusId,
  actions,
  onClose,
  onSubmit,
  userName,
  onUserNameChange,
}: ReplyPanelProps) {
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const apiRef = useRef<CommentListApi | null>(null);
  const prevLenRef = useRef(replies.length);

  /* 抽屉内的「回复」动作：把输入框切到回复 @某人 */
  const panelActions = useMemo<ReplyActions>(
    () => ({
      ...actions,
      onReply: (c: Comment) => setReplyTo({ id: c.id, name: c.author.name }),
    }),
    [actions],
  );

  /* 锁滚动 + ESC 关闭 */
  useEffect(() => {
    if (!root) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [root, onClose]);

  /* 定位到被点击的那条回复 */
  useEffect(() => {
    if (!root || !focusId) return;
    const idx = replies.findIndex((r) => r.id === focusId);
    if (idx < 0) return;
    const timer = setTimeout(() => apiRef.current?.scrollToIndex(idx, "center"), 60);
    return () => clearTimeout(timer);
  }, [root, focusId, replies]);

  /* 新回复发布后滚到底部 */
  useEffect(() => {
    const grew = replies.length > prevLenRef.current;
    prevLenRef.current = replies.length;
    if (!grew || !replies.length) return;
    const timer = setTimeout(
      () => apiRef.current?.scrollToIndex(replies.length - 1, "start"),
      90,
    );
    return () => clearTimeout(timer);
  }, [replies]);

  // 只在用户交互后挂载，此时必定在浏览器环境
  if (!root || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="cmt-overlay" onClick={onClose} aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-71 flex items-end justify-center sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="子评论"
          className="cmt-sheet pointer-events-auto flex h-[82vh] w-full max-w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-[0_24px_70px_-20px_rgba(0,0,0,0.55)] sm:h-[74vh] sm:max-w-2xl sm:rounded-2xl"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="font-serif text-sm text-foreground">
              共 <span className="tabular-nums">{formatCount(replies.length)}</span> 条回复
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>

          {/* 原评论 */}
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex gap-2.5">
              <Avatar src={root.author.avatar} alt={root.author.name} size={28} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    {root.author.name}
                  </span>
                  {root.author.badge && (
                    <span className="tag scale-90 px-1.5 py-0">{root.author.badge}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatTime(root.createdAt)}
                  </span>
                </div>
                <p
                  className="mt-0.5 text-[13px] leading-relaxed text-card-foreground"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                >
                  {root.content}
                </p>
              </div>
            </div>
          </div>

          {/* 回复列表 */}
          <div className="flex min-h-0 flex-1 flex-col">
            <CommentList
              items={replies}
              estimateSize={78}
              gap={12}
              className="px-4 py-3"
              style={{ flex: 1, minHeight: 0, maxHeight: "none" }}
              apiRef={apiRef}
              renderItem={(c) => (
                <div
                  className={`rounded-lg px-2 py-1.5 transition-colors ${
                    c.id === focusId ? "cmt-flash" : ""
                  }`}
                >
                  <ReplyRow comment={c} actions={panelActions} />
                </div>
              )}
            />
          </div>

          {/* 输入框 */}
          <div className="border-t border-border p-3">
            <CommentComposer
              compact
              onSubmit={(content) => {
                onSubmit(content, replyTo?.name);
                setReplyTo(null);
              }}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              userName={userName}
              onUserNameChange={onUserNameChange}
              placeholder={
                replyTo
                  ? "写下你的回复…"
                  : replies.length
                    ? `回复 ${root.author.name}…`
                    : "写下第一条回复…"
              }
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
