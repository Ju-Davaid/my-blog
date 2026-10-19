import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteShell } from "@/components/layout";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// 全局元数据
export const metadata: Metadata = {
  title: {
    default: "DAVAID BLOG",
    template: "DAVAID BLOG - %s",
  },
  description: "DAVAID的个人博客 —— 编程、工作、日常与生活的记录。",
  applicationName: "DAVAID BLOG",
  keywords: [
    "Davaid.Ju",
    "Davaid.Ju个人博客",
    "DAVAID",
    "DAVAID个人博客",
    "davaid",
    "davaid个人博客",
    "Davaid",
    "Davaid个人博客",
    "鞠先锋",
    "鞠先峰",
    "编程",
    "code",
  ],
};

/* 主题防闪烁脚本：在首帧渲染前确定 light / dark / system 并写入 <html> */
const themeInitScript = `
(function () {
  try {
    var p = new URLSearchParams(location.search).get("theme")
      || localStorage.getItem("mori-theme")
      || "system";
    var d = p === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : p;
    var el = document.documentElement;
    el.classList.remove("light", "dark");
    el.classList.add(d);
    el.style.colorScheme = d;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${notoSans.variable} ${notoSerif.variable} light`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      {/* body 上不要写 overflow-x-hidden —— 横向裁剪统一放在 globals.css 的 html 上，
          否则 html 的 overflow 非 visible 时 body 会变成滚动容器，header 的 sticky 会失效 */}
      <body className="flex min-h-screen flex-col pb-24 font-sans antialiased md:pb-0">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
