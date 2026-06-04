# 贡献指南 / Contributing Guide

感谢你关注 CupAI 项目！我们非常欢迎各种形式的贡献。本文档将帮助你快速上手参与项目开发。

Thank you for your interest in contributing to CupAI! We welcome contributions of all kinds. This guide will help you get started quickly.

---

## 📋 目录 / Table of Contents

- [行为准则 / Code of Conduct](#-行为准则--code-of-conduct)
- [如何贡献 / How to Contribute](#-如何贡献--how-to-contribute)
- [开发环境搭建 / Development Setup](#-开发环境搭建--development-setup)
- [分支规范 / Branch Convention](#-分支规范--branch-convention)
- [提交规范 / Commit Convention](#-提交规范--commit-convention)
- [代码规范 / Code Style](#-代码规范--code-style)
- [Pull Request 流程](#-pull-request-流程)
- [Issue 规范](#-issue-规范)

---

## 📜 行为准则 / Code of Conduct

本项目采用 [贡献者公约](./CODE_OF_CONDUCT.md)，所有参与者均需遵守。请确保以尊重、包容、建设性的态度参与社区讨论与协作。

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). All participants are expected to treat each other with respect, inclusivity, and constructive intent.

---

## 🎯 如何贡献 / How to Contribute

### 你可以参与的方式 / Ways You Can Contribute

| 类型 | 描述 | 适合人群 |
|------|------|---------|
| 🐛 **Bug 修复** | 修复已知 Bug、功能异常 | 有调试经验的开发者 |
| ✨ **新功能** | 开发新特性、新模块 | 全栈开发者 |
| 📝 **文档** | 完善 API 文档、教程、注释 | 所有人 |
| 🌍 **国际化** | 翻译 UI 文案、文档 | 多语言能力者 |
| 🎨 **UI/UX** | 优化页面设计、交互体验 | 前端/设计师 |
| 🧪 **测试** | 编写单元测试、E2E 测试 | 有测试经验的开发者 |
| 💡 **反馈** | 提交 Issue、功能建议 | 所有人 |
| 📣 **推广** | 分享 Prompt 模板、邀请贡献者 | 社区爱好者 |

### 新手友好 / Beginner Friendly

带有 `good first issue` 标签的 Issue 是特别为新手准备的入门任务，欢迎从中选择。

Look for issues tagged with `good first issue` — these are specifically reserved for newcomers.

---

## 🛠 开发环境搭建 / Development Setup

### 前置要求 / Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** (可选，用于快速搭建开发环境 / optional)

### 本地开发步骤 / Local Development Steps

```bash
# 1. 克隆仓库 / Clone
git clone https://github.com/cupai/cupai.git
cd cupai

# 2. 安装依赖 / Install dependencies
pnpm install

# 3. 配置环境变量 / Setup environment
cp .env.example .env
# 编辑 .env 填入本地数据库配置

# 4. 初始化数据库 / Initialize database
pnpm db:migrate

# 5. 启动后端 / Start backend (http://localhost:3001)
pnpm dev:server

# 6. 新终端，启动前端 / New terminal, start frontend (http://localhost:5173)
pnpm dev:web
```

### Docker 快速启动 / Docker Quick Start

```bash
docker compose up -d
# 后端: http://localhost:3001
# 前端: http://localhost:5173
```

---

## 🌿 分支规范 / Branch Convention

| 分支类型 | 命名格式 | 说明 |
|---------|---------|------|
| `main` | — | 稳定发布分支，只接受 PR 合入 |
| `develop` | — | 开发主分支 |
| `feat/*` | `feat/user-auth` | 新功能开发 |
| `fix/*` | `fix/login-error` | Bug 修复 |
| `docs/*` | `docs/api-guide` | 文档更新 |
| `refactor/*` | `refactor/ai-module` | 代码重构 |
| `i18n/*` | `i18n/es-translate` | 国际化翻译 |

---

## 📝 提交规范 / Commit Convention

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，提交信息格式如下：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖更新 |
| `i18n` | 国际化翻译 |

### 示例 / Examples

```bash
git commit -m "feat(auth): add user registration with email verification"
git commit -m "fix(ai): resolve API key encryption issue on transfer"
git commit -m "docs(readme): add Chinese quick start guide"
git commit -m "i18n(web): add Spanish UI translations"
```

---

## 💻 代码规范 / Code Style

### 通用规范 / General Rules

- 全项目统一使用 **TypeScript**，禁止 `any` 类型
- **2 空格缩进**，不使用 Tab
- 行宽 ≤ 120 字符
- 函数/类/复杂逻辑必须附带 **中文注释**
- 敏感信息（密钥、密码）**绝不硬编码**，使用环境变量

### 代码检查 / Lint & Format

```bash
# 代码检查 / Lint
pnpm lint

# 自动修复 / Auto-fix
pnpm lint:fix

# 格式化 / Format
pnpm format
```

### 项目结构规范 / Project Structure

- 前端页面组件放在 `apps/web/src/views/`
- 可复用组件放在 `apps/web/src/components/`
- 后端业务模块放在 `apps/server/src/modules/`
- 共享类型定义放在 `packages/types/`
- 每个新模块必须包含单元测试

---

## 🔄 Pull Request 流程

1. **Fork** 本仓库到个人 GitHub
2. 基于 `develop` 分支创建你的特性分支
3. 开发完成后确保通过 lint 和测试：

   ```bash
   pnpm lint
   pnpm test
   ```

4. 提交 PR 到 `develop` 分支
5. PR 标题遵循 Conventional Commits 规范
6. PR 描述中清晰说明：
   - 做了什么改动 / What was changed
   - 为什么做这个改动 / Why it was changed
   - 如何测试 / How to test

### PR 审核标准 / Review Criteria

- 代码通过 CI 检查（lint + test）
- 至少 1 位维护者 Approve
- 新功能必须包含测试用例
- 涉及 UI 改动需附带截图

---

## 📋 Issue 规范

### Bug Report 模板

提交 Bug 时请包含以下信息：

- **环境信息**：操作系统、Node 版本、浏览器版本
- **复现步骤**：如何触发该 Bug
- **期望行为**：正确的行为应该是什么
- **实际行为**：实际发生了什么
- **截图/日志**：如有，请附上

### Feature Request 模板

提交功能建议时请包含：

- **功能描述**：清晰描述你希望添加的功能
- **使用场景**：描述这个功能在什么场景下使用
- **预期效果**：期望达到的效果

---

## 🏅 贡献者认可 / Contributor Recognition

所有贡献者均会在项目 README 和 [贡献者列表](https://github.com/cupai/cupai/graphs/contributors) 中展示。

持续贡献者可申请成为项目 Maintainer，获得仓库写权限。

---

> **有任何问题？** 欢迎在 [Discussions](https://github.com/cupai/cupai/discussions) 提问！
>
> **Have questions?** Feel free to ask in [Discussions](https://github.com/cupai/cupai/discussions)!