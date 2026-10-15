import SiteHeader from "./SiteHeader";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { LightboxProvider } from "./Lightbox";

/**
 * 全站布局骨架：点阵背景 + 吸顶导航 + 内容 + 页脚 + 移动端底部导航。
 * 灯箱 Provider 包裹全部，使任意页面照片可放大。
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <LightboxProvider>
      <div className="dot-grid pointer-events-none fixed inset-0 z-0" />
      {/* 吸顶导航 */}
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full flex-1 px-5" style={{ maxWidth: 1100 }}>
        {children}
      </main>
      {/* 页脚 */}
      <Footer />
      {/* 移动端底部导航 */}
      <MobileNav />
    </LightboxProvider>
  );
}
