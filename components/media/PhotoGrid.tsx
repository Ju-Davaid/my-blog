"use client";

import { useLightbox } from "./Lightbox";
import type { Photo } from "@/lib/data";

type PhotoGridProps = {
  photos: Photo[];
  /** 九宫格样式（朋友圈）：1/2/3/4 张自适应列数；否则为瀑布流单张 */
  variant?: "masonry" | "moment";
  /** 瀑布流列数对应的 tailwind 类，仅 masonry 生效 */
  masonryClassName?: string;
};

/**
 * 照片网格：点击任意照片唤起灯箱。
 * - moment：微信朋友圈式九宫格（1 张 16:10、2/4 张两列、3 张三列）
 * - masonry：瀑布流（用于相册照片墙与精选）
 */
export default function PhotoGrid({
  photos,
  variant = "moment",
  masonryClassName = "columns-1 gap-4 sm:columns-2 lg:columns-3",
}: PhotoGridProps) {
  const { open } = useLightbox();

  const handleOpen = (i: number) => {
    open(
      photos.map((p) => ({ src: p.full, caption: p.caption })),
      i
    );
  };

  if (variant === "moment") {
    const n = photos.length;
    const gridClass =
      n === 1 ? "n1" : n === 2 || n === 4 ? "n2" : "n3";
    return (
      <div className={`mom-grid ${gridClass} mt-3`}>
        {photos.map((p, i) => (
          <img
            key={i}
            src={p.thumb}
            alt={p.caption}
            loading="lazy"
            onClick={() => handleOpen(i)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${masonryClassName} [&>figure]:mb-4`}>
      {photos.map((p, i) => (
        <figure key={i} className="album-item card card-hover group overflow-hidden">
          <button
            type="button"
            className="album-thumb"
            onClick={() => handleOpen(i)}
            aria-label={`查看照片：${p.caption}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt={p.caption} loading="lazy" />
          </button>
          <figcaption className="px-3 py-2.5 text-xs text-muted-foreground">
            {p.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
