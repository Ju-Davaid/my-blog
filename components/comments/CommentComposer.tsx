"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

const MAX_LEN = 500;

const EMOJIS = [
  "😀", "😂", "🥹", "😍", "🤔", "😭",
  "👍", "🎉", "🔥", "🌿", "📷", "💻",
];

type CommentComposerProps = {
  onSubmit: (content: string) => void;
  /** 当前正在回复的对象，为空表示发顶层评论 */
  replyTo?: { id: string; name: string } | null;
  onCancelReply?: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 抽屉内使用时更紧凑 */
  compact?: boolean;
};

/**
 * 评论输入框。自动撑高、字数约束、Cmd/Ctrl + Enter 提交、表情快捷输入。
 */
export default function CommentComposer({
  onSubmit,
  replyTo,
  onCancelReply,
  userName,
  onUserNameChange,
  placeholder = "说点什么…",
  autoFocus = false,
  compact = false,
}: CommentComposerProps) {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [rows, setRows] = useState(1);
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
    if (!text || over) return;
    onSubmit(text);
    setValue("");
    setShowEmoji(false);
  };

  const append = (emoji: string) => {
    setValue((v) => (v.length + emoji.length > MAX_LEN ? v : v + emoji));
    areaRef.current?.focus();
  };

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
          <div className="flex items-center gap-2">
            <input
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value.slice(0, 16))}
              placeholder="昵称"
              className={`rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 ${
                compact ? "w-24" : "w-28"
              }`}
            />
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              昵称会记在这台设备上
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
