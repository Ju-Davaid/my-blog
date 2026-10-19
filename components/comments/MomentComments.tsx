"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import {
  checkCaptcha,
  estimateTotal,
  formatCount,
  isValidEmail,
  makeMomentConfig,
  type Comment,
} from "@/lib/comments";
import Captcha from "./Captcha";
import { useComments } from "./useComments";

/* ==========================================================================
   动态页（朋友圈信息流）的评论区 —— 微信朋友圈样式 + 分页
   --------------------------------------------------------------------------
   · 默认展开：灰底扁平评论块直接可见，元信息行保留「💬 N」气泡可收起/再展开
   · 每页最多 10 条，底部「共 N 页 / 页码 / 下一页 / 收起」分页行（B 站式）
   · 无头像 / 无点赞 / 无排序，全部评论按时间正序分页平铺
   · 回复：点某条评论 → 输入框变为「回复 @昵称」，发布后以「回复 @xxx」归入同线程
   ========================================================================== */

const PAGE_SIZE = 5;

type MomentCommentsProps = {
  momentId: string;
  likes: number;
  category: string;
  date: string;
};

export default function MomentComments({
  momentId,
  likes,
  category,
  date,
}: MomentCommentsProps) {
  const [open, setOpen] = useState(true);
  const [liked, setLiked] = useState(false);
  const [page, setPage] = useState(1);
  const cfg = useMemo(() => makeMomentConfig(momentId), [momentId]);

  const {
    ready,
    all,
    total,
    addComment,
    removeComment,
    userName,
    updateUserName,
    userEmail,
    updateUserEmail,
  } = useComments(`moment-${momentId}`, cfg, open);

  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [draft, setDraft] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    captcha?: string;
  }>({});
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);

  /** 朋友圈式时间正序（新评论在末页） */
  const flat = useMemo(
    () => [...all].sort((a, b) => a.createdAt - b.createdAt),
    [all],
  );

  const rawPageCount = ready
    ? Math.max(1, Math.ceil(flat.length / PAGE_SIZE))
    : 1;
  /** 删除评论后总页数可能缩水，展示与切片都做钳制（不用 effect，规避 lint 规则） */
  const pageCount = rawPageCount;
  const currentPage = Math.min(page, pageCount);
  const paged = ready
    ? flat.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : [];
  const displayCount = ready ? total : estimateTotal(cfg);

  /** 页码窗口：≤7 页全量展示，否则 收拢为 1 … p-1 p p+1 … 末页 */
  const pagesToShow = useMemo<(number | "…")[]>(() => {
    if (pageCount <= 7)
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    const set = new Set<number>([1, pageCount]);
    for (const p of [currentPage - 1, currentPage, currentPage + 1]) {
      if (p > 1 && p < pageCount) set.add(p);
    }
    const nums = [...set].sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    let prev = 0;
    for (const n of nums) {
      if (n - prev > 1) out.push("…");
      out.push(n);
      prev = n;
    }
    return out;
  }, [pageCount, currentPage]);

  const goToPage = useCallback((n: number) => {
    setPage(n);
    // 换页后把面板顶部滚进视口，避免停留在长列表的旧位置
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }),
    );
  }, []);

  const submit = useCallback(() => {
    const content = draft.trim();
    const name = userName.trim();
    const email = userEmail.trim();
    if (!content) return;

    const next: typeof errors = {};
    if (!name) next.name = "请填写昵称";
    if (!email) next.email = "请填写邮箱";
    else if (!isValidEmail(email)) next.email = "邮箱格式不正确";
    if (!captchaInput.trim()) next.captcha = "请填写验证码";
    else if (!checkCaptcha(captchaInput, captchaCode))
      next.captcha = "验证码不正确";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      if (next.captcha) {
        setCaptchaInput("");
        setCaptchaNonce((n) => n + 1);
      }
      return;
    }

    if (replyTo) {
      addComment({
        content,
        parentId: replyTo.id,
        replyToName: replyTo.author.name,
        name,
        email,
      });
      setReplyTo(null);
    } else {
      addComment({ content, parentId: null, name, email });
    }
    setDraft("");
    setCaptchaInput("");
    setCaptchaNonce((n) => n + 1);
    // 新评论在时间正序的末尾，跳到最后一页并滚到面板底部
    setPage(Math.floor(flat.length / PAGE_SIZE) + 1);
    requestAnimationFrame(() =>
      tailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }, [
    draft,
    replyTo,
    addComment,
    flat.length,
    userName,
    userEmail,
    captchaInput,
    captchaCode,
  ]);

  return (
    <>
      {/* 元信息 + 操作行 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Icon name="calendar" className="h-3 w-3" />
          {category}
        </span>
        <span className="tabular-nums">{date}</span>

        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
            liked ? "text-destructive" : "hover:text-primary"
          }`}
        >
          <Icon
            name="heart"
            className="h-3 w-3"
            style={{ fill: liked ? "currentColor" : "none" }}
          />
          <span className="tabular-nums">{likes + (liked ? 1 : 0)}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`评论 ${formatCount(displayCount)} 条`}
          className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
            open ? "text-primary" : "hover:text-primary"
          }`}
        >
          <Icon name="message-circle" className="h-3.5 w-3.5" />
          <span className="tabular-nums">{formatCount(displayCount)}</span>
        </button>
      </div>

      {/* 朋友圈式评论块（默认展开） */}
      {open && (
        <div ref={panelRef} className="mt-2.5 rounded-lg bg-muted/70 px-4 py-3">
          {!ready ? (
            <div className="space-y-2 py-1" aria-busy="true" aria-live="polite">
              <span className="sr-only">评论加载中</span>
              {[64, 88, 48].map((w, i) => (
                <div
                  key={i}
                  className="cmt-skel h-3 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <p className="py-1 text-[13px] text-muted-foreground">
              还没有评论，来抢沙发～
            </p>
          ) : (
            <ul className="space-y-2.5">
              {paged.map((c) => (
                <li key={c.id} className="text-[13px] leading-relaxed">
                  <p className="flex flex-wrap items-center gap-x-2">
                    <button
                      type="button"
                      onClick={() => setReplyTo(c)}
                      title={`回复 @${c.author.name}`}
                      className="cursor-pointer text-left"
                    >
                      <span className="text-primary/90 transition-colors hover:text-primary">
                        {c.author.name}
                      </span>
                      {c.replyToName && (
                        <span className="text-muted-foreground">
                          {" "}
                          回复{" "}
                          <span className="text-primary/90">
                            @{c.replyToName}
                          </span>
                        </span>
                      )}
                    </button>
                    {c.mine && (
                      <button
                        type="button"
                        onClick={() => removeComment(c.id)}
                        className="cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                      >
                        删除
                      </button>
                    )}
                  </p>
                  <p className="mt-0.5 text-card-foreground">{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          {/* 底部输入区：昵称 / 邮箱 / 验证码 均为必填 */}
          {ready && (
            <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
              {replyTo && (
                <span className="inline-flex max-w-40 items-center gap-1 truncate rounded bg-primary/10 px-2 py-1 text-[11px] text-primary">
                  回复 @{replyTo.author.name}
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    aria-label="取消回复"
                    className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}

              <div className="flex items-center gap-2">
                <input
                  value={userName}
                  onChange={(e) => {
                    updateUserName(e.target.value.slice(0, 16));
                    if (errors.name)
                      setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="昵称 *"
                  aria-label="昵称"
                  className={`w-24 rounded-md border bg-background px-2 py-1.5 text-[12px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 ${
                    errors.name ? "border-destructive/70" : "border-border"
                  }`}
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => {
                    updateUserEmail(e.target.value.slice(0, 64));
                    if (errors.email)
                      setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="邮箱 *"
                  aria-label="邮箱"
                  className={`min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 ${
                    errors.email ? "border-destructive/70" : "border-border"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value.slice(0, 6));
                    if (errors.captcha)
                      setErrors((p) => ({ ...p, captcha: undefined }));
                  }}
                  placeholder="验证码 *"
                  aria-label="验证码"
                  className={`w-20 rounded-md border bg-background px-2 py-1.5 text-center text-[12px] tracking-widest text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary/50 ${
                    errors.captcha ? "border-destructive/70" : "border-border"
                  }`}
                />
                <Captcha
                  onChange={setCaptchaCode}
                  refreshKey={captchaNonce}
                  compact
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      submit();
                  }}
                  placeholder={
                    replyTo ? `回复 @${replyTo.author.name}…` : "评论内容 *"
                  }
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={!draft.trim()}
                  className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  发送
                </button>
              </div>

              {(errors.name || errors.email || errors.captcha) && (
                <p className="text-[11px] text-destructive" role="alert">
                  {errors.name ?? errors.email ?? errors.captcha}
                </p>
              )}
            </div>
          )}

          {/* 分页行：共 N 页 · 页码 · 上一页/下一页 · 收起 */}
          {ready && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              <span>
                共 <span className="tabular-nums">{pageCount}</span> 页
              </span>

              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  className="cursor-pointer transition-colors hover:text-primary"
                >
                  上一页
                </button>
              )}

              <span className="flex items-center gap-1">
                {pagesToShow.map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="select-none px-0.5">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => p !== currentPage && goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`min-w-6 cursor-pointer rounded px-1 py-0.5 text-center tabular-nums transition-colors ${
                        p === currentPage
                          ? "bg-primary/15 font-medium text-primary"
                          : "hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </span>

              {currentPage < pageCount && (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  className="cursor-pointer transition-colors hover:text-primary"
                >
                  下一页
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer transition-colors hover:text-primary"
              >
                收起
              </button>
            </div>
          )}

          <div ref={tailRef} className="h-px w-full" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
