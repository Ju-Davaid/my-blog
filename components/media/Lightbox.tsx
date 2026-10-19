"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PanInfo, Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Icon } from "@/components/ui";

type LightboxItem = { src: string; caption?: string };

type LightboxContextValue = {
  open: (items: LightboxItem[], index?: number) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

/** 切换方向的滑动变体：向 → 翻页时，新图从右侧进、旧图向左侧出 */
const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    scale: 0.98,
  }),
  center: { x: 0, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    scale: 0.98,
  }),
};

/** 大位移用缓出曲线而非弹簧：起点快、末段稳，不会有二次回弹的“顿挫感” */
const slideTransition = {
  x: { type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  scale: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
} as const;

/** 拖拽判定阈值：距离(px) + 速度权重，轻甩也能切页 */
const SWIPE_DISTANCE = 64;
const SWIPE_VELOCITY = 0.15;

/**
 * 灯箱 Provider：提供 open() 给任意照片触发放大查看。
 * 支持 Esc 关闭、←/→ 切换、拖拽滑动切换（motion/react 方向感转场）、点击空白关闭。
 */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  /** 1 = 向后翻（内容从右进），-1 = 向前翻（内容从左进） */
  const [direction, setDirection] = useState(1);
  const lastFocus = useRef<HTMLElement | null>(null);
  const dragEndAt = useRef(0);

  const show = useCallback(
    (target: number) => {
      if (items.length < 2) return;
      // 先按未取模的目标值判断方向，循环切换时方向才不会反
      setDirection(target > index ? 1 : -1);
      setIndex((target + items.length) % items.length);
    },
    [items.length, index],
  );

  const open = useCallback((list: LightboxItem[], i = 0) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setItems(list);
    setIndex(i);
    setDirection(1);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
    lastFocus.current?.focus?.();
  }, []);

  // 预加载前后两张，滑动过程中不出现空白帧
  useEffect(() => {
    if (!isOpen || items.length < 2) return;
    for (const offset of [-1, 1]) {
      const next = items[(index + offset + items.length) % items.length];
      if (!next) continue;
      const img = new window.Image();
      img.src = next.src;
    }
  }, [isOpen, index, items]);

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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragEndAt.current = Date.now();
    // 位移 + 速度共同决定，快速轻甩即可翻页
    const power = info.offset.x + info.velocity.x * SWIPE_VELOCITY;
    if (power < -SWIPE_DISTANCE) show(index + 1);
    else if (power > SWIPE_DISTANCE) show(index - 1);
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 拖拽结束紧接着触发的 click 不要当成“点空白关闭”
    if (Date.now() - dragEndAt.current < 300) return;
    const el = e.target as HTMLElement;
    if (el.closest(".lightbox-btn") || el.closest(".lightbox-meta")) return;
    // 图片自身是 pointer-events:none，命中的总是满屏滑块，
    // 因此只能按坐标判断点击点是否落在图片范围内
    const img = e.currentTarget.querySelector<HTMLImageElement>(".lightbox-slide img");
    if (img) {
      const r = img.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        return;
      }
    }
    close();
  };

  const current = items[index];

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="照片查看"
        className={`lightbox ${isOpen ? "is-open" : ""}`}
        onClick={onBackdropClick}
      >
        <button
          type="button"
          className="lightbox-btn lightbox-close "
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

        <div className="lightbox-stage">
          <AnimatePresence initial={false} custom={direction}>
            {current && (
              <motion.div
                key={index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                drag={items.length > 1 ? "x" : false}
                dragSnapToOrigin
                dragMomentum={false}
                onDragEnd={onDragEnd}
                className="lightbox-slide"
              >
                <Image
                  src={current.src}
                  width={1200}
                  height={1200}
                  alt={current.caption ?? ""}
                  draggable={false}
                  className="pointer-events-none select-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
