ARG NODE_VERSION=24.4.0

# ============================ 基础镜像（公共层） ===========================
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
# 依据 package.json 的 packageManager 字段自动准备对应版本 pnpm
RUN corepack enable

# ============================ 1. 安装依赖 ================================
FROM base AS deps
# 先只拷清单文件，源码改动时可命中上一层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --frozen-lockfile：锁文件与 package.json 不一致时直接失败，保证构建可复现
RUN pnpm install --frozen-lockfile

# ============================ 2. 构建 ====================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ============================ 3. 运行 ====================================
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# 以非 root 用户运行
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# standalone 产物：已包含运行时所需的最小 node_modules（含图片优化用的 sharp）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# standalone 不会自动带上这两份资源，需手动拷回
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 运行时需要可写目录（图片优化缓存 / ISR 缓存），提前建好并交给 nextjs
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# standalone 入口（等价于 next start，但不依赖完整 node_modules）
CMD ["node", "server.js"]
