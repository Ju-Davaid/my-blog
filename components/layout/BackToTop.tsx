"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

const SHOW_AFTER = 400; // 滚动多少像素后出现
const R = 18;
const CIRC = 2 * Math.PI * R;

/**
 * 回到顶部按钮
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const visibleRef = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      // 进度环：直接写样式，避免每帧 setState
      const ring = ringRef.current;
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - progress));

      const next = y > SHOW_AFTER;
      if (next !== visibleRef.current) {
        visibleRef.current = next;
        setVisible(next);
      }
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // 键盘可达性：滚动后把焦点交还给页面开头
    btnRef.current?.blur();
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toTop}
      aria-label="回到顶部"
      title="回到顶部"
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? 0 : -1}
      className={`fixed right-4 bottom-24 z-40 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] md:right-6 md:bottom-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {/* 阅读进度环 */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
        <circle
          ref={ringRef}
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          className="text-primary"
        />
      </svg>
      <Icon name="chevron-up" className="relative h-4 w-4" />
    </button>
  );
}
