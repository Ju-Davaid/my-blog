import type { NextConfig } from "next";

// 仅在 Docker 构建时（NEXT_STANDALONE=1）产出 standalone 产物，
// 否则本地 `next start` 会因 standalone 配置不可用。
const standalone = process.env.NEXT_STANDALONE === "1";

const nextConfig: NextConfig = {
  output: standalone ? "standalone" : undefined,
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
