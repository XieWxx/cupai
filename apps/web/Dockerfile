# CupAI 前端 Dockerfile
# 多阶段构建：构建 → Nginx 静态服务

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
COPY apps/web/package.json apps/web/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY packages/ packages/
COPY apps/web/ apps/web/

# 接收构建期环境变量（生产环境通过 docker-compose 注入）
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_WS_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# 先构建 packages（@cupai/constants、@cupai/types、@cupai/utils），
# 否则前端 vue-tsc 类型检查会找不到 @cupai/* 模块
RUN pnpm --filter "./packages/**" --workspace-concurrency=1 build

# 构建前端
RUN pnpm --filter @cupai/web build

# 阶段2: Nginx 静态服务
FROM nginx:alpine AS production

# 复制自定义 Nginx 配置
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
