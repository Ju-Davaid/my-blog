"use client";

import { useMemo, useState } from "react";
import CommentSection from "./CommentSection";
import Icon from "@/components/Icon";
import { formatCount, makeMomentConfig } from "@/lib/comments";

/* ==========================================================================
   动态页（朋友圈信息流）的评论入口
   --------------------------------------------------------------------------
   默认折叠：只在操作行展示条数，点击才挂载评论区。
   折叠态不生成任何数据，因此 1 屏 6 条动态也不会带来额外开销。
   ========================================================================== */

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
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const cfg = useMemo(() => makeMomentConfig(momentId), [momentId]);

  return (
    <>
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
          <Icon name="heart" className="h-3 w-3" style={{ fill: liked ? "currentColor" : "none" }} />
          赞 <span className="tabular-nums">{likes + (liked ? 1 : 0)}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
            open ? "text-primary" : "hover:text-primary"
          }`}
        >
          <Icon name="message-circle" className="h-3 w-3" />
          评论 <span className="tabular-nums">{formatCount(cfg.total)}</span>
          <Icon
            name={open ? "chevron-up" : "chevron-down"}
            className="h-3 w-3"
          />
        </button>
      </div>

      {open && (
        <div className="mt-4 border-t border-border pt-4">
          <CommentSection
            contentId={`moment-${momentId}`}
            seed={cfg}
            maxHeight={420}
            estimateSize={104}
            enabled={open}
          />
        </div>
      )}
    </>
  );
}
