"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useVirtualList } from "./useVirtualList";

/* ==========================================================================
   虚拟滚动列表
   --------------------------------------------------------------------------
   只管「滚动 + 定位 + 复用」，渲染交给 renderItem。
   顶层评论列表与子评论抽屉共用同一份实现，行高由行自身测量后回传。
   ========================================================================== */

export type CommentListApi = {
  scrollToIndex: (index: number, align?: "start" | "center") => void;
  scrollToTop: () => void;
};

type CommentListProps<T extends { id: string }> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** 兜底行高估值 */
  estimateSize: number;
  /** 按条目内容给出更精确的估值，减少测量回填（需为稳定引用） */
  estimateOf?: (item: T) => number;
  gap?: number;
  maxHeight?: number | string;
  /** container：固定高度内部滚动；window：高度撑开，跟随页面滚动 */
  mode?: "container" | "window";
  className?: string;
  style?: CSSProperties;
  apiRef?: React.RefObject<CommentListApi | null>;
};

export default function CommentList<T extends { id: string }>({
  items,
  renderItem,
  estimateSize,
  estimateOf,
  gap = 10,
  maxHeight,
  mode = "container",
  className = "",
  style,
  apiRef,
}: CommentListProps<T>) {
  const isWindow = mode === "window";
  const getKey = useCallback((index: number) => items[index]?.id ?? `#${index}`, [items]);

  const estimates = useMemo(() => {
    if (!estimateOf) return undefined;
    const m = new Map<string, number>();
    for (const it of items) m.set(it.id, estimateOf(it));
    return m;
  }, [items, estimateOf]);

  const {
    scrollRef,
    items: virtualItems,
    totalSize,
    onMeasure,
    scrollToIndex,
    scrollToTop,
  } = useVirtualList({
    count: items.length,
    estimateSize,
    estimates,
    gap,
    getKey,
    overscan: 6,
    mode,
  });

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = { scrollToIndex, scrollToTop };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, scrollToIndex, scrollToTop]);

  return (
    <div
      ref={scrollRef}
      className={isWindow ? className : `cmt-scroll ${className}`}
      style={isWindow ? style : { maxHeight, ...style }}
    >
      <div style={{ height: totalSize, position: "relative" }} role="list">
        {virtualItems.map((v) => (
          <VirtualRow key={v.key} itemKey={v.key} top={v.start} onMeasure={onMeasure}>
            {renderItem(items[v.index], v.index)}
          </VirtualRow>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   虚拟行：只负责定位与上报自身高度
   全列表共享一个 ResizeObserver，避免每次挂载新行都创建观察器
   -------------------------------------------------------------------------- */

const rowCallbacks = new WeakMap<Element, () => void>();
let sharedObserver: ResizeObserver | null = null;

function getSharedObserver(): ResizeObserver {
  if (!sharedObserver) {
    sharedObserver = new ResizeObserver((entries) => {
      for (const entry of entries) rowCallbacks.get(entry.target)?.();
    });
  }
  return sharedObserver;
}

function watchRow(el: Element, report: () => void) {
  rowCallbacks.set(el, report);
  getSharedObserver().observe(el);
}

function unwatchRow(el: Element) {
  sharedObserver?.unobserve(el);
  rowCallbacks.delete(el);
}

function VirtualRow({
  itemKey,
  top,
  onMeasure,
  children,
}: {
  itemKey: string;
  top: number;
  onMeasure: (key: string, height: number) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onMeasure(itemKey, el.getBoundingClientRect().height);
    // ResizeObserver 在 observe 后会立即回调一次，因此无需同步测量
    watchRow(el, report);
    return () => unwatchRow(el);
  }, [itemKey, onMeasure]);

  return (
    <div ref={ref} className="cmt-row" style={{ top }} role="listitem">
      {children}
    </div>
  );
}
