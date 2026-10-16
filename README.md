# DAVAID BLOG

基于 **Next.js 16 + Tailwind CSS v4** 的个人博客。

## 技术栈

| 项     | 说明                                                      |
| ------ | --------------------------------------------------------- |
| 框架   | Next.js 16（App Router）+ React 19                        |
| 样式   | Tailwind CSS v4（`@tailwindcss/turbopack`，CSS 变量换肤） |
| 语言   | TypeScript                                                |
| 包管理 | pnpm                                                      |
| 字体   | Noto Sans SC / Noto Serif SC（`next/font/google`）        |

## 快速开始

```bash
pnpm install   # 安装依赖
pnpm dev       # 开发模式
pnpm build     # 生产构建
pnpm start     # 启动生产服务
```

> 支持查询参数强制主题：`/?theme=dark`（可选 light / dark / system）。

## Docker 部署

```bash
docker build -t my-blog:latest .                 # 构建镜像
docker run -d --name blog -p 3000:3000 my-blog:latest   # 启动容器
# 打开 http://localhost:3000
```

镜像采用多阶段构建（依赖 → 构建 → 运行），运行阶段基于 `node:22-slim` + Next.js `standalone` 产物，以非 root 用户运行，并内置健康检查。

| 构建参数 / 环境变量    | 默认值       | 说明                                  |
| ---------------------- | ------------ | ------------------------------------- |
| `NODE_VERSION`（build-arg） | `24.4.0` | 基础镜像的 Node 版本                  |
| `PORT`（env）          | `3000`       | 容器内监听端口（`HOSTNAME=0.0.0.0`）  |
| `NEXT_TELEMETRY_DISABLED`   | `1`     | 已在镜像内关闭 Next.js 遥测           |

示例：指定 Node 版本与端口

```bash
docker build --build-arg NODE_VERSION=22 -t my-blog:latest .
docker run -d -p 8080:3000 -e PORT=3000 my-blog:latest
```

实测：镜像约 **412 MB**，容器以 `nextjs`(uid 1001) 非 root 运行，健康检查 `healthy`，`/`、`/moments`、`/articles`、`/albums`、`/about`、`/posts/[slug]` 均 200，`/_next/image` 图片优化（sharp）正常。

> 若构建时拉取基础镜像或依赖较慢，可给 Docker 配置镜像加速（registry mirror）后再构建。

## 页面路由

| 路由            | 说明                                                   |
| --------------- | ------------------------------------------------------ |
| `/`             | 首页：首屏、数据、置顶、最新文章、标签云、归档时间线   |
| `/articles`     | 文章列表：关键词搜索 + 标签筛选                        |
| `/posts/[slug]` | 文章详情：阅读进度条、目录侧栏、正文排版               |
| `/moments`      | 动态：朋友圈式信息流（左资料卡 + 中信息流 + 右时间轴） |
| `/albums`       | 相册：封面网格 + 精选瀑布流                            |
| `/albums/[id]`  | 相册详情：照片墙 + 灯箱 + 上/下一个相册                |
| `/about`        | 关于：自我介绍、工具箱、站点说明、友链                 |

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

