"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ==========================================================================
   极简虚拟滚动
   --------------------------------------------------------------------------
   · 变高行：先按 estimateSize 占位，行挂载后把实测高度回传给 onMeasure
   · 行高以 key（而非下标）为单位缓存，列表增删/上浮时不会错位
   · 偏移表 + 二分查找定位可视区间，O(log n) 而非 O(n)
   · 滚动 rAF 节流；连续测量走函数式更新，同一帧内合并成一次渲染
   · 两种滚动源：
       container —— 自带滚动容器（固定 maxHeight，高度不随数据增长）
       window    —— 容器高度 = 内容总高，跟着页面滚（B 站评论区那种手感）
   ========================================================================== */

export type VirtualItem = {
  index: number;
  key: string;
  /** 相对滚动内容顶部的偏移量（px） */
  start: number;
};

type Options = {
  /** 行数 */
  count: number;
  /** 兜底行高估值，越接近真实值、测量回填带来的跳动越小 */
  estimateSize: number;
  /** 按行给出的更精确估值（key → px），能显著减少测量回填 */
  estimates?: Map<string, number>;
  /** 行间距 */
  gap?: number;
  /** 视口上下额外渲染的行数 */
  overscan?: number;
  /** 行 key，必须稳定且唯一 */
  getKey: (index: number) => string;
  /** 滚动源，默认 container */
  mode?: "container" | "window";
};

/** 高度差在这个范围内不做更新，避免亚像素抖动引起反复重排 */
const EPS = 0.5;

export const useVirtualList = ({
  count,
  estimateSize,
  estimates,
  gap = 0,
  overscan = 6,
  getKey,
  mode = "container",
}: Options) => {
  // 是否是 window 模式
  const isWindow = mode === "window";
  // 虚拟列表容器元素
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // 
  const rafRef = useRef(0);
  // 测量函数引用
  const measureRef = useRef<() => void>(() => {});
  // 行高缓存
  const [sizes, setSizes] = useState<Map<string, number>>(() => new Map());
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(0);

  const estimateOf = useCallback(
    (key: string) => sizes.get(key) ?? estimates?.get(key) ?? estimateSize,
    [sizes, estimates, estimateSize],
  );

  /** 几何信息：偏移表 + 总高 */
  const geometry = useMemo(() => {
    const offsets = new Array<number>(count);
    let acc = 0;
    for (let i = 0; i < count; i++) {
      offsets[i] = acc;
      acc += estimateOf(getKey(i)) + gap;
    }
    return { offsets, total: count > 0 ? Math.max(0, acc - gap) : 0 };
  }, [count, getKey, estimateOf, gap]);

  /* ---------- 测量回填（由行组件在 effect 中调用） ---------- */
  const onMeasure = useCallback((key: string, height: number) => {
    if (height <= 0) return;
    setSizes((prev) => {
      const old = prev.get(key);
      if (old !== undefined && Math.abs(old - height) <= EPS) return prev;
      const next = new Map(prev);
      next.set(key, height);
      return next;
    });
  }, []);

  /* ---------- 可视区间 ---------- */
  const range = useMemo(() => {
    if (count <= 0) return { start: 0, end: 0 };
    if (viewport <= 0) {
      // 首帧（尚未测量）或列表整体在视口外，先给一段占位行
      return { start: 0, end: Math.min(count, overscan * 2 + 2) };
    }

    const { offsets } = geometry;
    let lo = 0;
    let hi = count;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offsets[mid] + estimateOf(getKey(mid)) + gap <= scrollTop)
        lo = mid + 1;
      else hi = mid;
    }
    const start = Math.max(0, lo - overscan);
    const limit = scrollTop + viewport;
    let end = lo;
    while (end < count && offsets[end] < limit) end++;
    end = Math.min(count, Math.max(end + overscan, start + 1));
    return { start, end };
  }, [geometry, scrollTop, viewport, count, getKey, estimateOf, gap, overscan]);

  const items = useMemo<VirtualItem[]>(() => {
    const list: VirtualItem[] = [];
    for (let i = range.start; i < range.end; i++) {
      list.push({ index: i, key: getKey(i), start: geometry.offsets[i] });
    }
    return list;
  }, [range, getKey, geometry]);

  /* ---------- 监听滚动源 ---------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const commit = (nextTop: number, nextViewport: number) => {
      setScrollTop((prev) => (Math.abs(prev - nextTop) < EPS ? prev : nextTop));
      setViewport((prev) =>
        Math.abs(prev - nextViewport) < EPS ? prev : nextViewport,
      );
    };

    const measure = () => {
      if (!isWindow) {
        commit(el.scrollTop, el.clientHeight);
        return;
      }
      // 页面滚动：把「容器顶部相对视口的位置」换算成列表内部滚动量，
      // 这样二分定位依旧以列表内容坐标为基准，无需知道页面绝对偏移。
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight || document.documentElement.clientHeight;
      const height = rect.height;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(0, height));
      const visible = Math.max(
        0,
        Math.min(height - scrolled, winH - Math.max(rect.top, 0)),
      );
      commit(scrolled, visible);
    };
    measureRef.current = measure;

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        measure();
      });
    };

    // 首帧先量一次，避免等到用户滚动才有可视区间
    measure();

    if (isWindow) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    } else {
      el.addEventListener("scroll", onScroll, { passive: true });
    }

    // 容器自身尺寸变化（数据增减、样式变化）
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);

    return () => {
      if (isWindow) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      measureRef.current = () => {};
    };
  }, [isWindow]);

  /* ---------- 行数/总高变化后重新校准（页面滚动模式下尤其重要） ---------- */
  useEffect(() => {
    const id = requestAnimationFrame(() => measureRef.current());
    return () => cancelAnimationFrame(id);
  }, [count, geometry.total]);

  /* ---------- 命令式滚动 ---------- */
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" = "center") => {
      const el = scrollRef.current;
      const offsets = geometry.offsets;
      if (!el || !offsets.length) return;
      const idx = Math.min(Math.max(0, index), offsets.length - 1);
      const size = estimateOf(getKey(idx));

      if (isWindow) {
        const docTop =
          el.getBoundingClientRect().top + window.scrollY + offsets[idx];
        const top =
          align === "center"
            ? docTop - (window.innerHeight - size) / 2
            : docTop;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return;
      }

      let top = offsets[idx];
      if (align === "center") top -= (el.clientHeight - size) / 2;
      el.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    },
    [geometry, getKey, estimateOf, isWindow],
  );

  const scrollToTop = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isWindow) {
      const docTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, docTop), behavior: "smooth" });
      return;
    }
    el.scrollTo({ top: 0 });
  }, [isWindow]);

  return {
    scrollRef,
    items,
    totalSize: geometry.total,
    viewport,
    onMeasure,
    scrollToIndex,
    scrollToTop,
  };
};
