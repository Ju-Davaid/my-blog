import type { CSSProperties } from "react";
import { ICONS, type IconName } from "@/lib/data";

type IconProps = {
  name: IconName;
  className?: string;
  /** 允许覆盖 fill 等表现属性（如点亮实心心形） */
  style?: CSSProperties;
};

/**
 * 内联 SVG 图标组件（stroke 风格，取自 Lucide）。
 * 无需客户端环境，可在服务端组件中直接使用。
 */
export default function Icon({ name, className = "h-4 w-4", style }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? "" }}
    />
  );
}
