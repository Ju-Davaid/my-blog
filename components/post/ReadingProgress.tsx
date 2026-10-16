"use client";

import { useEffect, useRef } from "react";

/**
 * 阅读进度条：固定在顶栏下方，随滚动填充。
 */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      if (barRef.current) barRef.current.style.width = p + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 top-12.5 z-50 h-0.5 w-full bg-transparent">
      <div ref={barRef} className="h-full bg-primary" style={{ width: 0 }} />
    </div>
  );
}
