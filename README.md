# MORI BLOG

基于 **Next.js 16 + Tailwind CSS v4** 的个人博客，由原静态站（`D:/my_project/blog`）迁移而来。

设计风格复刻自 [shijiucode.cn](https://shijiucode.cn/)：雾霾蓝主色 + 暖棕金点缀、Noto Serif SC 标题、
点阵网格背景、毛玻璃吸顶导航、时间线归档，以及完整的 light / dark / system 三态主题。

## 技术栈

| 项 | 说明 |
| --- | --- |
| 框架 | Next.js 16（App Router）+ React 19 |
| 样式 | Tailwind CSS v4（`@tailwindcss/turbopack`，CSS 变量换肤） |
| 语言 | TypeScript |
| 包管理 | pnpm |
| 字体 | Noto Sans SC / Noto Serif SC（`next/font/google`） |

## 快速开始

```bash
pnpm install   # 安装依赖
pnpm dev       # 开发模式 http://localhost:3000
pnpm build     # 生产构建
pnpm start     # 启动生产服务
```

> 支持查询参数强制主题：`/?theme=dark`（可选 light / dark / system）。

## 页面路由

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：首屏、数据、置顶、最新文章、标签云、归档时间线 |
| `/articles` | 文章列表：关键词搜索 + 标签筛选 |
| `/posts/[slug]` | 文章详情：阅读进度条、目录侧栏、正文排版 |
| `/moments` | 动态：朋友圈式信息流（左资料卡 + 中信息流 + 右时间轴） |
| `/albums` | 相册：封面网格 + 精选瀑布流 |
| `/albums/[id]` | 相册详情：照片墙 + 灯箱 + 上/下一个相册 |
| `/about` | 关于：自我介绍、工具箱、站点说明、友链 |

## 目录结构

```
├── app/                    # App Router 页面
│   ├── layout.tsx          # 根布局：字体、元数据、主题防闪烁脚本
│   ├── page.tsx            # 首页
│   ├── globals.css         # 设计令牌与组件样式
│   ├── articles/page.tsx   # 文章列表
│   ├── posts/[slug]/page.tsx
│   ├── moments/page.tsx
│   ├── albums/page.tsx
│   ├── albums/[id]/page.tsx
│   └── about/page.tsx
├── components/             # 公共组件（组件筛分）
│   ├── SiteShell.tsx       # 全站骨架：点阵背景 + header + footer + mobile-nav + 灯箱
│   ├── SiteHeader.tsx      # 吸顶导航 + 更多下拉
│   ├── Footer.tsx
│   ├── MobileNav.tsx       # 移动端底部胶囊导航
│   ├── ThemeToggle.tsx     # 主题三态切换按钮
│   ├── Icon.tsx            # 内联 SVG 图标
│   ├── Reveal.tsx          # 滚动显现动画
│   ├── Lightbox.tsx        # 灯箱 Provider + useLightbox
│   ├── PhotoGrid.tsx       # 照片网格（九宫格 / 瀑布流）
│   ├── PostCard.tsx        # 文章卡片
│   └── ReadingProgress.tsx # 阅读进度条
└── lib/
    └── data.ts             # 站点数据层（SITE/文章/相册/动态/统计）
```

## 组件筛分原则

1. **服务端组件优先**：`Icon`、`Footer`、`PostCard` 无状态、无交互，作为 Server Component，减少客户端 JS。
2. **交互组件标记 `'use client'`**：`SiteHeader`（滚动态）、`ThemeToggle`、`MobileNav`（usePathname）、
   `Reveal`（IntersectionObserver）、`Lightbox`、`PhotoGrid`、`ReadingProgress`、文章搜索筛选页。
3. **数据与 UI 分离**：所有站点内容（导航、文章、相册、动态、统计）收敛到 `lib/data.ts`，改数据不改组件。
4. **状态共享走 Context**：灯箱通过 `LightboxProvider` + `useLightbox` 供任意照片组件调用，避免 props 层层透传。

## 主题实现

三态主题（浅色 / 深色 / 跟随系统）沿用原站的 CSS 变量方案：

- `app/globals.css` 定义 `:root`（亮色）与 `.dark`（暗色）两套变量，`@theme inline` 映射为工具类。
- 根布局注入内联脚本，在首帧前读取 `?theme=` / `localStorage` 并写入 `<html>` 的 class，避免闪烁。
- `ThemeToggle` 组件按 light → dark → system 循环切换，跟随系统时监听 `prefers-color-scheme` 变化。

## 个性化

- **站点信息 / 内容**：改 `lib/data.ts`（导航、文章、相册、动态、统计）。
- **配色**：改 `app/globals.css` 的 `:root` 与 `.dark` 变量。
- **照片**：当前使用 `picsum.photos` 占位，替换为本地图片时改 `lib/data.ts` 中的 `thumb` / `full` 路径。
