"use client";

import { useEffect, useRef, useState } from "react";
import Captcha from "./Captcha";
import { Icon } from "@/components/ui";
import { checkCaptcha, isValidEmail } from "@/lib/comments";

const MAX_LEN = 500;
const MAX_NAME = 16;

const EMOJIS = [
  "😀", "😂", "🥹", "😍", "🤔", "😭",
  "👍", "🎉", "🔥", "🌿", "📷", "💻",
];

export type CommentIdentity = { name: string; email: string };

type CommentComposerProps = {
  /** 三个必填项都通过校验后才会触发，附带本次提交的身份信息 */
  onSubmit: (content: string, identity: CommentIdentity) => void;
  /** 当前正在回复的对象，为空表示发顶层评论 */
  replyTo?: { id: string; name: string } | null;
  onCancelReply?: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  userEmail: string;
  onUserEmailChange: (email: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 抽屉内使用时更紧凑 */
  compact?: boolean;
};

/**
 * 评论输入框。自动撑高、字数约束、Cmd/Ctrl + Enter 提交、表情快捷输入。
 * 发表前必须填写：昵称、邮箱、图形验证码（三项均在本组件内校验）。
 */
export default function CommentComposer({
  onSubmit,
  replyTo,
  onCancelReply,
  userName,
  onUserNameChange,
  userEmail,
  onUserEmailChange,
  placeholder = "说点什么…",
  autoFocus = false,
  compact = false,
}: CommentComposerProps) {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [rows, setRows] = useState(1);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [errors, setErrors] = useState<{ name?: string; email?: string; captcha?: string }>({});
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const len = value.length;
  const over = len > MAX_LEN;

  /* 自动撑高（最多 6 行） */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const line = 22;
    const max = line * 6;
    const h = Math.min(el.scrollHeight, max);
    el.style.height = `${h}px`;
    setRows(Math.max(1, Math.min(6, Math.round(h / line))));
  }, [value]);

  useEffect(() => {
    if (autoFocus) areaRef.current?.focus();
  }, [autoFocus, replyTo?.id]);

  const submit = () => {
    const text = value.trim();
    const name = userName.trim();
    const email = userEmail.trim();
    const next: typeof errors = {};

    if (!text) return;
    if (!name) next.name = "请填写昵称";
    if (!email) next.email = "请填写邮箱";
    else if (!isValidEmail(email)) next.email = "邮箱格式不正确";
    if (!captchaInput.trim()) next.captcha = "请填写验证码";
    else if (!checkCaptcha(captchaInput, captchaCode)) next.captcha = "验证码不正确";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      // 验证码用过即废，无论对错都换一张
      if (next.captcha) {
        setCaptchaInput("");
        setCaptchaNonce((n) => n + 1);
      }
      return;
    }

    onSubmit(text, { name, email });
    setValue("");
    setShowEmoji(false);
    setCaptchaInput("");
    setCaptchaNonce((n) => n + 1);
  };

  const append = (emoji: string) => {
    setValue((v) => (v.length + emoji.length > MAX_LEN ? v : v + emoji));
    areaRef.current?.focus();
  };

  const fieldCls = (invalid?: boolean) =>
    `rounded-md border bg-card px-2 py-1 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 ${
      invalid ? "border-destructive/70" : "border-border"
    }`;

  return (
    <div className="rounded-xl border border-border bg-background/70 p-3 transition-colors focus-within:border-primary/50">
      {replyTo && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="corner-down-right" className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">
            回复 <span className="text-primary">@{replyTo.name}</span>
          </span>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="ml-1 cursor-pointer rounded px-1 leading-none transition-colors hover:text-destructive"
              aria-label="取消回复"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* 身份：昵称 + 邮箱 */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={userName}
              maxLength={MAX_NAME}
              onChange={(e) => {
                onUserNameChange(e.target.value.slice(0, MAX_NAME));
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="昵称 *"
              aria-label="昵称"
              className={`${fieldCls(!!errors.name)} ${
                compact ? "w-24" : "w-28"
              }`}
            />
            <input
              type="email"
              value={userEmail}
              onChange={(e) => {
                onUserEmailChange(e.target.value.slice(0, 64));
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="邮箱 *"
              aria-label="邮箱"
              autoComplete="email"
              className={`${fieldCls(!!errors.email)} ${
                compact ? "w-40" : "w-48"
              }`}
            />
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              昵称与邮箱会记在这台设备上，不会公开
            </span>
          </div>

          <textarea
            ref={areaRef}
            value={value}
            rows={rows}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
          />

          {/* 验证码 */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value.slice(0, 6));
                if (errors.captcha) setErrors((p) => ({ ...p, captcha: undefined }));
              }}
              placeholder="验证码 *"
              aria-label="验证码"
              aria-invalid={!!errors.captcha}
              className={`${fieldCls(!!errors.captcha)} w-24 text-center tracking-widest`}
            />
            <Captcha
              onChange={setCaptchaCode}
              refreshKey={captchaNonce}
              compact={compact}
            />
          </div>

          {(errors.name || errors.email || errors.captcha) && (
            <p className="text-[11px] text-destructive" role="alert">
              {errors.name ?? errors.email ?? errors.captcha}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            aria-label="表情"
            className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:border-primary/50 hover:text-primary ${
              showEmoji ? "border-primary/50 text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon name="smile" className="h-4 w-4" />
          </button>
          <span
            className={`text-[11px] tabular-nums ${
              over ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {len}/{MAX_LEN}
          </span>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || over}
          title={
            !value.trim()
              ? "请先写点内容"
              : "发送（昵称、邮箱、验证码必填）"
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="send" className="h-3.5 w-3.5" />
          发送
        </button>
      </div>

      {showEmoji && (
        <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => append(e)}
              className="h-7 w-7 cursor-pointer rounded-md text-base leading-none transition-colors hover:bg-muted"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
