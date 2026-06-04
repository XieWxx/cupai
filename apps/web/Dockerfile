# CupAI 前端 Dockerfile
# 多阶段构建：构建 → Nginx 静态服务

# 阶段1: 构建
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制根配置
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json packages/types/
COPY packages/constants/package.json packages/constants/
COPY packages/utils/package.json packages/utils/
COPY apps/web/package.json apps/web/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY packages/ packages/
COPY apps/web/ apps/web/

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
