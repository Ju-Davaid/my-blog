import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteShell } from "@/components/layout";
import themeInitScript from "@/assets/images/script/theme.js";
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
      <body className="flex min-h-screen flex-col pb-24 font-sans antialiased md:pb-0">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
