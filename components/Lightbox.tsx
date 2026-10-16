"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Icon from "./Icon";
import Image from "next/image";

type LightboxItem = { src: string; caption?: string };

type LightboxContextValue = {
  open: (items: LightboxItem[], index?: number) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

/**
 * 灯箱 Provider：提供 open() 给任意照片触发放大查看。
 * 支持 Esc 关闭、←/→ 切换、触屏滑动、点击空白关闭。
 */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const startX = useRef<number | null>(null);

  const show = useCallback(
    (i: number) => {
      if (!items.length) return;
      const idx = (i + items.length) % items.length;
      setSwapping(true);
      setIndex(idx);
      // 短暂闪烁后恢复，模拟预加载切换
      window.setTimeout(() => setSwapping(false), 180);
    },
    [items.length],
  );

  const open = useCallback((list: LightboxItem[], i = 0) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setItems(list);
    setIndex(i);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
    lastFocus.current?.focus?.();
  }, []);

  // 键盘事件
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, index, show, close]);

  const current = items[index];

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="照片查看"
        className={`lightbox ${isOpen ? "is-open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
          startX.current = null;
        }}
      >
        <button
          type="button"
          className="lightbox-btn lightbox-close"
          onClick={close}
          aria-label="关闭"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="lightbox-btn lightbox-prev"
          onClick={() => show(index - 1)}
          aria-label="上一张"
        >
          <Icon name="chevron-left" className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="lightbox-btn lightbox-next"
          onClick={() => show(index + 1)}
          aria-label="下一张"
        >
          <Icon name="chevron-right" className="h-5 w-5" />
        </button>

        {current && (
          <Image
            src={current.src}
            width={1200}
            height={1200}
            alt={current.caption ?? ""}
            className={swapping ? "is-swapping" : ""}
          />
        )}

        <div className="lightbox-meta">
          <span className="lb-caption">{current?.caption ?? ""}</span>
          <span className="lb-counter">
            {items.length ? `${index + 1} / ${items.length}` : ""}
          </span>
        </div>
      </div>
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox 必须在 LightboxProvider 内使用");
  }
  return ctx;
}
