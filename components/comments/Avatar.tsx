"use client";

import Image from "next/image";

type AvatarProps = {
  src: string;
  alt: string;
  /** 像素尺寸（正方） */
  size?: number;
  className?: string;
};

/**
 * 评论头像。列表行由虚拟滚动复用，因此用固定尺寸 + 懒加载，避免布局抖动。
 */
export default function Avatar({ src, alt, size = 32, className = "" }: AvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full border border-border bg-muted object-cover ${className}`}
    />
  );
}
