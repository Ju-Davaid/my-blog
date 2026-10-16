import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 产出 standalone 产物（含最小化 node_modules），供 Docker 镜像使用
  // 本地 `next dev` / `next start` 不受影响，部署到 Vercel 时该配置会被忽略
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fonts.googleapis.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
