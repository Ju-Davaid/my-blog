import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** 已废弃：保留以兼容旧调用（moments 页），当前 CSS 方案下不生效 */
  delay?: number;
};

/**
 * 滚动显现容器。
 */
export default function Reveal({ children, className = "" }: RevealProps) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
