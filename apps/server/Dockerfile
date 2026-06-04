# CupAI 后端 Dockerfile
# 多阶段构建：构建 → 生产镜像

# 阶段1: 构建
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制根配置
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json packages/types/
COPY packages/constants/package.json packages/constants/
COPY packages/utils/package.json packages/utils/
COPY apps/server/package.json apps/server/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY packages/ packages/
COPY apps/server/ apps/server/

# 构建
RUN pnpm --filter @cupai/server build

# 阶段2: 生产镜像
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# 环境变量
ENV NODE_ENV=production
ENV SERVER_PORT=3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
