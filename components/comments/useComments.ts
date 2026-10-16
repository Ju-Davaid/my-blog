"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  compareRoot,
  createCommentId,
  loadUserEmail,
  loadUserName,
  localCommentStore,
  saveUserEmail,
  saveUserName,
  type Comment,
  type CommentAuthor,
  type CommentOverrides,
  type SeedConfig,
  type SortMode,
} from "@/lib/comments";

/* ==========================================================================
   评论状态管理
   --------------------------------------------------------------------------
   · 首次展开才生成数据（折叠态零成本）
   · 扁平存储 + 索引派生：byId / repliesByRoot / orderedRoots
   · 点赞不改变排序，避免滚动中列表跳动
   ========================================================================== */

export type CommentInput = {
  content: string;
  /** null 表示发顶层评论 */
  parentId: string | null;
  replyToName?: string;
  /** 提交时填写的昵称，缺省回退到状态中的昵称 */
  name?: string;
  /** 提交时填写的邮箱（本地留档，不写入展示内容） */
  email?: string;
};

export function useComments(contentId: string, cfg: SeedConfig, enabled: boolean) {
  const [all, setAll] = useState<Comment[]>([]);
  const [ready, setReady] = useState(false);
  const [sort, setSort] = useState<SortMode>("hot");
  // 评论区只在浏览器中挂载（折叠/进入视口后才渲染），因此可以直接读本地身份
  const [userName, setUserName] = useState(() => loadUserName());
  const [userEmail, setUserEmail] = useState(() => loadUserEmail());
  const overridesRef = useRef<CommentOverrides | null>(null);

  /* ---------- 加载 ---------- */
  useEffect(() => {
    if (!enabled || ready) return;
    let cancelled = false;
    // 让首帧先出来，再把生成/读取放到下一个宏任务，避免阻塞交互
    const timer = setTimeout(() => {
      if (cancelled) return;
      const { comments, overrides } = localCommentStore.load(contentId, cfg);
      overridesRef.current = overrides;
      setAll(comments);
      setReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, ready, contentId, cfg]);

  /* ---------- 派生索引 ---------- */
  const byId = useMemo(() => {
    const m = new Map<string, Comment>();
    for (const c of all) m.set(c.id, c);
    return m;
  }, [all]);

  const repliesByRoot = useMemo(() => {
    const m = new Map<string, Comment[]>();
    for (const c of all) {
      if (!c.parentId) continue;
      const arr = m.get(c.rootId);
      if (arr) arr.push(c);
      else m.set(c.rootId, [c]);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.createdAt - b.createdAt);
    return m;
  }, [all]);

  const orderedRoots = useMemo(() => {
    const mine: Comment[] = [];
    const rest: Comment[] = [];
    for (const c of all) {
      if (c.parentId) continue;
      if (c.mine) mine.push(c);
      else rest.push(c);
    }
    mine.sort((a, b) => b.createdAt - a.createdAt);
    rest.sort((a, b) => compareRoot(a, b, sort));
    return mine.concat(rest);
  }, [all, sort]);

  /* ---------- 持久化 ---------- */
  const persist = useCallback(() => {
    const o = overridesRef.current;
    if (o) localCommentStore.save(contentId, o);
  }, [contentId]);

  /* ---------- 动作 ---------- */
  const author = useMemo<CommentAuthor>(
    () => ({
      name: userName.trim() || "我",
      avatar: "https://picsum.photos/seed/mori-me/80/80",
      badge: userName.trim() ? "我" : undefined,
      isOwner: true,
    }),
    [userName],
  );

  const addComment = useCallback(
    (input: CommentInput): Comment => {
      const content = input.content.trim();
      const name = input.name?.trim() || userName.trim() || "我";
      const id = createCommentId();
      // 扁平线程：回复「某条回复」时仍归属同一个顶层线程，靠 replyToName 表达 @
      const target = input.parentId ? byId.get(input.parentId) : null;
      const c: Comment = {
        id,
        parentId: target ? target.rootId : null,
        rootId: target ? target.rootId : id,
        author: { ...author, name, badge: name === "我" ? undefined : "我" },
        content,
        createdAt: Date.now(),
        likes: 0,
        liked: false,
        replyToName: input.replyToName,
        location: "本机",
        mine: true,
      };
      setAll((prev) => [c].concat(prev));
      const o = overridesRef.current;
      if (o) {
        o.added = [c].concat(o.added);
        persist();
      }
      return c;
    },
    [author, byId, persist, userName],
  );

  const toggleLike = useCallback(
    (id: string) => {
      setAll((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, liked: !c.liked, likes: Math.max(0, c.likes + (c.liked ? -1 : 1)) }
            : c,
        ),
      );
      const o = overridesRef.current;
      if (!o) return;
      const has = o.likes.includes(id);
      const target = byId.get(id);
      const nextLiked = target ? !target.liked : !has;
      o.likes = nextLiked ? o.likes.concat(id) : o.likes.filter((x) => x !== id);
      persist();
    },
    [byId, persist],
  );

  const removeComment = useCallback(
    (id: string) => {
      const target = byId.get(id);
      if (!target?.mine) return;
      setAll((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
      const o = overridesRef.current;
      if (o) {
        o.removed = o.removed.concat(id);
        o.added = o.added.filter((c) => c.id !== id);
        persist();
      }
    },
    [byId, persist],
  );

  const updateUserName = useCallback((name: string) => {
    setUserName(name);
    saveUserName(name);
  }, []);

  const updateUserEmail = useCallback((email: string) => {
    setUserEmail(email);
    saveUserEmail(email);
  }, []);

  const replyCountOf = useCallback(
    (rootId: string) => repliesByRoot.get(rootId)?.length ?? 0,
    [repliesByRoot],
  );

  return {
    ready,
    sort,
    setSort,
    all,
    byId,
    orderedRoots,
    repliesByRoot,
    total: all.length,
    rootCount: orderedRoots.length,
    addComment,
    toggleLike,
    removeComment,
    replyCountOf,
    userName,
    updateUserName,
    userEmail,
    updateUserEmail,
  };
}
