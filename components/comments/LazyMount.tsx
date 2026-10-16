"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ==========================================================================
   进入视口后再挂载
   --------------------------------------------------------------------------
   评论区首次展开要生成上万条数据，放在首屏之外延后执行，
   既不拖慢文章本身的首屏，也不会在用户没滚到评论区时白干活。
   ========================================================================== */

type LazyMountProps = {
  children: ReactNode;
  /** 占位高度，避免挂载瞬间的布局跳动 */
  minHeight?: number;
  /** 提前多少像素开始预生成 */
  rootMargin?: string;
  className?: string;
};

export default function LazyMount({
  children,
  minHeight = 260,
  rootMargin = "400px 0px",
  className = "",
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
