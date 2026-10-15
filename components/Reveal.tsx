import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** 已废弃：保留以兼容旧调用（moments 页），当前 CSS 方案下不生效 */
  delay?: number;
};

/**
 * 滚动显现容器。
 * 动画由 globals.css 中 CSS 原生滚动驱动动画（animation-timeline: view()）实现，
 * 本组件只负责附加 .reveal 类——纯服务端渲染，零客户端 JS，
 * 不存在水合时序问题；客户端导航时新内容同样自动生效。
 */
export default function Reveal({ children, className = "" }: RevealProps) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
