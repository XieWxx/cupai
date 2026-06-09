# CupAI 后端 Dockerfile
# 多阶段构建：构建 → 生产镜像

# 阶段1: 构建
FROM node:20-alpine AS builder
# 固定 pnpm 9.x（pnpm 11 + Node 20.20 在 alpine 存在 ERR_UNKNOWN_BUILTIN_MODULE 兼容问题）
RUN corepack disable && npm install -g pnpm@9.15.4 --silent
WORKDIR /app

# 复制根配置
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY packages/types/package.json packages/types/
COPY packages/constants/package.json packages/constants/
COPY packages/utils/package.json packages/utils/
COPY apps/server/package.json apps/server/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY packages/ packages/
COPY apps/server/ apps/server/

# 先构建 packages（@cupai/constants、@cupai/types、@cupai/utils），
# 否则 apps 引用 @cupai/* 时找不到 dist
RUN pnpm --filter "./packages/**" --workspace-concurrency=1 build

# 构建后端
RUN pnpm --filter @cupai/server build

# 阶段2: 生产镜像
FROM node:20-alpine AS production
RUN corepack disable && npm install -g pnpm@9.15.4 --silent
WORKDIR /app

# 在生产镜像中重新安装生产依赖（避开 pnpm symlink 跨阶段复制问题）
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json packages/types/
COPY packages/constants/package.json packages/constants/
COPY packages/utils/package.json packages/utils/
COPY apps/server/package.json apps/server/
# 复制已构建的 packages 产物
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/constants/dist ./packages/constants/dist
COPY --from=builder /app/packages/constants/package.json ./packages/constants/
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/packages/utils/package.json ./packages/utils/
# 复制后端构建产物
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# 复制健康检查脚本
COPY apps/server/healthcheck.js .

# 仅安装生产依赖（自动剔除 devDependencies）
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 环境变量
ENV NODE_ENV=production
ENV SERVER_PORT=3001

EXPOSE 3001

# 切换到 server 目录运行（让 Node.js 正确解析 apps/server/node_modules）
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
